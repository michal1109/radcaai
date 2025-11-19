import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { FileText, Download, FileImage, FileType } from "lucide-react";

const DOCUMENT_TEMPLATES = [
  {
    id: "umowa-najmu",
    name: "Umowa najmu mieszkania",
    fields: ["wynajmujący", "najemca", "adres_lokalu", "czynsz", "data_rozpoczęcia"],
    template: `UMOWA NAJMU LOKALU MIESZKALNEGO

zawarta w dniu ........................ pomiędzy:

{wynajmujący} - jako Wynajmującym

a

{najemca} - jako Najemcą

§1
Wynajmujący oddaje Najemcy w najem lokal mieszkalny położony przy ul. {adres_lokalu}.

§2
Najem zostaje ustalony na czas nieoznaczony, począwszy od dnia {data_rozpoczęcia}.

§3
Najemca zobowiązuje się płacić czynsz najmu w wysokości {czynsz} PLN miesięcznie, płatny z góry do 10. dnia każdego miesiąca.

§4
Umowa została sporządzona w dwóch jednobrzmiących egzemplarzach, po jednym dla każdej ze stron.`
  },
  {
    id: "pelnomocnictwo",
    name: "Pełnomocnictwo ogólne",
    fields: ["mocodawca", "pełnomocnik", "zakres"],
    template: `PEŁNOMOCNICTWO

Ja, niżej podpisany/a {mocodawca}, zamieszkały/a ..............................

niniejszym udzielam pełnomocnictwa

Panu/Pani {pełnomocnik}, zamieszkałemu/ej ..............................

do {zakres}

z prawem do:
- występowania we wszystkich instancjach
- składania oświadczeń woli w moim imieniu
- dokonywania wszelkich czynności związanych z powierzonym zakresem

Pełnomocnictwo jest ważne od dnia ............................. do dnia .............................

Data i podpis mocodawcy: .............................`
  },
  {
    id: "umowa-kupna-sprzedazy",
    name: "Umowa kupna-sprzedaży",
    fields: ["sprzedawca", "kupujący", "przedmiot", "cena"],
    template: `UMOWA KUPNA-SPRZEDAŻY

zawarta w dniu ........................ pomiędzy:

{sprzedawca} - jako Sprzedawcą

a

{kupujący} - jako Kupującym

§1
Sprzedawca sprzedaje, a Kupujący kupuje: {przedmiot}

§2
Strony ustalają cenę na kwotę {cena} PLN (słownie: ..............................).

§3
Kupujący oświadcza, że nabywany przedmiot obejrzał i uznał za odpowiadający jego oczekiwaniom.

§4
Koszty związane z zawarciem umowy ponosi Kupujący.

§5
Umowa została sporządzona w dwóch jednobrzmiących egzemplarzach, po jednym dla każdej ze stron.`
  },
  {
    id: "umowa-zlecenia",
    name: "Umowa zlecenia",
    fields: ["zleceniodawca", "zleceniobiorca", "przedmiot_zlecenia", "wynagrodzenie"],
    template: `UMOWA ZLECENIA

zawarta w dniu ........................ pomiędzy:

{zleceniodawca} - jako Zleceniodawcą

a

{zleceniobiorca} - jako Zleceniobiorcą

§1
Zleceniodawca zleca, a Zleceniobiorca przyjmuje do wykonania następujące czynności:
{przedmiot_zlecenia}

§2
Za wykonanie zlecenia Zleceniobiorca otrzyma wynagrodzenie w wysokości {wynagrodzenie} PLN.

§3
Zleceniobiorca wykona zlecenie z należytą starannością, zgodnie z zasadami sztuki i wiedzy.

§4
Umowa została sporządzona w dwóch jednobrzmiących egzemplarzach, po jednym dla każdej ze stron.`
  },
  {
    id: "oswiadczenie-reklamacyjne",
    name: "Oświadczenie reklamacyjne",
    fields: ["reklamujący", "sprzedawca", "produkt", "wada", "żądanie"],
    template: `REKLAMACJA

Ja, {reklamujący}, zamieszkały/a ..............................

składam reklamację dotyczącą {produkt}, zakupionego w dniu ........................

u sprzedawcy: {sprzedawca}

Stwierdzona wada: {wada}

Na podstawie art. 43d ustawy o prawach konsumenta, wnoszę o:
{żądanie}

Proszę o rozpatrzenie reklamacji w ustawowym terminie 14 dni.

Data i podpis: .............................`
  },
  {
    id: "pozew-sadowy",
    name: "Pozew do sądu",
    fields: ["powód", "pozwany", "wartość_przedmiotu_sporu", "roszczenie", "uzasadnienie"],
    template: `DO SĄDU REJONOWEGO/OKRĘGOWEGO W ..............................

POZEW

Powód: {powód}
Adres: ..............................

Pozwany: {pozwany}
Adres: ..............................

Wartość przedmiotu sporu: {wartość_przedmiotu_sporu} PLR

Na podstawie ..............................

wnoszę o:

{roszczenie}

UZASADNIENIE

{uzasadnienie}

Opłata sądowa: ..............................

Data i podpis: .............................`
  }
];

