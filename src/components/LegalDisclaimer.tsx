import { AlertTriangle, Scale, Shield } from "lucide-react";
import { Card, CardContent } from "./ui/card";

const LegalDisclaimer = () => {
  return (
    <section className="py-12 bg-muted/50">
      <div className="container mx-auto px-4">
        <Card className="border-amber-500/30 bg-amber-50/50 dark:bg-amber-950/20">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-full bg-amber-100 dark:bg-amber-900/30">
                <AlertTriangle className="w-6 h-6 text-amber-600 dark:text-amber-400" />
              </div>
              <div className="flex-1 space-y-4">
                <h3 className="font-bold text-lg text-foreground flex items-center gap-2">
                  <Scale className="w-5 h-5 text-primary" />
                  Ważne informacje prawne
                </h3>
                <div className="space-y-3 text-sm text-muted-foreground">
                  <p>
                    <strong className="text-foreground">Papuga AI nie jest prawnikiem.</strong>{" "}
                    Usługa ma charakter wyłącznie informacyjny i edukacyjny. Treści generowane przez sztuczną 
                    inteligencję nie stanowią porady prawnej w rozumieniu przepisów prawa.
                  </p>
                  <p>
                    <strong className="text-foreground">Ograniczenia odpowiedzialności:</strong>{" "}
                    Właściciel serwisu nie ponosi odpowiedzialności za decyzje podjęte na podstawie 
                    informacji uzyskanych za pośrednictwem Papugi AI. W sprawach wymagających 
                    profesjonalnej pomocy prawnej zalecamy konsultację z radcą prawnym lub adwokatem.
                  </p>
                  <p>
                    <strong className="text-foreground">Dokładność informacji:</strong>{" "}
                    Mimo dołożenia starań, odpowiedzi AI mogą zawierać nieścisłości. Stan prawny 
                    może się zmieniać. Zawsze weryfikuj kluczowe informacje w oficjalnych źródłach.
                  </p>
                </div>
                <div className="flex items-center gap-2 pt-2 text-xs text-muted-foreground">
                  <Shield className="w-4 h-4" />
                  <span>Twoje dane są chronione zgodnie z RODO</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default LegalDisclaimer;
