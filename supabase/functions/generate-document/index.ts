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

// Valid document types
const validDocumentTypes = [
  "umowa_najmu",
  "umowa_o_prace", 
  "pelnomocnictwo",
  "oswiadczenie",
  "umowa_sprzedazy",
  "umowa_zlecenia"
] as const;

// Input validation schema
const requestSchema = z.object({
  documentType: z.enum(validDocumentTypes, {
    errorMap: () => ({ message: "Nieprawidłowy typ dokumentu" })
  }),
  details: z.string().min(10, "Szczegóły muszą mieć minimum 10 znaków").max(10000, "Szczegóły zbyt długie (max 10000 znaków)")
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

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      console.error("Auth error:", authError);
      return new Response(JSON.stringify({ error: "Nieautoryzowany dostęp" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("Authenticated user:", user.id);

    // Parse and validate input
    const body = await req.json();
    const validation = requestSchema.safeParse(body);
    
    if (!validation.success) {
      console.error("Validation error:", validation.error.issues);
      return new Response(
        JSON.stringify({ error: "Nieprawidłowe dane wejściowe" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { documentType, details } = validation.data;
    const GOOGLE_API_KEY = Deno.env.get("GOOGLE_API_KEY");

    if (!GOOGLE_API_KEY) {
      console.error("GOOGLE_API_KEY is not configured");
      return new Response(
        JSON.stringify({ error: "Usługa tymczasowo niedostępna." }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const templates: Record<string, string> = {
      umowa_najmu: "Wygeneruj profesjonalną umowę najmu lokalu mieszkalnego zgodną z polskim prawem. Uwzględnij następujące informacje:",
      umowa_o_prace: "Wygeneruj umowę o pracę zgodną z polskim Kodeksem pracy. Uwzględnij następujące informacje:",
      pelnomocnictwo: "Wygeneruj pełnomocnictwo zgodne z wymogami polskiego prawa cywilnego. Uwzględnij następujące informacje:",
      oswiadczenie: "Wygeneruj oświadczenie zgodne z wymogami polskiego prawa. Uwzględnij następujące informacje:",
      umowa_sprzedazy: "Wygeneruj umowę sprzedaży zgodną z polskim prawem cywilnym. Uwzględnij następujące informacje:",
      umowa_zlecenia: "Wygeneruj umowę zlecenia zgodną z polskim Kodeksem cywilnym. Uwzględnij następujące informacje:",
    };

    const prompt = templates[documentType];

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GOOGLE_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `${prompt}\n\n${details}\n\nWygeneruj kompletny dokument w formacie tekstowym, gotowy do druku.`,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 4096,
          },
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error("Gemini API error:", error);
      return new Response(
        JSON.stringify({ error: "Wystąpił błąd. Spróbuj ponownie później." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const document = data.candidates[0]?.content?.parts[0]?.text || "Nie udało się wygenerować dokumentu.";

    return new Response(
      JSON.stringify({ document }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (e) {
    console.error("generate-document error:", e);
    return new Response(
      JSON.stringify({ error: "Wystąpił błąd. Spróbuj ponownie później." }),
      {
        status: 500,
        headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
      }
    );
  }
});
