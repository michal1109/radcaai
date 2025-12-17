import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Send, Upload, X, FileText, Image as ImageIcon, Download } from "lucide-react";
import jsPDF from "jspdf";

type UploadedFileData = {
  name: string;
  type: string;
  preview?: string; // Base64 preview for images
};

type Message = {
  id?: string;
  role: "user" | "assistant";
  content: string;
  audio_url?: string;
  files?: UploadedFileData[];
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
      const base64Content = await new Promise<string>((resolve) => {
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });

      const { data, error } = await supabase.functions.invoke("analyze-document", {
        body: { 
          fileContent: base64Content, 
          fileType: file.type,
          analysisType: "legal" 
        },
      });

      if (!error && data?.analysis) {
        analyses.push(`Analiza ${file.name}:\n${data.analysis}`);
      }
    }
    return analyses.join("\n\n");
  };

  const getFilePreviews = async (files: File[]): Promise<UploadedFileData[]> => {
    const previews: UploadedFileData[] = [];
    for (const file of files) {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        const preview = await new Promise<string>((resolve) => {
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });
        previews.push({ name: file.name, type: file.type, preview });
      } else {
        previews.push({ name: file.name, type: file.type });
      }
    }
    return previews;
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
    let filePreviews: UploadedFileData[] = [];
    
    if (uploadedFiles.length > 0) {
      filePreviews = await getFilePreviews(uploadedFiles);
      const documentAnalysis = await analyzeDocuments(uploadedFiles);
      fullUserMessage = `${userMessage}\n\nDokumenty do analizy:\n${documentAnalysis}`;
      setUploadedFiles([]);
    }

    const newUserMessage: Message = { 
      role: "user", 
      content: userMessage,
      files: filePreviews.length > 0 ? filePreviews : undefined
    };
    setMessages((prev) => [...prev, newUserMessage]);
    await saveMessage(currentConvId, "user", fullUserMessage);

    try {
      // Get user's session token for authentication
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error("Musisz być zalogowany, aby korzystać z czatu");
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat-ai`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            messages: [...messages, newUserMessage].map((m) => ({
              role: m.role,
              content: m.role === "user" && m === newUserMessage ? fullUserMessage : m.content,
            })),
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Błąd połączenia z AI");
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantMessage = "";

      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      let textBuffer = "";
      
      while (true) {
        const { done, value } = await reader!.read();
        if (done) break;

        textBuffer += decoder.decode(value, { stream: true });
        
        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") continue;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              assistantMessage += content;
              setMessages((prev) => {
                const newMessages = [...prev];
                newMessages[newMessages.length - 1] = {
                  role: "assistant",
                  content: assistantMessage,
                };
                return newMessages;
              });
            }
          } catch (e) {
            // Re-buffer partial JSON
            textBuffer = line + "\n" + textBuffer;
            break;
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
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    
    const validFiles = files.filter(
      (file) =>
        allowedTypes.includes(file.type) ||
        file.type.startsWith("image/")
    );

    if (validFiles.length !== files.length) {
      toast({
        title: "Uwaga",
        description: "Obsługiwane są pliki: JPG, PNG, PDF, DOC, DOCX",
        variant: "destructive",
      });
    }

    // Check file size (max 10MB)
    const maxSize = 10 * 1024 * 1024;
    const sizedFiles = validFiles.filter(file => {
      if (file.size > maxSize) {
        toast({
          title: "Plik zbyt duży",
          description: `${file.name} przekracza limit 10MB`,
          variant: "destructive",
        });
        return false;
      }
      return true;
    });

    setUploadedFiles((prev) => [...prev, ...sizedFiles]);
  };

  const removeFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const isDocumentContent = (content: string): boolean => {
    const documentKeywords = [
      "odwołanie", "wniosek", "pismo", "skarga", "pozew", "umowa",
      "oświadczenie", "zawiadomienie", "wezwanie", "reklamacja",
      "wypowiedzenie", "upoważnienie", "pełnomocnictwo"
    ];
    const lowerContent = content.toLowerCase();
    const hasKeyword = documentKeywords.some(keyword => lowerContent.includes(keyword));
    const hasStructure = content.includes("\n\n") && content.length > 300;
    return hasKeyword && hasStructure;
  };

  const exportToPdf = (content: string) => {
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 20;
    const maxWidth = pageWidth - margin * 2;
    const lineHeight = 6;
    let yPosition = margin;

    // Add Polish font support
    pdf.setFont("helvetica");
    pdf.setFontSize(11);

    // Split content into lines
    const lines = pdf.splitTextToSize(content, maxWidth);

    lines.forEach((line: string) => {
      if (yPosition + lineHeight > pageHeight - margin) {
        pdf.addPage();
        yPosition = margin;
      }
      pdf.text(line, margin, yPosition);
      yPosition += lineHeight;
    });

    // Add footer with date
    const date = new Date().toLocaleDateString("pl-PL");
    pdf.setFontSize(8);
    pdf.setTextColor(128, 128, 128);
    pdf.text(`Wygenerowano: ${date} | Papuga AI`, margin, pageHeight - 10);

    pdf.save("dokument-prawny.pdf");
    
    toast({
      title: "Sukces",
      description: "Dokument został pobrany jako PDF",
    });
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
                  {message.files && message.files.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-2">
                      {message.files.map((file, fileIndex) => (
                        <div key={fileIndex} className="flex items-center gap-1 text-xs opacity-80">
                          {file.preview ? (
                            <img 
                              src={file.preview} 
                              alt={file.name}
                              className="w-16 h-16 object-cover rounded"
                            />
                          ) : (
                            <>
                              <FileText className="w-3 h-3" />
                              <span>{file.name}</span>
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  <p className="whitespace-pre-wrap text-sm">{message.content}</p>
                  {message.role === "assistant" && isDocumentContent(message.content) && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-3 gap-2"
                      onClick={() => exportToPdf(message.content)}
                    >
                      <Download className="w-4 h-4" />
                      Pobierz PDF
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
                {file.type.startsWith("image/") ? (
                  <ImageIcon className="w-4 h-4" />
                ) : (
                  <FileText className="w-4 h-4" />
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
            accept="image/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,.doc,.docx"
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
