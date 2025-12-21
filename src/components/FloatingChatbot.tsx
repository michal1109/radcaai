import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

const quickQuestions = [
  "Jak wypowiedzieć umowę najmu?",
  "Jakie mam prawa jako konsument?",
  "Jak napisać reklamację?",
];

const FloatingChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleQuickQuestion = (question: string) => {
    navigate(`/ai-assistant?q=${encodeURIComponent(question)}`);
    setIsOpen(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      navigate(`/ai-assistant?q=${encodeURIComponent(message)}`);
      setIsOpen(false);
    }
  };

  const handleGoToAssistant = () => {
    navigate("/ai-assistant");
    setIsOpen(false);
  };

  return (
    <>
      {/* Floating Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center hover:scale-110 transition-transform"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        animate={isOpen ? {} : { boxShadow: ["0 0 20px hsl(var(--primary) / 0.4)", "0 0 40px hsl(var(--primary) / 0.6)", "0 0 20px hsl(var(--primary) / 0.4)"] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <X className="w-6 h-6" />
            </motion.div>
          ) : (
            <motion.div
              key="open"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <MessageCircle className="w-6 h-6" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-24 right-6 z-50 w-80 sm:w-96"
          >
            <Card className="shadow-2xl border-primary/20">
              <CardHeader className="bg-primary text-primary-foreground rounded-t-lg py-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <MessageCircle className="w-5 h-5" />
                  Papuga - Asystent Prawny
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                <p className="text-sm text-muted-foreground">
                  Cześć! Jak mogę Ci pomóc w kwestiach prawnych?
                </p>

                {/* Quick Questions */}
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Szybkie pytania
                  </p>
                  {quickQuestions.map((q, i) => (
                    <button
                      key={i}
                      onClick={() => handleQuickQuestion(q)}
                      className="w-full text-left text-sm p-2 rounded-lg bg-muted/50 hover:bg-primary/10 transition-colors flex items-center justify-between group"
                    >
                      <span>{q}</span>
                      <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity text-primary" />
                    </button>
                  ))}
                </div>

                {/* Custom Question Input */}
                <form onSubmit={handleSubmit} className="flex gap-2">
                  <Input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Wpisz swoje pytanie..."
                    className="flex-1 text-sm"
                  />
                  <Button type="submit" size="icon" disabled={!message.trim()}>
                    <Send className="w-4 h-4" />
                  </Button>
                </form>

                {/* Go to Full Assistant */}
                <Button
                  variant="outline"
                  className="w-full gap-2"
                  onClick={handleGoToAssistant}
                >
                  Otwórz pełnego asystenta
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default FloatingChatbot;
