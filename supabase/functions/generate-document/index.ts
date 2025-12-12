import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
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

    const { documentType, details } = await req.json();
    const GOOGLE_API_KEY = Deno.env.get("GOOGLE_API_KEY");

    if (!GOOGLE_API_KEY) {
      throw new Error("GOOGLE_API_KEY is not configured");
    }

    const templates: Record<string, string> = {
      umowa_najmu: "Wygeneruj profesjonalną umowę najmu lokalu mieszkalnego zgodną z polskim prawem. Uwzględnij następujące informacje:",
      umowa_o_prace: "Wygeneruj umowę o pracę zgodną z polskim Kodeksem pracy. Uwzględnij następujące informacje:",
      pelnomocnictwo: "Wygeneruj pełnomocnictwo zgodne z wymogami polskiego prawa cywilnego. Uwzględnij następujące informacje:",
      oswiadczenie: "Wygeneruj oświadczenie zgodne z wymogami polskiego prawa. Uwzględnij następujące informacje:",
      umowa_sprzedazy: "Wygeneruj umowę sprzedaży zgodną z polskim prawem cywilnym. Uwzględnij następujące informacje:",
      umowa_zlecenia: "Wygeneruj umowę zlecenia zgodną z polskim Kodeksem cywilnym. Uwzględnij następujące informacje:",
    };

    const prompt = templates[documentType] || templates.oswiadczenie;

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
      throw new Error("Failed to generate document");
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
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});