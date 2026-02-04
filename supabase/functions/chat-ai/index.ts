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
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");

    if (!OPENAI_API_KEY) {
      logStep("OPENAI_API_KEY is not configured");
      return new Response(
        JSON.stringify({ error: "Usługa tymczasowo niedostępna." }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const systemPrompt = `Jesteś RadcaAI - systemem wsparcia informacyjnego o polskim prawie. NIE jesteś prawnikiem i NIE udzielasz porad prawnych.

ZASADY ODPOWIEDZI:
1. ZAWSZE używaj zwrotów neutralnych informacyjnie:
   - "Zgodnie z przepisami art. X ustawy Y..."
   - "W świetle obowiązujących regulacji..."
   - "Przepisy prawa wskazują, że..."
   - "Na podstawie art. X Kodeksu Y..."
   
2. NIGDY nie używaj zwrotów sugerujących poradę:
   - NIE: "Radzę Ci...", "Powinieneś...", "Musisz...", "Zalecam..."
   - NIE: "Moim zdaniem...", "Uważam, że...", "Sugeruję..."

3. DLA SPRAW KRYTYCZNYCH (terminy zawite, sprawy karne, reprezentacja sądowa, sprawy pilne):
   - ZAWSZE dodaj na końcu odpowiedzi: "⚠️ WAŻNE: W tej sprawie zalecana jest niezwłoczna konsultacja z radcą prawnym lub adwokatem. Możesz znaleźć prawnika na stronie NRA (adwokatura.pl) lub KIRP (kirp.pl)."

4. Odpowiedzi formatuj w Markdown z nagłówkami i punktami.

5. Na końcu KAŻDEJ odpowiedzi dodaj:
   "---
   📋 *Powyższe informacje mają charakter wyłącznie edukacyjny i nie stanowią porady prawnej w rozumieniu ustawy o radcach prawnych oraz ustawy Prawo o adwokaturze.*"

6. Jeśli pytanie dotyczy konkretnej sprawy z konkretnymi faktami, podkreśl potrzebę indywidualnej konsultacji z prawnikiem.`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      logStep("OpenAI API error", { status: response.status, error: errorText });
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Przekroczono limit zapytań. Spróbuj ponownie za chwilę." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402 || response.status === 401) {
        return new Response(JSON.stringify({ error: "Problem z kluczem API. Skontaktuj się z administratorem." }), {
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
