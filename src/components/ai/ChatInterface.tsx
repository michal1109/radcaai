import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Send, Volume2, Upload, X, FileText, Image as ImageIcon } from "lucide-react";

type Message = {
  id?: string;
  role: "user" | "assistant";
  content: string;
  audio_url?: string;
};

interface ChatInterfaceProps {
  conversationId: string | null;
  onConversationCreated: (id: string) => void;
}

const ChatInterface = ({ conversationId, onConversationCreated }: ChatInterfaceProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [generatingAudio, setGeneratingAudio] = useState<string | null>(null);
  const { toast } = useToast();
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (conversationId) {
      loadMessages();
    } else {
      setMessages([]);
    }
  }, [conversationId]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const loadMessages = async () => {
    if (!conversationId) return;

    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });

    if (error) {
      toast({
        title: "Błąd",
        description: "Nie udało się załadować wiadomości",
        variant: "destructive",
      });
      return;
    }

    setMessages((data || []).map(msg => ({
      id: msg.id,
      role: msg.role as "user" | "assistant",
      content: msg.content,
      audio_url: msg.audio_url || undefined,
    })));
  };

  const createConversation = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from("conversations")
      .insert({
        user_id: user.id,
        title: input.slice(0, 50) || "Nowa rozmowa",
      })
      .select()
      .single();

    if (error) {
      toast({
        title: "Błąd",
        description: "Nie udało się utworzyć rozmowy",
        variant: "destructive",
      });
      return null;
    }

    onConversationCreated(data.id);
    return data.id;
  };

  const saveMessage = async (convId: string, role: "user" | "assistant", content: string) => {
    const { error } = await supabase
      .from("messages")
      .insert({
        conversation_id: convId,
        role,
        content,
      });

    if (error) {
      console.error("Error saving message:", error);
    }
  };

  const analyzeDocuments = async (files: File[]) => {
    const analyses = [];
    for (const file of files) {
      const reader = new FileReader();
      const content = await new Promise<string>((resolve) => {
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });

      const { data, error } = await supabase.functions.invoke("analyze-document", {
        body: { content, analysisType: "legal" },
      });

      if (!error && data?.analysis) {
        analyses.push(`Analiza ${file.name}:\n${data.analysis}`);
      }
    }
    return analyses.join("\n\n");
  };

  const generateVoice = async (text: string, messageIndex: number) => {
    setGeneratingAudio(`${messageIndex}`);
    try {
      const { data, error } = await supabase.functions.invoke("generate-voice", {
        body: { text },
      });

      if (error) throw error;

      if (data?.audioUrl) {
        const audio = new Audio(data.audioUrl);
        audio.play();
      }
    } catch (error: any) {
      toast({
        title: "Błąd",
        description: "Nie udało się wygenerować głosu",
        variant: "destructive",
      });
    } finally {
      setGeneratingAudio(null);
    }
  };

  const sendMessage = async () => {
    if ((!input.trim() && uploadedFiles.length === 0) || isLoading) return;

    const userMessage = input.trim();
    setIsLoading(true);
    setInput("");

    let currentConvId = conversationId;
    if (!currentConvId) {
      currentConvId = await createConversation();
      if (!currentConvId) {
        setIsLoading(false);
        return;
      }
    }

    let fullUserMessage = userMessage;
    if (uploadedFiles.length > 0) {
      const documentAnalysis = await analyzeDocuments(uploadedFiles);
      fullUserMessage = `${userMessage}\n\nDokumenty do analizy:\n${documentAnalysis}`;
      setUploadedFiles([]);
    }

    const newUserMessage: Message = { role: "user", content: userMessage };
    setMessages((prev) => [...prev, newUserMessage]);
    await saveMessage(currentConvId, "user", fullUserMessage);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat-ai`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            messages: [...messages, newUserMessage].map((m) => ({
              role: m.role,
              content: m.role === "user" && m === newUserMessage ? fullUserMessage : m.content,
            })),
          }),
        }
      );

      if (!response.ok) throw new Error("Failed to get response");

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantMessage = "";

      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      while (true) {
        const { done, value } = await reader!.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data === "[DONE]") continue;

            try {
              const parsed = JSON.parse(data);
              const content = parsed.candidates?.[0]?.content?.parts?.[0]?.text || "";
              assistantMessage += content;
              setMessages((prev) => {
                const newMessages = [...prev];
                newMessages[newMessages.length - 1] = {
                  role: "assistant",
                  content: assistantMessage,
                };
                return newMessages;
              });
            } catch (e) {
              // Skip invalid JSON
            }
          }
        }
      }

      await saveMessage(currentConvId, "assistant", assistantMessage);
    } catch (error: any) {
      toast({
        title: "Błąd",
        description: "Nie udało się uzyskać odpowiedzi",
        variant: "destructive",
      });
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(
      (file) =>
        file.type === "application/pdf" ||
        file.type.startsWith("image/")
    );

    if (validFiles.length !== files.length) {
      toast({
        title: "Uwaga",
        description: "Obsługiwane są tylko pliki PDF i obrazy",
        variant: "destructive",
      });
    }

    setUploadedFiles((prev) => [...prev, ...validFiles]);
  };

  const removeFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <Card className="h-full flex flex-col">
      <ScrollArea className="flex-1 p-6">
        {messages.length === 0 ? (
          <div className="text-center text-muted-foreground py-12">
            <p className="text-lg mb-2">👋 Witaj w Papuga AI</p>
            <p className="text-sm">Zadaj pytanie prawne, aby rozpocząć konsultację</p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-4 ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                >
                  <p className="whitespace-pre-wrap text-sm">{message.content}</p>
                  {message.role === "assistant" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-2 gap-2"
                      onClick={() => generateVoice(message.content, index)}
                      disabled={generatingAudio === `${index}`}
                    >
                      {generatingAudio === `${index}` ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Volume2 className="w-4 h-4" />
                      )}
                      Wygeneruj głos
                    </Button>
                  )}
                </div>
              </div>
            ))}
            <div ref={scrollRef} />
          </div>
        )}
      </ScrollArea>

      <div className="border-t p-4 space-y-3">
        {uploadedFiles.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {uploadedFiles.map((file, index) => (
              <div
                key={index}
                className="flex items-center gap-2 bg-muted rounded-lg px-3 py-2 text-sm"
              >
                {file.type === "application/pdf" ? (
                  <FileText className="w-4 h-4" />
                ) : (
                  <ImageIcon className="w-4 h-4" />
                )}
                <span className="truncate max-w-[150px]">{file.name}</span>
                <button onClick={() => removeFile(index)}>
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
        <div className="flex gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,application/pdf"
            multiple
            className="hidden"
            onChange={handleFileUpload}
          />
          <Button
            variant="outline"
            size="icon"
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
          >
            <Upload className="w-4 h-4" />
          </Button>
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
            placeholder="Zadaj pytanie prawne..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button onClick={sendMessage} disabled={isLoading || (!input.trim() && uploadedFiles.length === 0)}>
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default ChatInterface;
