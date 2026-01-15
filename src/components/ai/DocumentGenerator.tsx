import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, FileText, Download, CreditCard, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { useSearchParams } from "react-router-dom";

const documentTypes = [
  { value: "umowa_najmu", label: "Umowa najmu", premium: false },
  { value: "umowa_o_prace", label: "Umowa o pracę", premium: false },
  { value: "pelnomocnictwo", label: "Pełnomocnictwo", premium: false },
  { value: "oswiadczenie", label: "Oświadczenie", premium: false },
  { value: "umowa_sprzedazy", label: "Umowa sprzedaży", premium: false },
  { value: "umowa_zlecenia", label: "Umowa zlecenia", premium: false },
  { value: "umowa_o_dzielo", label: "Umowa o dzieło", premium: true },
  { value: "pozew_cywilny", label: "Pozew cywilny", premium: true },
  { value: "odpowiedz_na_pozew", label: "Odpowiedź na pozew", premium: true },
  { value: "wniosek_spadkowy", label: "Wniosek o stwierdzenie nabycia spadku", premium: true },
  { value: "testament", label: "Testament", premium: true },
];

const DocumentGenerator = () => {
  const [documentType, setDocumentType] = useState("umowa_najmu");
  const [details, setDetails] = useState("");
  const [generatedDocument, setGeneratedDocument] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPaying, setIsPaying] = useState(false);
  const [userTier, setUserTier] = useState<string>("free");
  const { toast } = useToast();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    checkUserTier();
    
    // Check if returning from successful payment
    const documentPaid = searchParams.get("document_paid");
    if (documentPaid === "true") {
      toast({
        title: "Płatność zakończona",
        description: "Możesz teraz wygenerować swój dokument!",
      });
    }
  }, [searchParams]);

  const checkUserTier = async () => {
    try {
      const { data } = await supabase.functions.invoke('check-subscription');
      if (data?.tier) {
        setUserTier(data.tier);
      }
    } catch (error) {
      // Default to free tier
    }
  };

  const isPremiumDocument = documentTypes.find(d => d.value === documentType)?.premium || false;
  const canGeneratePremiumFree = userTier === "pro" || userTier === "premium";

  const handleMicropayment = async () => {
    setIsPaying(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-document-payment", {
        body: { documentType },
      });

      if (error) throw error;

      if (data?.url) {
        window.open(data.url, "_blank");
      }
    } catch (error: any) {
      if (import.meta.env.DEV) {
        console.error("Payment error:", error);
      }
      toast({
        title: "Błąd płatności",
        description: error.message || "Nie udało się utworzyć sesji płatności",
        variant: "destructive",
      });
    } finally {
      setIsPaying(false);
    }
  };

  const generateDocument = async () => {
    if (!details.trim()) {
      toast({
        title: "Błąd",
        description: "Proszę podać szczegóły dokumentu",
        variant: "destructive",
      });
      return;
    }

    // For premium documents on free/basic tier, require payment
    if (isPremiumDocument && !canGeneratePremiumFree) {
      toast({
        title: "Dokument premium",
        description: "Ten dokument wymaga jednorazowej płatności (7 PLN) lub planu Pro/Premium",
      });
      return;
    }

    setIsGenerating(true);
    setGeneratedDocument("");

    try {
      const { data, error } = await supabase.functions.invoke("generate-document", {
        body: { documentType, details },
      });

      if (error) throw error;

      setGeneratedDocument(data.document);
      toast({
        title: "Dokument wygenerowany",
        description: "Twój dokument jest gotowy",
      });
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error("Generation error:", error);
      }
      toast({
        title: "Błąd",
        description: "Nie udało się wygenerować dokumentu",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadDocument = () => {
    const blob = new Blob([generatedDocument], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${documentType}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Card className="border-2 p-6">
      <div className="space-y-6">
        {/* Info about micropayments */}
        <div className="bg-primary/5 rounded-lg p-4 border border-primary/20">
          <div className="flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-primary mt-0.5" />
            <div>
              <p className="text-sm font-medium text-foreground">Dokumenty prawne</p>
              <p className="text-xs text-muted-foreground mt-1">
                Podstawowe dokumenty w cenie planu. Zaawansowane dokumenty (pozwy, testamenty) dostępne w planie Pro/Premium lub za jednorazową opłatę 7 PLN.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Typ dokumentu</Label>
          <Select value={documentType} onValueChange={setDocumentType}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {documentTypes.map((doc) => (
                <SelectItem key={doc.value} value={doc.value}>
                  <span className="flex items-center gap-2">
                    {doc.label}
                    {doc.premium && (
                      <Badge variant="secondary" className="text-xs">
                        Premium
                      </Badge>
                    )}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="details">Szczegóły dokumentu</Label>
          <Textarea
            id="details"
            placeholder="Podaj szczegóły, które powinny znaleźć się w dokumencie (np. imiona i nazwiska stron, adresy, kwoty, daty, itp.)..."
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            className="min-h-[150px]"
          />
        </div>

        {/* Show payment option for premium documents on free/basic tier */}
        {isPremiumDocument && !canGeneratePremiumFree && (
          <div className="bg-muted rounded-lg p-4 space-y-3">
            <p className="text-sm text-muted-foreground">
              Ten dokument wymaga jednorazowej płatności <strong>7 PLN</strong> lub planu Pro/Premium.
            </p>
            <Button 
              onClick={handleMicropayment} 
              disabled={isPaying}
              variant="outline"
              className="w-full"
            >
              {isPaying ? (
                <>
                  <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                  Przetwarzanie...
                </>
              ) : (
                <>
                  <CreditCard className="mr-2 w-4 h-4" />
                  Kup ten dokument (7 PLN)
                </>
              )}
            </Button>
          </div>
        )}

        <Button 
          onClick={generateDocument} 
          disabled={isGenerating || (isPremiumDocument && !canGeneratePremiumFree)} 
          className="w-full"
        >
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 w-4 h-4 animate-spin" />
              Generowanie...
            </>
          ) : (
            <>
              <FileText className="mr-2 w-4 h-4" />
              Generuj dokument
            </>
          )}
        </Button>

        {generatedDocument && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Wygenerowany dokument</Label>
              <Button onClick={downloadDocument} variant="outline" size="sm">
                <Download className="mr-2 w-4 h-4" />
                Pobierz
              </Button>
            </div>
            <Card className="p-4 bg-muted max-h-[400px] overflow-y-auto">
              <pre className="whitespace-pre-wrap text-sm font-mono">{generatedDocument}</pre>
            </Card>
          </div>
        )}
      </div>
    </Card>
  );
};

export default DocumentGenerator;
