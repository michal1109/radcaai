import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Volume2, VolumeX } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import papugaAvatar from "@/assets/papuga-avatar.png";

interface VoiceAssistantProps {
  onTranscript?: (text: string) => void;
  isSpeaking?: boolean;
  currentAudio?: string | null;
}

export const VoiceAssistant = ({ onTranscript, isSpeaking, currentAudio }: VoiceAssistantProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();

  // Lipsync animation
  useEffect(() => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.src = papugaAvatar;
    
    img.onload = () => {
      const animate = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        if (isSpeaking && currentAudio) {
          // Add mouth movement overlay
          const mouthY = canvas.height * 0.65;
          const mouthX = canvas.width * 0.5;
          const mouthWidth = canvas.width * 0.15;
          const openAmount = Math.sin(Date.now() / 100) * 10 + 10;
          
          ctx.fillStyle = 'rgba(255, 100, 0, 0.3)';
          ctx.beginPath();
          ctx.ellipse(mouthX, mouthY, mouthWidth, openAmount, 0, 0, Math.PI * 2);
          ctx.fill();
        }
        
        animationRef.current = requestAnimationFrame(animate);
      };
      
      animate();
    };

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isSpeaking, currentAudio]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await transcribeAudio(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      toast.info("Nagrywanie rozpoczęte...");
    } catch (error) {
      console.error("Error starting recording:", error);
      toast.error("Nie można uzyskać dostępu do mikrofonu");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      toast.info("Przetwarzanie nagrania...");
    }
  };

  const transcribeAudio = async (audioBlob: Blob) => {
    try {
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      reader.onloadend = async () => {
        const base64Audio = reader.result as string;
        
        const { data, error } = await supabase.functions.invoke('transcribe-audio', {
          body: { audio: base64Audio.split(',')[1] }
        });

        if (error) throw error;
        
        if (data?.text && onTranscript) {
          onTranscript(data.text);
          toast.success("Transkrypcja zakończona");
        }
      };
    } catch (error) {
      console.error("Transcription error:", error);
      toast.error("Błąd transkrypcji audio");
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 p-6 bg-card rounded-lg border">
      <div className="relative">
        <canvas 
          ref={canvasRef} 
          width={200} 
          height={200}
          className="rounded-full border-4 border-primary shadow-lg"
        />
        {isSpeaking && (
          <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full animate-pulse" />
        )}
      </div>

      <div className="flex gap-2">
        <Button
          onClick={isRecording ? stopRecording : startRecording}
          variant={isRecording ? "destructive" : "default"}
          size="lg"
        >
          {isRecording ? <MicOff className="mr-2" /> : <Mic className="mr-2" />}
          {isRecording ? "Zatrzymaj" : "Mów"}
        </Button>

        <Button
          onClick={toggleMute}
          variant="outline"
          size="lg"
        >
          {isMuted ? <VolumeX /> : <Volume2 />}
        </Button>
      </div>

      {currentAudio && (
        <audio 
          ref={audioRef}
          src={`data:audio/mpeg;base64,${currentAudio}`}
          autoPlay
          muted={isMuted}
        />
      )}
    </div>
  );
};
