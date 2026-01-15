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
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  };
}

// Helper function for logging
const logStep = (step: string, details?: Record<string, unknown>) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CHAT-AI] ${step}${detailsStr}`);
};

// Plan limits configuration
const TIER_LIMITS: Record<string, number> = {
  free: 5,
  basic: 50,
  pro: 200,
  premium: -1, // unlimited
};

// Input validation schema
const messageSchema = z.object({
  role: z.enum(["user", "assistant", "system"]),
  content: z.union([
    z.string().min(1).max(50000),
    z.array(z.object({
      type: z.enum(["text", "image_url"]),
      text: z.string().max(50000).optional(),
      image_url: z.object({ url: z.string() }).optional()
    }))
  ])
});

const requestSchema = z.object({
  messages: z.array(messageSchema).min(1).max(100)
});

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify user authentication
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Brak autoryzacji" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      logStep("Auth error", { error: authError?.message });
      return new Response(JSON.stringify({ error: "Nieautoryzowany dostęp" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    logStep("Authenticated user", { userId: user.id });

    // Check user's subscription tier
    const { data: subscription } = await supabaseAdmin
      .from("subscriptions")
      .select("tier")
      .eq("user_id", user.id)
      .eq("is_active", true)
      .single();

    const tier = subscription?.tier || "free";
    const limit = TIER_LIMITS[tier] || 5;

    logStep("User tier", { tier, limit });

    // Check today's usage (skip for premium/unlimited users)
    if (limit !== -1) {
      const today = new Date().toISOString().split("T")[0];
      
      const { data: usage } = await supabaseAdmin
        .from("user_usage")
        .select("messages_count, id")
        .eq("user_id", user.id)
        .eq("usage_date", today)
        .single();

      const currentCount = usage?.messages_count || 0;

      if (currentCount >= limit) {
        logStep("Usage limit exceeded", { currentCount, limit, tier });
        return new Response(
          JSON.stringify({ 
            error: `Osiągnięto dzienny limit ${limit} wiadomości dla planu ${tier}. Ulepsz plan, aby uzyskać więcej!` 
          }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Increment usage counter
      if (usage) {
        await supabaseAdmin
          .from("user_usage")
          .update({ messages_count: currentCount + 1 })
          .eq("id", usage.id);
      } else {
        await supabaseAdmin
          .from("user_usage")
          .insert({ user_id: user.id, usage_date: today, messages_count: 1 });
      }

      logStep("Usage incremented", { newCount: currentCount + 1 });
    }

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

    const { messages } = validation.data;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      logStep("LOVABLE_API_KEY is not configured");
      return new Response(
        JSON.stringify({ error: "Usługa tymczasowo niedostępna." }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const systemPrompt = `Jesteś asystentem prawnym AI o imieniu Papuga. Udzielasz profesjonalnych porad prawnych po polsku, specjalizując się w prawie polskim. 
Jesteś uprzejmy, dokładny i zawsze starasz się pomagać klientom w zrozumieniu ich sytuacji prawnej.
Twoje odpowiedzi są przejrzyste, strukturalne i oparte na aktualnym stanie prawnym w Polsce.
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
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      logStep("AI Gateway error", { status: response.status, error: errorText });
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Przekroczono limit zapytań. Spróbuj ponownie za chwilę." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Wymagane doładowanie kredytów AI." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      return new Response(
        JSON.stringify({ error: "Wystąpił błąd. Spróbuj ponownie później." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : String(e);
    logStep("Chat error", { error: errorMessage });
    return new Response(
      JSON.stringify({ error: "Wystąpił błąd. Spróbuj ponownie później." }),
      {
        status: 500,
        headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
      }
    );
  }
});
