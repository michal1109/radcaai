import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { content, analysisType } = await req.json();
    const GOOGLE_API_KEY = Deno.env.get("GOOGLE_API_KEY");

    if (!GOOGLE_API_KEY) {
      throw new Error("GOOGLE_API_KEY is not configured");
    }

    if (!content) {
      throw new Error("Document content is required");
    }

    const prompts: Record<string, string> = {
      legal: "Przeanalizuj poniższy dokument prawny i podaj szczegółową analizę, zwracając uwagę na kluczowe klauzule, potencjalne ryzyka i zalecenia.",
      contract: "Przeanalizuj poniższą umowę, identyfikując główne zobowiązania stron, terminy, kary umowne i potencjalne problemy prawne.",
      compliance: "Sprawdź zgodność poniższego dokumentu z polskim prawem, wskazując obszary wymagające poprawy lub doprecyzowania.",
    };

    const prompt = prompts[analysisType] || prompts.legal;

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
                  text: `${prompt}\n\nDokument:\n${content}`,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.5,
            maxOutputTokens: 4096,
          },
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error("Gemini API error:", error);
      throw new Error("Failed to analyze document");
    }

    const data = await response.json();
    const analysis = data.candidates[0]?.content?.parts[0]?.text || "Nie udało się przeanalizować dokumentu.";

    return new Response(
      JSON.stringify({ analysis }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (e) {
    console.error("analyze-document error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});