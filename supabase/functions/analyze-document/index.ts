import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://esm.sh/zod@3.23.8";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Max sizes
const MAX_CONTENT_SIZE = 50000;
const MAX_FILE_SIZE = 15 * 1024 * 1024; // ~15MB base64 for ~10MB file

// Valid analysis types
const validAnalysisTypes = ["legal", "contract", "compliance"] as const;

// Valid file types
const validFileTypes = [
  "image/jpeg",
  "image/jpg", 
  "image/png",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
] as const;

// Input validation schema
const requestSchema = z.object({
  content: z.string().max(MAX_CONTENT_SIZE, "Content too long").optional(),
  fileContent: z.string().max(MAX_FILE_SIZE, "File too large (max 10MB)").optional(),
  fileType: z.enum(validFileTypes, {
    errorMap: () => ({ message: "Nieprawidłowy typ pliku" })
  }).optional(),
  analysisType: z.enum(validAnalysisTypes, {
    errorMap: () => ({ message: "Nieprawidłowy typ analizy" })
  }).default("legal")
}).refine(
  (data) => data.content || data.fileContent,
  { message: "Wymagana jest treść dokumentu lub plik" }
);

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

    // Parse and validate input
    const body = await req.json();
    const validation = requestSchema.safeParse(body);
    
    if (!validation.success) {
      console.error("Validation error:", validation.error.issues);
      return new Response(
        JSON.stringify({ error: "Nieprawidłowe dane wejściowe", details: validation.error.issues }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { content, analysisType, fileContent, fileType } = validation.data;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const prompts: Record<string, string> = {
      legal: "Przeanalizuj poniższy dokument prawny i podaj szczegółową analizę, zwracając uwagę na kluczowe klauzule, potencjalne ryzyka i zalecenia.",
      contract: "Przeanalizuj poniższą umowę, identyfikując główne zobowiązania stron, terminy, kary umowne i potencjalne problemy prawne.",
      compliance: "Sprawdź zgodność poniższego dokumentu z polskim prawem, wskazując obszary wymagające poprawy lub doprecyzowania.",
    };

    const prompt = prompts[analysisType];

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
