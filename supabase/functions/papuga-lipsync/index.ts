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
    const { audioBase64, action = "analyze" } = await req.json();
    const PAPUGA_LIPSYNC_API_KEY = Deno.env.get("PAPUGA_LIPSYNC_API_KEY");

    if (!PAPUGA_LIPSYNC_API_KEY) {
      throw new Error("PAPUGA_LIPSYNC_API_KEY is not configured");
    }

    if (!audioBase64) {
      throw new Error("Audio data is required");
    }

    // Call Papuga Lipsync API to analyze audio and generate mouth movements
    const response = await fetch("https://api.papuga-lipsync.com/v1/analyze", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${PAPUGA_LIPSYNC_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        audio: audioBase64,
        format: "mp3",
        outputFormat: "visemes", // Get phoneme/viseme data for mouth shapes
        frameRate: 30, // 30 frames per second for smooth animation
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("Papuga Lipsync API error:", error);
      throw new Error("Failed to analyze audio for lipsync");
    }

    const lipsyncData = await response.json();

    return new Response(
      JSON.stringify({ 
        visemes: lipsyncData.visemes,
        duration: lipsyncData.duration,
        frameRate: lipsyncData.frameRate
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (e) {
    console.error("papuga-lipsync error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
