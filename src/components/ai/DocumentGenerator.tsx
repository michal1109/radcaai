import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, FileText, Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const DocumentGenerator = () => {
  const [documentType, setDocumentType] = useState("umowa_najmu");
  const [details, setDetails] = useState("");
  const [generatedDocument, setGeneratedDocument] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const generateDocument = async () => {
    if (!details.trim()) {
      toast({
        title: "Błąd",
        description: "Proszę podać szczegóły dokumentu",
        variant: "destructive",
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
        <div className="space-y-2">
          <Label>Typ dokumentu</Label>
          <Select value={documentType} onValueChange={setDocumentType}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="umowa_najmu">Umowa najmu</SelectItem>
              <SelectItem value="umowa_o_prace">Umowa o pracę</SelectItem>
              <SelectItem value="pelnomocnictwo">Pełnomocnictwo</SelectItem>
              <SelectItem value="oswiadczenie">Oświadczenie</SelectItem>
              <SelectItem value="umowa_sprzedazy">Umowa sprzedaży</SelectItem>
              <SelectItem value="umowa_zlecenia">Umowa zlecenia</SelectItem>
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

        <Button onClick={generateDocument} disabled={isGenerating} className="w-full">
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