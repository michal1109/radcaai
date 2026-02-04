import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, FileText, ArrowRight } from "lucide-react";
import LegalDisclaimer from "./LegalDisclaimer";

interface TermsAcceptanceProps {
  onAccept: () => void;
}

const TermsAcceptance = ({ onAccept }: TermsAcceptanceProps) => {
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [aiLimitationsAccepted, setAiLimitationsAccepted] = useState(false);

  const canProceed = termsAccepted && aiLimitationsAccepted;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card className="border-2">
        <CardHeader className="text-center pb-4">
          <CardTitle className="flex items-center justify-center gap-2 text-2xl">
            <FileText className="w-6 h-6 text-primary" />
            Przed rozpoczęciem
          </CardTitle>
          <p className="text-muted-foreground text-sm">
            Zapoznaj się z poniższymi informacjami i zaakceptuj warunki korzystania
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <LegalDisclaimer showFindLawyer={false} />

          <div className="space-y-4 pt-4 border-t">
            <div className="flex items-start space-x-3">
              <Checkbox
                id="terms"
                checked={termsAccepted}
                onCheckedChange={(checked) => setTermsAccepted(checked === true)}
                className="mt-1"
              />
              <label
                htmlFor="terms"
                className="text-sm leading-relaxed cursor-pointer"
              >
                <strong>Akceptuję regulamin</strong> i rozumiem, że RadcaAI dostarcza 
                wyłącznie ogólnych informacji prawnych, które nie stanowią porady prawnej 
                w rozumieniu ustawy o radcach prawnych oraz ustawy Prawo o adwokaturze.
              </label>
            </div>

            <div className="flex items-start space-x-3">
              <Checkbox
                id="ai-limitations"
                checked={aiLimitationsAccepted}
                onCheckedChange={(checked) => setAiLimitationsAccepted(checked === true)}
                className="mt-1"
              />
              <label
                htmlFor="ai-limitations"
                className="text-sm leading-relaxed cursor-pointer"
              >
                <strong>Rozumiem ograniczenia AI</strong> – odpowiedzi są generowane przez 
                sztuczną inteligencję i mogą zawierać błędy lub nieaktualne informacje. 
                W ważnych sprawach skonsultuję się z prawnikiem.
              </label>
            </div>
          </div>

          <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <p className="text-sm text-amber-800 dark:text-amber-200">
                <strong>Przypomnienie:</strong> Przed wgraniem jakichkolwiek dokumentów, 
                usuń z nich dane osobowe, adresy i numery PESEL dla ochrony swojej prywatności.
              </p>
            </div>
          </div>

          <Button
            onClick={onAccept}
            disabled={!canProceed}
            className="w-full"
            size="lg"
          >
            Rozpocznij korzystanie z RadcaAI
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default TermsAcceptance;
