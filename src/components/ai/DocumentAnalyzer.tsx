import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, FileSearch, Upload, X, FileImage, FileText, ScanText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface UploadedFile {
  file: File;
  preview?: string;
  base64?: string;
}

const DocumentAnalyzer = () => {
  const [content, setContent] = useState("");
  const [analysisType, setAnalysisType] = useState("legal");
  const [analysis, setAnalysis] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Błąd",
        description: "Dozwolone formaty: JPG, PNG, PDF, DOC, DOCX",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "Błąd",
        description: "Maksymalny rozmiar pliku to 10MB",
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      setUploadedFile({
        file,
        preview: file.type.startsWith('image/') ? base64 : undefined,
        base64
      });
    };
    reader.readAsDataURL(file);
  };

  const removeFile = () => {
    setUploadedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return <FileImage className="w-8 h-8 text-primary" />;
    return <FileText className="w-8 h-8 text-primary" />;
  };

  const extractTextFromImage = async () => {
    if (!uploadedFile || !uploadedFile.file.type.startsWith('image/')) {
      toast({
        title: "Błąd",
        description: "OCR działa tylko dla plików graficznych (JPG, PNG)",
        variant: "destructive",
      });
      return;
    }

    setIsExtracting(true);

    try {
      const { data, error } = await supabase.functions.invoke("extract-text-ocr", {
        body: { imageBase64: uploadedFile.base64 },
      });

      if (error) throw error;

      if (data.text) {
        setContent(data.text);
        removeFile();
        toast({
          title: "Tekst wyodrębniony",
          description: "Tekst z obrazu został rozpoznany i wklejony do pola tekstowego",
        });
      } else {
        toast({
          title: "Brak tekstu",
          description: "Nie udało się rozpoznać tekstu na obrazie",
          variant: "destructive",
        });
      }
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error("OCR error:", error);
      }
      toast({
        title: "Błąd OCR",
        description: "Nie udało się rozpoznać tekstu z obrazu",
        variant: "destructive",
      });
    } finally {
      setIsExtracting(false);
    }
  };

  const analyzeDocument = async () => {
    if (!content.trim() && !uploadedFile) {
      toast({
        title: "Błąd",
        description: "Wpisz treść dokumentu lub dodaj plik",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    setAnalysis("");

    try {
      const body: any = { analysisType };
      
      if (uploadedFile) {
        body.fileContent = uploadedFile.base64;
        body.fileType = uploadedFile.file.type;
      } else {
        body.content = content;
      }

      const { data, error } = await supabase.functions.invoke("analyze-document", {
        body,
      });

      if (error) throw error;

      setAnalysis(data.analysis);
      toast({
        title: "Analiza zakończona",
        description: "Dokument został przeanalizowany",
      });
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error("Analysis error:", error);
      }
      toast({
        title: "Błąd",
        description: "Nie udało się przeanalizować dokumentu",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const isImageFile = uploadedFile?.file.type.startsWith('image/');

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

        {/* File Upload Section */}
        <div className="space-y-2">
          <Label>Prześlij dokument (JPG, PNG, PDF, DOC)</Label>
          <input
            ref={fileInputRef}
            type="file"
            accept=".jpg,.jpeg,.png,.pdf,.doc,.docx"
            onChange={handleFileUpload}
            className="hidden"
          />
          
          {!uploadedFile ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 hover:bg-muted/50 transition-colors"
            >
              <Upload className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Kliknij aby przesłać plik lub przeciągnij i upuść
              </p>
              <p className="text-xs text-muted-foreground/70 mt-1">
                JPG, PNG, PDF, DOC, DOCX (max 10MB)
              </p>
            </div>
          ) : (
            <div className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-4">
                {uploadedFile.preview ? (
                  <img 
                    src={uploadedFile.preview} 
                    alt="Preview" 
                    className="w-16 h-16 object-cover rounded"
                  />
                ) : (
                  getFileIcon(uploadedFile.file.type)
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{uploadedFile.file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {(uploadedFile.file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <Button variant="ghost" size="icon" onClick={removeFile}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
              
              {/* OCR Button for images */}
              {isImageFile && (
                <Button 
                  variant="outline" 
                  onClick={extractTextFromImage} 
                  disabled={isExtracting}
                  className="w-full"
                >
                  {isExtracting ? (
                    <>
                      <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                      Rozpoznawanie tekstu...
                    </>
                  ) : (
                    <>
                      <ScanText className="mr-2 w-4 h-4" />
                      Wyodrębnij tekst (OCR)
                    </>
                  )}
                </Button>
              )}
            </div>
          )}
        </div>

        <div className="relative flex items-center">
          <div className="flex-1 border-t border-muted-foreground/25"></div>
          <span className="px-3 text-xs text-muted-foreground">lub wpisz treść</span>
          <div className="flex-1 border-t border-muted-foreground/25"></div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="document">Treść dokumentu</Label>
          <Textarea
            id="document"
            placeholder="Wklej tutaj treść dokumentu do analizy..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[150px]"
            disabled={!!uploadedFile}
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
