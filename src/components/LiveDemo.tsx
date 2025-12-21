import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Send, MessageCircle, Sparkles, Lock, ThumbsUp, ThumbsDown, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";

const DEMO_STORAGE_KEY = "papuga_demo_used";

const exampleQuestions = [
  "Jak wypowiedzieć umowę najmu?",
  "Czy pracodawca może odmówić urlopu?",
  "Jak napisać reklamację?",
  "Co grozi za przekroczenie prędkości?",
  "Jak odzyskać dług od znajomego?"
];

const analysisSteps = [
  { label: "Analiza pytania", duration: 800 },
  { label: "Przeszukiwanie bazy prawnej", duration: 1200 },
  { label: "Przygotowywanie odpowiedzi", duration: 1000 },
];

const LiveDemo = () => {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(-1);
  const [rating, setRating] = useState<'up' | 'down' | null>(null);
  const [demoUsed, setDemoUsed] = useState(() => {
    return localStorage.getItem(DEMO_STORAGE_KEY) === "true";
  });
  const navigate = useNavigate();
  const { toast } = useToast();

  const selectQuestion = (q: string) => {
    if (!demoUsed && !isLoading) {
      setQuestion(q);
    }
  };

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
    setRating(null);
    
    // Animate through analysis steps
    for (let i = 0; i < analysisSteps.length; i++) {
      setCurrentStep(i);
      await new Promise(resolve => setTimeout(resolve, analysisSteps[i].duration));
    }

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
      setCurrentStep(-1);
    }
  };

  const handleRating = (type: 'up' | 'down') => {
    setRating(type);
    toast({
      title: type === 'up' ? "Dziękujemy!" : "Dziękujemy za opinię",
      description: type === 'up' 
        ? "Cieszymy się, że odpowiedź była pomocna!" 
        : "Pracujemy nad ulepszeniem naszego asystenta.",
    });
  };

  return (
    <section id="demo" className="py-20 bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <div className="container mx-auto px-4">
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
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
        </motion.div>

        {/* Example Questions */}
        {!demoUsed && !answer && (
          <motion.div 
            className="max-w-2xl mx-auto mb-8"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <p className="text-sm text-muted-foreground text-center mb-4">
              Wybierz jedno z przykładowych pytań lub wpisz własne:
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {exampleQuestions.map((q, i) => (
                <motion.button
                  key={i}
                  onClick={() => selectQuestion(q)}
                  className={`px-4 py-2 rounded-full text-sm transition-all border ${
                    question === q 
                      ? 'bg-primary text-primary-foreground border-primary' 
                      : 'bg-card border-border hover:border-primary hover:bg-primary/5'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={isLoading}
                >
                  {q}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        <motion.div 
          className="max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <Card className="border-2 border-primary/20 shadow-xl overflow-hidden">
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
              <AnimatePresence mode="wait">
                {!demoUsed && !answer && !isLoading && (
                  <motion.form 
                    key="form"
                    onSubmit={handleSubmit} 
                    className="space-y-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
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
                  </motion.form>
                )}

                {isLoading && (
                  <motion.div 
                    key="loading"
                    className="py-8"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    {/* Analysis Steps Progress */}
                    <div className="space-y-4 mb-6">
                      {analysisSteps.map((step, i) => (
                        <motion.div
                          key={i}
                          className="flex items-center gap-3"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.2 }}
                        >
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                            i < currentStep 
                              ? 'bg-primary text-primary-foreground' 
                              : i === currentStep 
                                ? 'bg-primary/20 text-primary animate-pulse' 
                                : 'bg-muted text-muted-foreground'
                          }`}>
                            {i < currentStep ? (
                              <CheckCircle2 className="w-4 h-4" />
                            ) : (
                              <span className="text-sm font-medium">{i + 1}</span>
                            )}
                          </div>
                          <span className={`text-sm ${
                            i <= currentStep ? 'text-foreground' : 'text-muted-foreground'
                          }`}>
                            {step.label}
                          </span>
                          {i === currentStep && (
                            <motion.div
                              className="flex gap-1 ml-auto"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                            >
                              <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                              <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                              <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                            </motion.div>
                          )}
                        </motion.div>
                      ))}
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-primary"
                        initial={{ width: "0%" }}
                        animate={{ width: `${((currentStep + 1) / analysisSteps.length) * 100}%` }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                  </motion.div>
                )}

                {answer && (
                  <motion.div 
                    key="answer"
                    className="space-y-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <div className="bg-muted/50 rounded-lg p-4">
                      <p className="text-sm font-medium text-muted-foreground mb-2">Twoje pytanie:</p>
                      <p className="text-foreground">{question}</p>
                    </div>
                    <div className="bg-primary/5 rounded-lg p-4 border border-primary/20">
                      <p className="text-sm font-medium text-primary mb-2">Odpowiedź Papugi:</p>
                      <p className="text-foreground whitespace-pre-wrap">{answer}</p>
                    </div>
                    
                    {/* Rating */}
                    <div className="flex items-center justify-center gap-4 pt-2">
                      <span className="text-sm text-muted-foreground">Czy ta odpowiedź była pomocna?</span>
                      <div className="flex gap-2">
                        <Button
                          variant={rating === 'up' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => handleRating('up')}
                          disabled={rating !== null}
                          className="gap-1"
                        >
                          <ThumbsUp className="w-4 h-4" />
                        </Button>
                        <Button
                          variant={rating === 'down' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => handleRating('down')}
                          disabled={rating !== null}
                          className="gap-1"
                        >
                          <ThumbsDown className="w-4 h-4" />
                        </Button>
                      </div>
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
                  </motion.div>
                )}

                {demoUsed && !answer && (
                  <motion.div 
                    key="used"
                    className="text-center py-8 space-y-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
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
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  );
};

export default LiveDemo;
