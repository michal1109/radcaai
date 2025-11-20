import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Send, Loader2, Plus, Upload, FileText } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { VoiceAssistant } from "./VoiceAssistant";
import papugaAvatar from "@/assets/papuga-avatar.png";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const ChatInterface = () => {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [conversations, setConversations] = useState<any[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [currentAudio, setCurrentAudio] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [messages]);

  const loadConversations = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase.from("conversations").select("*").eq("user_id", user.id).order("updated_at", { ascending: false }).limit(10);
    setConversations(data || []);
  };

  const loadConversation = async (conversationId: string) => {
    const { data } = await supabase.from("messages").select("*").eq("conversation_id", conversationId).order("created_at", { ascending: true });
    setMessages(data?.map(msg => ({ role: msg.role as "user" | "assistant", content: msg.content })) || []);
    setCurrentConversationId(conversationId);
  };

  const createNewConversation = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    const { data } = await supabase.from("conversations").insert({ user_id: user.id, title: "Nowa rozmowa" }).select().single();
    if (data) {
      setCurrentConversationId(data.id);
      setMessages([]);
      await loadConversations();
    }
    return data?.id || null;
  };

  const saveMessage = async (role: "user" | "assistant", content: string) => {
    if (!currentConversationId) return;
    await supabase.from("messages").insert({ conversation_id: currentConversationId, role, content });
    await supabase.from("conversations").update({ updated_at: new Date().toISOString() }).eq("id", currentConversationId);
  };

  const sendMessage = async (messageText?: string) => {
    const textToSend = messageText || input;
    if (!textToSend.trim() && !uploadedFile) return;
    
    let conversationId = currentConversationId || await createNewConversation();
    if (!conversationId) return;

    let messageContent = textToSend;
    if (uploadedFile) {
      messageContent = `[${uploadedFile.type.includes('image') ? 'OBRAZ' : 'PDF'}: ${uploadedFile.name}]\n\n${textToSend || 'Przeanalizuj'}`;
      setUploadedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }

    const userMessage: Message = { role: "user", content: messageContent };
    setMessages(prev => [...prev, userMessage]);
    await saveMessage("user", messageContent);
    setInput("");
    setIsLoading(true);

    try {
      const { data } = await supabase.functions.invoke("chat-ai", { body: { messages: [...messages, userMessage] } });
      const reader = data.body.getReader();
      const decoder = new TextDecoder();
      let assistantMessage = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const lines = decoder.decode(value).split("\n");
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const jsonData = JSON.parse(line.slice(6));
              const text = jsonData.candidates?.[0]?.content?.parts?.[0]?.text;
              if (text) {
                assistantMessage += text;
                setMessages(prev => {
                  const newMessages = [...prev];
                  if (newMessages[newMessages.length - 1]?.role === "assistant") {
                    newMessages[newMessages.length - 1].content = assistantMessage;
                  } else {
                    newMessages.push({ role: "assistant", content: assistantMessage });
                  }
                  return newMessages;
                });
              }
            } catch (e) {}
          }
        }
      }
      await saveMessage("assistant", assistantMessage);

      // Generate voice response if voice mode is enabled
      if (isVoiceMode && assistantMessage) {
        try {
          setIsSpeaking(true);
          const { data: voiceData, error: voiceError } = await supabase.functions.invoke(
            "generate-voice",
            { body: { text: assistantMessage } }
          );

          if (voiceError) {
            console.error("Voice generation error:", voiceError);
            setIsSpeaking(false);
          } else if (voiceData?.audioContent) {
            setCurrentAudio(voiceData.audioContent);
            // Audio will auto-play through VoiceAssistant component
            setTimeout(() => {
              setIsSpeaking(false);
              setCurrentAudio(null);
            }, assistantMessage.length * 50); // Approximate duration
          }
        } catch (voiceError) {
          console.error("Voice generation failed:", voiceError);
          setIsSpeaking(false);
        }
      }
    } catch (error) {
      toast({ title: "Błąd", description: "Nie udało się wysłać wiadomości", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 h-[calc(100vh-200px)]">
      <Card className="p-4 md:col-span-1">
        <Button onClick={createNewConversation} className="w-full mb-4"><Plus className="w-4 h-4 mr-2" />Nowa rozmowa</Button>
        <ScrollArea className="h-[calc(100vh-320px)]">
          {conversations.map(conv => (
            <Button key={conv.id} variant={currentConversationId === conv.id ? "default" : "outline"} className="w-full justify-start mb-2" onClick={() => loadConversation(conv.id)}>
              <span className="truncate">{conv.title}</span>
            </Button>
          ))}
        </ScrollArea>
      </Card>

      <Card className="p-6 md:col-span-3 flex flex-col">
        <div className="flex items-center justify-between mb-4 pb-4 border-b">
          <h3 className="font-semibold text-lg">Asystent AI Papuga</h3>
          <div className="flex gap-2">
            <Button variant={isVoiceMode ? "default" : "outline"} size="sm" onClick={() => setIsVoiceMode(!isVoiceMode)}>
              {isVoiceMode ? "Wyłącz głos" : "Włącz głos"}
            </Button>
            <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}><Upload className="w-4 h-4" /></Button>
            <Input ref={fileInputRef} type="file" accept="image/*,.pdf" className="hidden" onChange={(e) => {
              const file = e.target.files?.[0];
              if (file && (file.type.includes('image') || file.type === 'application/pdf')) {
                setUploadedFile(file);
                toast({ title: "Plik załadowany", description: file.name });
              }
            }} />
          </div>
        </div>

        {isVoiceMode && (
          <div className="mb-4">
            <VoiceAssistant 
              onTranscript={(text) => {
                setInput(text);
                sendMessage(text);
              }}
              isSpeaking={isSpeaking}
              currentAudio={currentAudio}
            />
          </div>
        )}

        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-4 pb-4">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                {msg.role === "assistant" && (
                  <img 
                    src={papugaAvatar} 
                    alt="Papuga" 
                    className="w-8 h-8 rounded-full mr-2 mt-1"
                  />
                )}
                <div className={`max-w-[80%] p-4 rounded-lg ${msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            ))}
            {isLoading && <div className="flex justify-start"><div className="bg-muted p-4 rounded-lg"><Loader2 className="w-5 h-5 animate-spin" /></div></div>}
            <div ref={scrollRef} />
          </div>
        </ScrollArea>

        {uploadedFile && (
          <div className="mt-4 p-3 bg-muted rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-2"><FileText className="w-4 h-4" /><span className="text-sm">{uploadedFile.name}</span></div>
            <Button variant="ghost" size="sm" onClick={() => setUploadedFile(null)}>Usuń</Button>
          </div>
        )}

        <div className="mt-4 flex gap-2">
          <Textarea value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
          }} placeholder="Napisz wiadomość lub załącz obraz/PDF..." className="min-h-[60px] resize-none" disabled={isLoading} />
          <Button onClick={() => sendMessage()} disabled={isLoading || (!input.trim() && !uploadedFile)} size="icon"><Send className="w-5 h-5" /></Button>
        </div>
      </Card>
    </div>
  );
};

export default ChatInterface;
