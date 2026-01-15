import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://esm.sh/zod@3.23.8";

// CORS configuration
const allowedOrigins = [
  "https://radcaai.lovable.app",
  "https://id-preview--1ff3e7d4-6fce-45f4-946d-e754f87165c8.lovable.app",
  "http://localhost:5173",
  "http://localhost:3000",
  "http://localhost:8080"
];

function getCorsHeaders(request: Request): Record<string, string> {
  const origin = request.headers.get("origin") || "";
  const allowedOrigin = allowedOrigins.includes(origin) ? origin : allowedOrigins[0];
  
  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-session-id",
  };
}

// Helper function for logging
const logStep = (step: string, details?: Record<string, unknown>) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CHAT-AI-DEMO] ${step}${detailsStr}`);
};

// Input validation schema
const requestSchema = z.object({
  question: z.string().min(1).max(1000)
});

// Generate a hash of the question for caching
function hashQuestion(question: string): string {
  const normalized = question.toLowerCase().trim().replace(/\s+/g, ' ');
  let hash = 0;
  for (let i = 0; i < normalized.length; i++) {
    const char = normalized.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16);
}

// Get client IP hash for rate limiting
function getIpHash(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded ? forwarded.split(",")[0].trim() : "unknown";
  
  let hash = 0;
  for (let i = 0; i < ip.length; i++) {
    const char = ip.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16);
}

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Demo request received");

    // Use service role to access tables
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Parse and validate input
    const body = await req.json();
    const validation = requestSchema.safeParse(body);
    
    if (!validation.success) {
      logStep("Validation error", { errors: validation.error.issues });
      return new Response(
        JSON.stringify({ error: "Nieprawidłowe dane wejściowe" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { question } = validation.data;
    const sessionId = req.headers.get("x-session-id") || "unknown";
    const ipHash = getIpHash(req);
    const questionHash = hashQuestion(question);

    logStep("Processing demo request", { ipHash, sessionId, questionHash });

    // Rate limiting: Check if this IP/session has already used demo
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    
    const { data: existingUsage } = await supabaseAdmin
      .from("demo_rate_limits")
      .select("id")
      .eq("ip_hash", ipHash)
      .gte("used_at", oneHourAgo)
      .limit(1);

    if (existingUsage && existingUsage.length > 0) {
      logStep("Rate limit exceeded", { ipHash });
      return new Response(
        JSON.stringify({ 
          error: "Demo już wykorzystane. Zarejestruj się, aby uzyskać dostęp do pełnej wersji!" 
        }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check FAQ cache first
    const { data: cachedAnswer } = await supabaseAdmin
      .from("faq_cache")
      .select("answer, id, hit_count")
      .eq("question_hash", questionHash)
      .single();

    if (cachedAnswer) {
      logStep("Cache hit", { questionHash, hitCount: cachedAnswer.hit_count });
      
      // Update hit count
      await supabaseAdmin
        .from("faq_cache")
        .update({ hit_count: cachedAnswer.hit_count + 1 })
        .eq("id", cachedAnswer.id);
      
      // Record usage
      await supabaseAdmin
        .from("demo_rate_limits")
        .insert({ ip_hash: ipHash, session_id: sessionId, question_hash: questionHash });

      return new Response(
        JSON.stringify({ content: cachedAnswer.answer, cached: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    logStep("Cache miss, calling AI");

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      logStep("LOVABLE_API_KEY not configured");
      return new Response(
        JSON.stringify({ error: "Usługa tymczasowo niedostępna." }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const systemPrompt = `Jesteś asystentem prawnym AI o imieniu Papuga. Udzielasz krótkich, profesjonalnych porad prawnych po polsku.
To jest wersja demo - odpowiadaj zwięźle (maksymalnie 3-4 zdania), ale treściwie.
Na końcu zachęć do rejestracji, aby uzyskać bardziej szczegółową pomoc.
Pamiętaj, że Twoje porady mają charakter informacyjny i nie zastępują profesjonalnej porady prawnika.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: question },
        ],
        max_tokens: 500,
        stream: false,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      logStep("AI Gateway error", { status: response.status, error: errorText });
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Przekroczono limit zapytań. Spróbuj ponownie za chwilę." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: "Wystąpił błąd. Spróbuj ponownie później." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const aiResponse = await response.json();
    const answer = aiResponse.choices?.[0]?.message?.content || "";

    logStep("AI response received", { answerLength: answer.length });

    // Cache the answer for future use
    await supabaseAdmin
      .from("faq_cache")
      .insert({
        question_hash: questionHash,
        question_text: question,
        answer: answer,
      });

    // Record usage
    await supabaseAdmin
      .from("demo_rate_limits")
      .insert({ ip_hash: ipHash, session_id: sessionId, question_hash: questionHash });

    logStep("Demo completed successfully");

    return new Response(
      JSON.stringify({ content: answer, cached: false }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : String(e);
    logStep("Error in demo", { error: errorMessage });
    return new Response(
      JSON.stringify({ error: "Wystąpił błąd. Spróbuj ponownie później." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
