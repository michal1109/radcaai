import { Gift, Users, ArrowRight, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const ReferralProgram = () => {
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const referralCode = "PAPUGA2024";
  const referralLink = `${window.location.origin}/auth?ref=${referralCode}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    toast({
      title: "Skopiowano!",
      description: "Link polecający został skopiowany do schowka",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const benefits = [
    { icon: Gift, text: "Ty otrzymujesz +5 darmowych pytań" },
    { icon: Users, text: "Twój znajomy otrzymuje +3 dodatkowe pytania" },
  ];

  return (
    <section id="referral" className="py-20 bg-gradient-to-br from-accent/10 via-background to-primary/10">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <Badge variant="outline" className="mb-4 text-primary border-primary">
            <Gift className="w-3 h-3 mr-1" />
            Program Poleceń
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Poleć Papugę i zyskaj darmowe pytania!
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Za każde polecenie otrzymujesz dodatkowe pytania do wykorzystania. Im więcej polecisz, tym więcej zyskujesz!
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {benefits.map((benefit, index) => (
              <Card key={index} className="bg-card border-2 border-primary/20 hover:border-primary/40 transition-colors">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                      <benefit.icon className="w-7 h-7 text-primary" />
                    </div>
                    <p className="text-lg font-medium text-foreground">{benefit.text}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="border-2 border-primary/30 shadow-lg bg-gradient-to-br from-primary/5 to-accent/5">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Twój link polecający</CardTitle>
              <CardDescription>
                Udostępnij go znajomym i zbieraj nagrody
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex gap-2">
                <Input 
                  value={referralLink} 
                  readOnly 
                  className="bg-background"
                />
                <Button 
                  onClick={handleCopy}
                  variant="outline"
                  className="shrink-0 min-w-[100px]"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Skopiowano
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-2" />
                      Kopiuj
                    </>
                  )}
                </Button>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <Button 
                  onClick={() => navigate("/auth")}
                  className="bg-primary hover:bg-primary/90"
                >
                  Zacznij za Darmo (5 pytań)
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>

              <div className="text-center pt-4 border-t border-border">
                <p className="text-sm text-muted-foreground">
                  Już masz konto? <button onClick={() => navigate("/auth")} className="text-primary hover:underline">Zaloguj się</button> i sprawdź swoje polecenia w panelu użytkownika.
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="mt-8 text-center">
            <p className="text-sm text-muted-foreground">
              * Nagrody są naliczane automatycznie po rejestracji poleconej osoby
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ReferralProgram;
