import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Send, MessageCircle, Sparkles, Lock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const DEMO_STORAGE_KEY = "papuga_demo_used";

const LiveDemo = () => {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [demoUsed, setDemoUsed] = useState(() => {
    return localStorage.getItem(DEMO_STORAGE_KEY) === "true";
  });
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!question.trim()) {
      toast({
        title: "Wpisz pytanie",
        description: "Pole pytania nie może być puste",
        variant: "destructive",
      });
      return;
    }

    if (demoUsed) {
      toast({
        title: "Demo wykorzystane",
        description: "Zarejestruj się, aby uzyskać 5 darmowych pytań!",
        variant: "default",
      });
      navigate("/auth");
      return;
    }

    setIsLoading(true);
    setAnswer("");

    try {
      const response = await supabase.functions.invoke("chat-ai", {
        body: {
          messages: [{ role: "user", content: question }],
          isDemo: true,
        },
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      // Handle streaming response
      const reader = response.data?.getReader?.();
      if (reader) {
        const decoder = new TextDecoder();
        let fullAnswer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split("\n");

          for (const line of lines) {
            if (line.startsWith("data: ") && line !== "data: [DONE]") {
              try {
                const data = JSON.parse(line.slice(6));
                const content = data.choices?.[0]?.delta?.content;
                if (content) {
                  fullAnswer += content;
                  setAnswer(fullAnswer);
                }
              } catch {
                // Ignore parsing errors
              }
            }
          }
        }
      } else if (response.data?.content) {
        setAnswer(response.data.content);
      } else if (typeof response.data === "string") {
        setAnswer(response.data);
      }

      // Mark demo as used
      localStorage.setItem(DEMO_STORAGE_KEY, "true");
      setDemoUsed(true);

    } catch (error) {
      console.error("Demo error:", error);
      toast({
        title: "Błąd",
        description: "Nie udało się uzyskać odpowiedzi. Spróbuj ponownie.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section id="demo" className="py-20 bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-4">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-medium">Wypróbuj za darmo</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Sprawdź Papugę w akcji
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Zadaj jedno pytanie bez rejestracji i przekonaj się, jak działa nasz asystent prawny AI
          </p>
        </div>

        <div className="max-w-2xl mx-auto">
          <Card className="border-2 border-primary/20 shadow-xl">
            <CardHeader className="bg-primary/5 border-b border-primary/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 text-primary-foreground" />
                </div>
                <div>
                  <CardTitle className="text-lg">Live Demo</CardTitle>
                  <CardDescription>
                    {demoUsed ? "Demo wykorzystane - zarejestruj się po więcej!" : "1 darmowe pytanie bez rejestracji"}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {!demoUsed && !answer && (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="relative">
                    <Input
                      value={question}
                      onChange={(e) => setQuestion(e.target.value)}
                      placeholder="Np. Jakie prawa ma najemca w przypadku wadliwego ogrzewania?"
                      className="pr-12 py-6 text-base"
                      disabled={isLoading}
                    />
                    <Button
                      type="submit"
                      size="icon"
                      className="absolute right-2 top-1/2 -translate-y-1/2"
                      disabled={isLoading || !question.trim()}
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground text-center">
                    Twoje pytanie jest anonimowe i nie wymaga podawania danych osobowych
                  </p>
                </form>
              )}

              {isLoading && (
                <div className="flex items-center justify-center py-8">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    <span className="text-muted-foreground ml-2">Papuga myśli...</span>
                  </div>
                </div>
              )}

              {answer && (
                <div className="space-y-4">
                  <div className="bg-muted/50 rounded-lg p-4">
                    <p className="text-sm font-medium text-muted-foreground mb-2">Twoje pytanie:</p>
                    <p className="text-foreground">{question}</p>
                  </div>
                  <div className="bg-primary/5 rounded-lg p-4 border border-primary/20">
                    <p className="text-sm font-medium text-primary mb-2">Odpowiedź Papugi:</p>
                    <p className="text-foreground whitespace-pre-wrap">{answer}</p>
                  </div>
                  <div className="pt-4 text-center space-y-3">
                    <p className="text-sm text-muted-foreground">
                      Spodobała Ci się odpowiedź? Zarejestruj się i otrzymaj 5 darmowych pytań!
                    </p>
                    <Button 
                      onClick={() => navigate("/auth")}
                      className="bg-primary hover:bg-primary/90"
                    >
                      Zacznij za Darmo (5 pytań)
                    </Button>
                  </div>
                </div>
              )}

              {demoUsed && !answer && (
                <div className="text-center py-8 space-y-4">
                  <div className="w-16 h-16 mx-auto rounded-full bg-muted flex items-center justify-center">
                    <Lock className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground mb-2">Demo już wykorzystane</p>
                    <p className="text-sm text-muted-foreground mb-4">
                      Zarejestruj się za darmo i otrzymaj 5 pytań do wykorzystania!
                    </p>
                  </div>
                  <Button 
                    onClick={() => navigate("/auth")}
                    className="bg-primary hover:bg-primary/90"
                  >
                    Zacznij za Darmo (5 pytań)
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default LiveDemo;