const DocumentTools = () => {
  const { toast } = useToast();
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [documentContent, setDocumentContent] = useState("");
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [customPrompt, setCustomPrompt] = useState("");

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId);
    const template = DOCUMENT_TEMPLATES.find(t => t.id === templateId);
    if (template) {
      setDocumentContent(template.template);
      const initialData: Record<string, string> = {};
      template.fields.forEach(field => {
        initialData[field] = "";
      });
      setFormData(initialData);
    }
  };

  const handleFieldChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const fillTemplate = () => {
    const template = DOCUMENT_TEMPLATES.find(t => t.id === selectedTemplate);
    if (!template) return;

    let filled = template.template;
    Object.entries(formData).forEach(([key, value]) => {
      filled = filled.replace(new RegExp(`{${key}}`, 'g'), value || `{${key}}`);
    });
    setDocumentContent(filled);
    toast({
      title: "Szablon wypełniony",
      description: "Możesz teraz edytować dokument ręcznie",
    });
  };

  const generateCustomDocument = async () => {
    if (!customPrompt.trim()) {
      toast({
        title: "Błąd",
        description: "Proszę podać opis dokumentu",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-document", {
        body: { 
          documentType: "custom",
          details: customPrompt 
        },
      });

      if (error) throw error;

      setDocumentContent(data.document);
      toast({
        title: "Sukces",
        description: "Dokument został wygenerowany",
      });
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Błąd",
        description: "Nie udało się wygenerować dokumentu",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const exportToPDF = () => {
    // Create a simple HTML document
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; line-height: 1.6; }
          pre { white-space: pre-wrap; font-family: inherit; }
        </style>
      </head>
      <body>
        <pre>${documentContent}</pre>
      </body>
      </html>
    `;
    
    const blob = new Blob([htmlContent], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "dokument.html";
    a.click();
    
    toast({
      title: "Eksport",
      description: "Dokument HTML został pobrany. Możesz go otworzyć w przeglądarce i zapisać jako PDF.",
    });
  };

  const exportToWord = () => {
    const blob = new Blob([documentContent], { type: "application/msword" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "dokument.doc";
    a.click();
    
    toast({
      title: "Eksport",
      description: "Dokument Word został pobrany",
    });
  };

  const exportToImage = () => {
    // Create canvas to render text
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = 800;
    const lines = documentContent.split('\n');
    canvas.height = lines.length * 20 + 40;

    // White background
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw text
    ctx.fillStyle = 'black';
    ctx.font = '14px Arial';
    lines.forEach((line, i) => {
      ctx.fillText(line, 20, 30 + i * 20);
    });

    // Download
    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "dokument.jpg";
        a.click();
        
        toast({
          title: "Eksport",
          description: "Dokument JPG został pobrany",
        });
      }
    }, 'image/jpeg');
  };

  const template = DOCUMENT_TEMPLATES.find(t => t.id === selectedTemplate);

  return (
    <div className="space-y-6">
      <Tabs defaultValue="templates" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="templates">Szablony dokumentów</TabsTrigger>
          <TabsTrigger value="custom">Niestandardowy dokument</TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="space-y-4">
          <Card className="p-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="template">Wybierz szablon dokumentu</Label>
                <Select value={selectedTemplate} onValueChange={handleTemplateSelect}>
                  <SelectTrigger>
                    <SelectValue placeholder="Wybierz szablon..." />
                  </SelectTrigger>
                  <SelectContent>
                    {DOCUMENT_TEMPLATES.map((template) => (
                      <SelectItem key={template.id} value={template.id}>
                        {template.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {template && (
                <>
                  <div className="space-y-3 border-t pt-4">
                    <h3 className="font-semibold">Wypełnij dane:</h3>
                    {template.fields.map((field) => (
                      <div key={field}>
                        <Label htmlFor={field}>{field.replace(/_/g, ' ')}</Label>
                        <Input
                          id={field}
                          value={formData[field] || ""}
                          onChange={(e) => handleFieldChange(field, e.target.value)}
                          placeholder={`Wprowadź ${field.replace(/_/g, ' ')}`}
                        />
                      </div>
                    ))}
                  </div>

                  <Button onClick={fillTemplate} className="w-full">
                    <FileText className="w-4 h-4 mr-2" />
                    Wypełnij szablon
                  </Button>
                </>
              )}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="custom" className="space-y-4">
          <Card className="p-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="customPrompt">Opisz dokument, który chcesz wygenerować</Label>
                <Textarea
                  id="customPrompt"
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  placeholder="Np. 'Umowa o dzieło na wykonanie strony internetowej, wynagrodzenie 5000 zł, termin 30 dni'"
                  className="min-h-[100px]"
                />
              </div>

              <Button 
                onClick={generateCustomDocument} 
                disabled={isGenerating}
                className="w-full"
              >
                <FileText className="w-4 h-4 mr-2" />
                {isGenerating ? "Generowanie..." : "Wygeneruj dokument"}
              </Button>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {documentContent && (
        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-lg">Wygenerowany dokument</h3>
              <div className="flex gap-2">
                <Button onClick={exportToPDF} variant="outline" size="sm">
                  <FileText className="w-4 h-4 mr-2" />
                  PDF/HTML
                </Button>
                <Button onClick={exportToWord} variant="outline" size="sm">
                  <FileType className="w-4 h-4 mr-2" />
                  Word
                </Button>
                <Button onClick={exportToImage} variant="outline" size="sm">
                  <FileImage className="w-4 h-4 mr-2" />
                  JPG
                </Button>
              </div>
            </div>

            <Textarea
              value={documentContent}
              onChange={(e) => setDocumentContent(e.target.value)}
              className="min-h-[400px] font-mono text-sm"
            />

            <Button 
              onClick={() => {
                const blob = new Blob([documentContent], { type: "text/plain" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = "dokument.txt";
                a.click();
              }}
              className="w-full"
            >
              <Download className="w-4 h-4 mr-2" />
              Pobierz jako TXT
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};

export default DocumentTools;
