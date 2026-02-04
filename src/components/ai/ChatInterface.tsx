import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Send, Upload, X, FileText, Image as ImageIcon, Download, AlertTriangle } from "lucide-react";
import jsPDF from "jspdf";
import LegalDisclaimer from "@/components/legal/LegalDisclaimer";
import DocumentUploadWarning from "@/components/legal/DocumentUploadWarning";
import ReactMarkdown from "react-markdown";

type UploadedFileData = {
  name: string;
  type: string;
  preview?: string;
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
  const [showUploadWarning, setShowUploadWarning] = useState(false);
  
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

    if (error && import.meta.env.DEV) {
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
      setShowUploadWarning(false);
    }

    const newUserMessage: Message = { 
      role: "user", 
      content: userMessage,
      files: filePreviews.length > 0 ? filePreviews : undefined
    };
    setMessages((prev) => [...prev, newUserMessage]);
    await saveMessage(currentConvId, "user", fullUserMessage);

    try {
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
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }

      await saveMessage(currentConvId, "assistant", assistantMessage);
    } catch (error: unknown) {
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

    if (sizedFiles.length > 0) {
      setShowUploadWarning(true);
    }
    setUploadedFiles((prev) => [...prev, ...sizedFiles]);
  };

  const removeFile = (index: number) => {
    setUploadedFiles((prev) => {
      const newFiles = prev.filter((_, i) => i !== index);
      if (newFiles.length === 0) setShowUploadWarning(false);
      return newFiles;
    });
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
    let yPosition = margin + 15;

    // Add watermark
    pdf.setFontSize(48);
    pdf.setTextColor(200, 200, 200);
    pdf.text("PROJEKT", pageWidth / 2, pageHeight / 2, { 
      angle: 45, 
      align: "center" 
    });
    pdf.setFontSize(24);
    pdf.text("DO WERYFIKACJI PRAWNEJ", pageWidth / 2, pageHeight / 2 + 20, { 
      angle: 45, 
      align: "center" 
    });

    // Reset text color for content
    pdf.setTextColor(0, 0, 0);
    pdf.setFont("helvetica");
    pdf.setFontSize(11);

    // Add header warning
    pdf.setFillColor(255, 243, 205);
    pdf.rect(margin, margin, maxWidth, 12, "F");
    pdf.setFontSize(9);
    pdf.setTextColor(133, 100, 4);
    pdf.text("⚠️ PROJEKT – DO WERYFIKACJI PRAWNEJ. Nie stanowi porady prawnej.", margin + 2, margin + 8);
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(11);

    const lines = pdf.splitTextToSize(content, maxWidth);

    lines.forEach((line: string) => {
      if (yPosition + lineHeight > pageHeight - margin - 15) {
        pdf.addPage();
        yPosition = margin;
        
        // Add watermark to new page
        pdf.setFontSize(48);
        pdf.setTextColor(200, 200, 200);
        pdf.text("PROJEKT", pageWidth / 2, pageHeight / 2, { angle: 45, align: "center" });
        pdf.setTextColor(0, 0, 0);
        pdf.setFontSize(11);
      }
      pdf.text(line, margin, yPosition);
      yPosition += lineHeight;
    });

    // Add footer
    const date = new Date().toLocaleDateString("pl-PL");
    pdf.setFontSize(8);
    pdf.setTextColor(128, 128, 128);
    pdf.text(`Wygenerowano: ${date} | RadcaAI - Dokument wymaga weryfikacji prawnej`, margin, pageHeight - 10);

    pdf.save("projekt-dokument-prawny.pdf");
    
    toast({
      title: "Sukces",
      description: "Dokument został pobrany jako PDF (z oznaczeniem PROJEKT)",
    });
  };

  return (
    <Card className="h-full flex flex-col">
      <ScrollArea className="flex-1 p-6">
        {messages.length === 0 ? (
          <div className="space-y-6 py-8">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-foreground mb-2">
                Witaj w RadcaAI
              </h2>
              <p className="text-muted-foreground text-sm">
                System wsparcia informacyjnego o polskim prawie
              </p>
            </div>
            <LegalDisclaimer compact />
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
                  {message.role === "assistant" ? (
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      <ReactMarkdown>{message.content}</ReactMarkdown>
                    </div>
                  ) : (
                    <p className="whitespace-pre-wrap text-sm">{message.content}</p>
                  )}
                  {message.role === "assistant" && isDocumentContent(message.content) && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-3 gap-2"
                      onClick={() => exportToPdf(message.content)}
                    >
                      <Download className="w-4 h-4" />
                      Pobierz PDF (projekt)
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
        {showUploadWarning && (
          <DocumentUploadWarning className="mb-2" />
        )}
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
            title="Dodaj załącznik"
          >
            <Upload className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => {
              const lastAssistantMessage = [...messages].reverse().find(
                m => m.role === "assistant" && isDocumentContent(m.content)
              );
              if (lastAssistantMessage) {
                exportToPdf(lastAssistantMessage.content);
              } else {
                toast({
                  title: "Brak dokumentu",
                  description: "Najpierw poproś AI o wygenerowanie dokumentu lub pisma",
                  variant: "destructive",
                });
              }
            }}
            disabled={isLoading}
            title="Eksportuj dokument do PDF"
          >
            <Download className="w-4 h-4" />
          </Button>
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
            placeholder="Zadaj pytanie o przepisy prawa..."
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
