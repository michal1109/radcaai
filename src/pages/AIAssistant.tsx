import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Send, Upload, X, FileText, Image as ImageIcon, Download, LogOut, Camera } from "lucide-react";
import jsPDF from "jspdf";
import ReactMarkdown from "react-markdown";
import papugaLogo from "@/assets/papuga-2.png";

type UploadedFileData = {
  name: string;
  type: string;
  preview?: string;
};

type Message = {
  id?: string;
  role: "user" | "assistant";
  content: string;
  files?: UploadedFileData[];
};

const AIAssistant = () => {
  const [user, setUser] = useState<any>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);

  const { toast } = useToast();
  const navigate = useNavigate();
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setUser(session.user);
      else navigate("/auth");
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      if (session) setUser(session.user);
      else navigate("/auth");
    });
    return () => subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const createConversation = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    const { data, error } = await supabase
      .from("conversations")
      .insert({ user_id: user.id, title: input.slice(0, 50) || "Nowa rozmowa" })
      .select()
      .single();
    if (error) return null;
    setConversationId(data.id);
    return data.id;
  };

  const saveMessage = async (convId: string, role: "user" | "assistant", content: string) => {
    await supabase.from("messages").insert({ conversation_id: convId, role, content });
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
        body: { fileContent: base64Content, fileType: file.type, analysisType: "legal" },
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
      if (file.type.startsWith("image/")) {
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
      if (!currentConvId) { setIsLoading(false); return; }
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
      content: userMessage || "📎 Przesłano dokument do analizy",
      files: filePreviews.length > 0 ? filePreviews : undefined,
    };
    setMessages((prev) => [...prev, newUserMessage]);
    await saveMessage(currentConvId, "user", fullUserMessage);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) throw new Error("Brak sesji");

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
                const newMsgs = [...prev];
                newMsgs[newMsgs.length - 1] = { role: "assistant", content: assistantMessage };
                return newMsgs;
              });
            }
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }

      await saveMessage(currentConvId, "assistant", assistantMessage);
    } catch {
      toast({ title: "Błąd", description: "Nie udało się uzyskać odpowiedzi", variant: "destructive" });
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const allowedTypes = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
    const validFiles = files.filter((f) => allowedTypes.includes(f.type) || f.type.startsWith("image/"));
    const maxSize = 10 * 1024 * 1024;
    const sizedFiles = validFiles.filter((f) => f.size <= maxSize);

    if (sizedFiles.length !== files.length) {
      toast({ title: "Uwaga", description: "Max 10MB, formaty: JPG, PNG, PDF, DOC", variant: "destructive" });
    }
    setUploadedFiles((prev) => [...prev, ...sizedFiles]);
  };

  const removeFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const isDocumentContent = (content: string): boolean => {
    const keywords = ["odwołanie", "wniosek", "pismo", "skarga", "pozew", "umowa", "oświadczenie", "zawiadomienie", "wezwanie", "reklamacja", "wypowiedzenie", "pełnomocnictwo"];
    const lower = content.toLowerCase();
    return keywords.some((k) => lower.includes(k)) && content.includes("\n\n") && content.length > 300;
  };

  const exportToPdf = (content: string) => {
    const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const pw = pdf.internal.pageSize.getWidth();
    const ph = pdf.internal.pageSize.getHeight();
    const m = 20;
    const maxW = pw - m * 2;
    let y = m + 15;

    pdf.setFontSize(48);
    pdf.setTextColor(200, 200, 200);
    pdf.text("PROJEKT", pw / 2, ph / 2, { angle: 45, align: "center" });
    pdf.setFontSize(24);
    pdf.text("DO WERYFIKACJI PRAWNEJ", pw / 2, ph / 2 + 20, { angle: 45, align: "center" });

    pdf.setTextColor(0, 0, 0);
    pdf.setFont("helvetica");
    pdf.setFontSize(11);

    pdf.setFillColor(255, 243, 205);
    pdf.rect(m, m, maxW, 12, "F");
    pdf.setFontSize(9);
    pdf.setTextColor(133, 100, 4);
    pdf.text("PROJEKT - DO WERYFIKACJI PRAWNEJ. Nie stanowi porady prawnej.", m + 2, m + 8);
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(11);

    const lines = pdf.splitTextToSize(content, maxW);
    lines.forEach((line: string) => {
      if (y + 6 > ph - m - 15) {
        pdf.addPage();
        y = m;
        pdf.setFontSize(48);
        pdf.setTextColor(200, 200, 200);
        pdf.text("PROJEKT", pw / 2, ph / 2, { angle: 45, align: "center" });
        pdf.setTextColor(0, 0, 0);
        pdf.setFontSize(11);
      }
      pdf.text(line, m, y);
      y += 6;
    });

    const date = new Date().toLocaleDateString("pl-PL");
    pdf.setFontSize(8);
    pdf.setTextColor(128, 128, 128);
    pdf.text(`Wygenerowano: ${date} | RadcaAI - Dokument wymaga weryfikacji prawnej`, m, ph - 10);
    pdf.save("projekt-dokument-prawny.pdf");
    toast({ title: "✅ Pobrano PDF", description: "Dokument zapisany" });
  };

  const quickActions = [
    { label: "📸 Analizuj pismo", action: () => fileInputRef.current?.click() },
    { label: "📝 Napisz odwołanie", action: () => setInput("Napisz odwołanie od decyzji ") },
    { label: "📄 Napisz pismo", action: () => setInput("Napisz pismo urzędowe ") },
    { label: "⚖️ Porada prawna", action: () => setInput("Potrzebuję porady prawnej w sprawie ") },
  ];

  if (!user) return null;

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b bg-card">
        <div className="flex items-center gap-3">
          <img src={papugaLogo} alt="RadcaAI" className="w-10 h-10 rounded-full object-contain" />
          <div>
            <h1 className="text-lg font-bold text-primary leading-tight">RadcaAI</h1>
            <p className="text-[10px] text-muted-foreground leading-tight">Twój asystent prawny</p>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={handleLogout} title="Wyloguj">
          <LogOut className="w-5 h-5" />
        </Button>
      </div>

      {/* Chat area */}
      <ScrollArea className="flex-1 px-4 py-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full min-h-[60vh] gap-6">
            <img src={papugaLogo} alt="RadcaAI" className="w-40 h-40 object-contain animate-bounce" style={{ animationDuration: "3s" }} />
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold text-primary">Cześć! 👋</h2>
              <p className="text-muted-foreground text-sm max-w-xs">
                Jestem Twoją papugą-prawnikiem. Zrób zdjęcie pisma, a pomogę Ci je zrozumieć i napisać odpowiedź!
              </p>
            </div>

            {/* Quick actions */}
            <div className="grid grid-cols-2 gap-3 w-full max-w-sm">
              {quickActions.map((qa) => (
                <Button
                  key={qa.label}
                  variant="outline"
                  className="h-auto py-3 px-4 text-sm text-left whitespace-normal"
                  onClick={qa.action}
                >
                  {qa.label}
                </Button>
              ))}
            </div>

            <p className="text-[10px] text-muted-foreground/70 text-center max-w-xs">
              ⚠️ Informacje mają charakter edukacyjny i nie stanowią porady prawnej. W ważnych sprawach skonsultuj się z prawnikiem.
            </p>
          </div>
        ) : (
          <div className="space-y-3 max-w-2xl mx-auto">
            {messages.map((message, index) => (
              <div key={index} className={`flex gap-2 ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                {message.role === "assistant" && (
                  <img src={papugaLogo} alt="" className="w-8 h-8 rounded-full object-contain flex-shrink-0 mt-1" />
                )}
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground rounded-br-sm"
                      : "bg-muted rounded-bl-sm"
                  }`}
                >
                  {message.files && message.files.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-2">
                      {message.files.map((file, fi) => (
                        <div key={fi}>
                          {file.preview ? (
                            <img src={file.preview} alt={file.name} className="w-20 h-20 object-cover rounded-lg" />
                          ) : (
                            <div className="flex items-center gap-1 text-xs opacity-80">
                              <FileText className="w-3 h-3" />
                              <span>{file.name}</span>
                            </div>
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
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  )}
                  {message.role === "assistant" && isDocumentContent(message.content) && (
                    <Button
                      variant="secondary"
                      size="sm"
                      className="mt-3 gap-2 w-full"
                      onClick={() => exportToPdf(message.content)}
                    >
                      <Download className="w-4 h-4" />
                      📥 Pobierz PDF
                    </Button>
                  )}
                </div>
              </div>
            ))}
            {isLoading && messages[messages.length - 1]?.role === "user" && (
              <div className="flex gap-2 items-start">
                <img src={papugaLogo} alt="" className="w-8 h-8 rounded-full object-contain flex-shrink-0 mt-1" />
                <div className="bg-muted rounded-2xl rounded-bl-sm px-4 py-3">
                  <Loader2 className="w-5 h-5 animate-spin text-primary" />
                </div>
              </div>
            )}
            <div ref={scrollRef} />
          </div>
        )}
      </ScrollArea>

      {/* Uploaded files preview */}
      {uploadedFiles.length > 0 && (
        <div className="px-4 py-2 border-t bg-card">
          <div className="flex flex-wrap gap-2">
            {uploadedFiles.map((file, index) => (
              <div key={index} className="flex items-center gap-2 bg-muted rounded-full px-3 py-1.5 text-xs">
                {file.type.startsWith("image/") ? <ImageIcon className="w-3 h-3" /> : <FileText className="w-3 h-3" />}
                <span className="truncate max-w-[100px]">{file.name}</span>
                <button onClick={() => removeFile(index)}>
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Input bar */}
      <div className="border-t px-4 py-3 bg-card">
        <div className="flex gap-2 max-w-2xl mx-auto items-end">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,application/pdf,.doc,.docx"
            multiple
            className="hidden"
            onChange={handleFileUpload}
          />
          <Button
            variant="outline"
            size="icon"
            className="rounded-full flex-shrink-0"
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
            title="Dodaj zdjęcie lub plik"
          >
            <Camera className="w-5 h-5" />
          </Button>
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
            placeholder="Napisz wiadomość..."
            disabled={isLoading}
            className="flex-1 rounded-full"
          />
          <Button
            size="icon"
            className="rounded-full flex-shrink-0"
            onClick={sendMessage}
            disabled={isLoading || (!input.trim() && uploadedFiles.length === 0)}
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;
