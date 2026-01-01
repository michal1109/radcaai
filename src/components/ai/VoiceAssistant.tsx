import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Mic, Square, Volume2, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const VoiceAssistant = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const { toast } = useToast();

  const startRecording = () => {
    setIsRecording(true);
    toast({
      title: "Nagrywanie rozpoczęte",
      description: "Mów teraz...",
    });
  };

  const stopRecording = async () => {
    setIsRecording(false);
    setIsProcessing(true);

    try {
      // Mock voice processing
      const { data, error } = await supabase.functions.invoke("generate-voice", {
        body: { text: "Witam, jak mogę Panu/Pani pomóc w sprawie prawnej?" },
      });

      if (error) throw error;

      const audioBlob = Uint8Array.from(atob(data.audioContent), (c) => c.charCodeAt(0));
      const blob = new Blob([audioBlob], { type: "audio/mpeg" });
      const url = URL.createObjectURL(blob);
      setAudioUrl(url);

      toast({
        title: "Odpowiedź gotowa",
        description: "Odtwórz audio, aby usłyszeć odpowiedź",
      });
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error("Voice error:", error);
      }
      toast({
        title: "Błąd",
        description: "Nie udało się przetworzyć nagrania",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card className="border-2 p-6">
      <div className="flex flex-col items-center justify-center space-y-6 py-12">
        <div className="text-center space-y-2">
          <h3 className="text-2xl font-bold text-foreground">Asystent głosowy</h3>
          <p className="text-muted-foreground">
            Kliknij przycisk i zadaj pytanie prawne głosowo
          </p>
        </div>

        <div className="relative">
          <div
            className={`w-32 h-32 rounded-full flex items-center justify-center ${
              isRecording
                ? "bg-destructive animate-pulse"
                : "bg-primary"
            } transition-all`}
          >
            {isProcessing ? (
              <Loader2 className="w-16 h-16 text-primary-foreground animate-spin" />
            ) : isRecording ? (
              <Square className="w-16 h-16 text-primary-foreground" />
            ) : (
              <Mic className="w-16 h-16 text-primary-foreground" />
            )}
          </div>
        </div>

        <Button
          size="lg"
          onClick={isRecording ? stopRecording : startRecording}
          disabled={isProcessing}
          className="min-w-[200px]"
        >
          {isRecording ? "Zatrzymaj nagrywanie" : "Rozpocznij nagrywanie"}
        </Button>

        {audioUrl && (
          <div className="w-full max-w-md space-y-4">
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <Volume2 className="w-5 h-5" />
              <span>Odpowiedź asystenta:</span>
            </div>
            <audio controls src={audioUrl} className="w-full" />
          </div>
        )}
      </div>
    </Card>
  );
};

export default VoiceAssistant;