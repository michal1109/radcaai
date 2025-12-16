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

    const { content, analysisType, fileContent, fileType } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    if (!content && !fileContent) {
      throw new Error("Document content or file is required");
    }

    const prompts: Record<string, string> = {
      legal: "Przeanalizuj poniższy dokument prawny i podaj szczegółową analizę, zwracając uwagę na kluczowe klauzule, potencjalne ryzyka i zalecenia.",
      contract: "Przeanalizuj poniższą umowę, identyfikując główne zobowiązania stron, terminy, kary umowne i potencjalne problemy prawne.",
      compliance: "Sprawdź zgodność poniższego dokumentu z polskim prawem, wskazując obszary wymagające poprawy lub doprecyzowania.",
    };

    const prompt = prompts[analysisType] || prompts.legal;

    // Build messages array based on content type
    const messages: any[] = [
      { 
        role: "system", 
        content: "Jesteś ekspertem prawnym specjalizującym się w analizie dokumentów prawnych w języku polskim. Odpowiadaj zawsze po polsku, w sposób profesjonalny i szczegółowy." 
      }
    ];

    if (fileContent && fileType) {
      // Handle image files (JPG, PNG, etc.)
      if (fileType.startsWith('image/')) {
        messages.push({
          role: "user",
          content: [
            { type: "text", text: `${prompt}\n\nPrzeanalizuj dokument widoczny na obrazie:` },
            { 
              type: "image_url", 
              image_url: { url: fileContent }
            }
          ]
        });
      } else {
        // Handle text-based files (PDF text, DOC text)
        messages.push({
          role: "user",
          content: `${prompt}\n\nDokument:\n${fileContent}`
        });
      }
    } else {
      // Handle plain text content
      messages.push({
        role: "user",
        content: `${prompt}\n\nDokument:\n${content}`
      });
    }

    console.log("Calling Lovable AI Gateway...");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Przekroczono limit zapytań. Spróbuj ponownie za chwilę." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Wymagana płatność. Dodaj środki do workspace." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const error = await response.text();
      console.error("Lovable AI error:", error);
      throw new Error("Failed to analyze document");
    }

    const data = await response.json();
    const analysis = data.choices?.[0]?.message?.content || "Nie udało się przeanalizować dokumentu.";

    console.log("Analysis completed successfully");

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
