import { AlertTriangle, Scale, Shield, ExternalLink } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface LegalDisclaimerProps {
  compact?: boolean;
  showFindLawyer?: boolean;
}

const LegalDisclaimer = ({ compact = false, showFindLawyer = true }: LegalDisclaimerProps) => {
  const lawyerLinks = [
    { name: "NRA (Adwokaci)", url: "https://www.adwokatura.pl/znajdz-adwokata/" },
    { name: "KIRP (Radcowie)", url: "https://rejestr.kirp.pl/home" },
  ];

  if (compact) {
    return (
      <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-lg border border-border">
        <div className="flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
          <p>
            <strong>RadcaAI</strong> dostarcza wyłącznie ogólnych informacji prawnych i nie stanowi 
            porady prawnej. Odpowiedzi są generowane przez AI i mogą zawierać błędy.
          </p>
        </div>
      </div>
    );
  }

  return (
    <Card className="border-primary/20 bg-card">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-full bg-primary/10">
            <Scale className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1 space-y-4">
            <h3 className="font-bold text-lg text-foreground flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              Ważne informacje prawne
            </h3>
            <div className="space-y-3 text-sm text-muted-foreground">
              <p>
                <strong className="text-foreground">Aplikacja RadcaAI dostarcza wyłącznie ogólnych informacji prawnych</strong>{" "}
                i nie stanowi porady prawnej w rozumieniu ustawy o radcach prawnych oraz ustawy 
                Prawo o adwokaturze. Użycie aplikacji nie tworzy relacji klient-prawnik.
              </p>
              <p>
                <strong className="text-foreground">Odpowiedzi generowane przez AI mogą zawierać błędy.</strong>{" "}
                Stan prawny może się zmieniać. Zawsze weryfikuj kluczowe informacje w oficjalnych 
                źródłach prawnych (np. ISAP, LEX, Legalis).
              </p>
              <p>
                <strong className="text-foreground">W sprawach wymagających profesjonalnej pomocy prawnej</strong>{" "}
                zalecamy konsultację z radcą prawnym lub adwokatem.
              </p>
            </div>
            
            {showFindLawyer && (
              <div className="flex flex-wrap gap-2 pt-2">
                {lawyerLinks.map((link) => (
                  <Button
                    key={link.name}
                    variant="outline"
                    size="sm"
                    asChild
                    className="gap-2"
                  >
                    <a href={link.url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-3 h-3" />
                      {link.name}
                    </a>
                  </Button>
                ))}
              </div>
            )}
            
            <div className="flex items-center gap-2 pt-2 text-xs text-muted-foreground border-t border-border/50">
              <Shield className="w-4 h-4" />
              <span>Twoje dane są chronione zgodnie z RODO</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default LegalDisclaimer;
