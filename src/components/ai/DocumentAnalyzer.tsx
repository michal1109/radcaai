import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, FileSearch } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const DocumentAnalyzer = () => {
  const [content, setContent] = useState("");
  const [analysisType, setAnalysisType] = useState("legal");
  const [analysis, setAnalysis] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { toast } = useToast();

  const analyzeDocument = async () => {
    if (!content.trim()) {
      toast({
        title: "Błąd",
        description: "Proszę wpisać treść dokumentu",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    setAnalysis("");

    try {
      const { data, error } = await supabase.functions.invoke("analyze-document", {
        body: { content, analysisType },
      });

      if (error) throw error;

      setAnalysis(data.analysis);
      toast({
        title: "Analiza zakończona",
        description: "Dokument został przeanalizowany",
      });
    } catch (error) {
      console.error("Analysis error:", error);
      toast({
        title: "Błąd",
        description: "Nie udało się przeanalizować dokumentu",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <Card className="border-2 p-6">
      <div className="space-y-6">
        <div className="space-y-2">
          <Label>Typ analizy</Label>
          <Select value={analysisType} onValueChange={setAnalysisType}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="legal">Analiza prawna</SelectItem>
              <SelectItem value="contract">Analiza umowy</SelectItem>
              <SelectItem value="compliance">Zgodność z prawem</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="document">Treść dokumentu</Label>
          <Textarea
            id="document"
            placeholder="Wklej tutaj treść dokumentu do analizy..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[200px]"
          />
        </div>

        <Button onClick={analyzeDocument} disabled={isAnalyzing} className="w-full">
          {isAnalyzing ? (
            <>
              <Loader2 className="mr-2 w-4 h-4 animate-spin" />
              Analizowanie...
            </>
          ) : (
            <>
              <FileSearch className="mr-2 w-4 h-4" />
              Analizuj dokument
            </>
          )}
        </Button>

        {analysis && (
          <div className="space-y-2">
            <Label>Wynik analizy</Label>
            <Card className="p-4 bg-muted">
              <p className="whitespace-pre-wrap text-sm">{analysis}</p>
            </Card>
          </div>
        )}
      </div>
    </Card>
  );
};

export default DocumentAnalyzer;