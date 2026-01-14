import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Mail, CheckCircle2, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { z } from "zod";

const emailSchema = z.string().email("Wprowadź poprawny adres email");

interface NewsletterSignupProps {
  source?: string;
  variant?: "inline" | "card";
}

const NewsletterSignup = ({ source = "landing", variant = "card" }: NewsletterSignupProps) => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validation = emailSchema.safeParse(email);
    if (!validation.success) {
      toast({
        title: "Nieprawidłowy email",
        description: "Wprowadź poprawny adres email",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase
        .from("newsletter_subscribers")
        .insert({ email, source });

      if (error) {
        if (error.code === "23505") {
          toast({
            title: "Już subskrybujesz!",
            description: "Ten adres email jest już zapisany do newslettera.",
          });
        } else {
          throw error;
        }
      } else {
        setIsSuccess(true);
        toast({
          title: "Dziękujemy!",
          description: "Pomyślnie zapisano do newslettera.",
        });
      }
    } catch (error) {
      console.error("Newsletter signup error:", error);
      toast({
        title: "Błąd",
        description: "Nie udało się zapisać do newslettera. Spróbuj ponownie.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex items-center justify-center gap-3 py-4"
      >
        <CheckCircle2 className="w-6 h-6 text-primary" />
        <span className="text-foreground font-medium">Dziękujemy za zapisanie się!</span>
      </motion.div>
    );
  }

  const content = (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
      <div className="relative flex-1">
        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Twój adres email"
          className="pl-10"
          disabled={isLoading}
        />
      </div>
      <Button type="submit" disabled={isLoading || !email.trim()}>
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Zapisywanie...
          </>
        ) : (
          "Zapisz się"
        )}
      </Button>
    </form>
  );

  if (variant === "inline") {
    return content;
  }

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-background">
      <CardContent className="pt-6">
        <div className="text-center mb-4">
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Bądź na bieżąco z prawem
          </h3>
          <p className="text-sm text-muted-foreground">
            Zapisz się do newslettera i otrzymuj porady prawne oraz nowości
          </p>
        </div>
        {content}
        <p className="text-xs text-muted-foreground text-center mt-3">
          Bez spamu. Możesz wypisać się w każdej chwili.
        </p>
      </CardContent>
    </Card>
  );
};

export default NewsletterSignup;
