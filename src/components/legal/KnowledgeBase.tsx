import { ExternalLink, BookOpen, Scale, FileText, Users, Building2, Briefcase, Home, Shield } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const legalResources = [
  {
    category: "Kodeksy",
    icon: Scale,
    items: [
      { name: "Kodeks cywilny", url: "https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=WDU19640160093" },
      { name: "Kodeks karny", url: "https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=WDU19970880553" },
      { name: "Kodeks postępowania cywilnego", url: "https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=WDU19640430296" },
      { name: "Kodeks postępowania karnego", url: "https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=WDU19970890555" },
      { name: "Kodeks pracy", url: "https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=WDU19740240141" },
      { name: "Kodeks rodzinny i opiekuńczy", url: "https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=WDU19640090059" },
    ],
  },
  {
    category: "Prawo cywilne",
    icon: FileText,
    items: [
      { name: "Ustawa o prawach konsumenta", url: "https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=WDU20140000827" },
      { name: "Prawo o notariacie", url: "https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=WDU19910220091" },
      { name: "Ustawa o księgach wieczystych", url: "https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=WDU19820190147" },
    ],
  },
  {
    category: "Prawo pracy",
    icon: Briefcase,
    items: [
      { name: "Ustawa o związkach zawodowych", url: "https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=WDU19910550234" },
      { name: "Ustawa o rozwiązywaniu sporów zbiorowych", url: "https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=WDU19910550236" },
      { name: "Ustawa o zatrudnianiu pracowników tymczasowych", url: "https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=WDU20031661608" },
    ],
  },
  {
    category: "Prawo rodzinne",
    icon: Users,
    items: [
      { name: "Ustawa o pomocy społecznej", url: "https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=WDU20040640593" },
      { name: "Ustawa o świadczeniach rodzinnych", url: "https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=WDU20032282255" },
      { name: "Ustawa o przeciwdziałaniu przemocy domowej", url: "https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=WDU20051801493" },
    ],
  },
  {
    category: "Prawo administracyjne",
    icon: Building2,
    items: [
      { name: "Kodeks postępowania administracyjnego", url: "https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=WDU19600300168" },
      { name: "Prawo budowlane", url: "https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=WDU19940890414" },
      { name: "Ustawa o samorządzie gminnym", url: "https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=WDU19900160095" },
    ],
  },
  {
    category: "Prawo mieszkaniowe",
    icon: Home,
    items: [
      { name: "Ustawa o ochronie praw lokatorów", url: "https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=WDU20010710733" },
      { name: "Ustawa o własności lokali", url: "https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=WDU19940850388" },
      { name: "Ustawa o spółdzielniach mieszkaniowych", url: "https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=WDU20011191116" },
    ],
  },
  {
    category: "Ochrona danych",
    icon: Shield,
    items: [
      { name: "Ustawa o ochronie danych osobowych", url: "https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=WDU20180001000" },
      { name: "RODO (rozporządzenie UE)", url: "https://eur-lex.europa.eu/legal-content/PL/TXT/?uri=CELEX:32016R0679" },
    ],
  },
];

const KnowledgeBase = () => {
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-foreground flex items-center justify-center gap-2">
          <BookOpen className="w-6 h-6 text-primary" />
          Baza Wiedzy Prawnej
        </h2>
        <p className="text-muted-foreground mt-2">
          Ujednolicone teksty aktów prawnych z serwisu ISAP (sejm.gov.pl)
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {legalResources.map((category) => (
          <Card key={category.category} className="border hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <category.icon className="w-5 h-5 text-primary" />
                {category.category}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {category.items.map((item) => (
                <Button
                  key={item.name}
                  variant="ghost"
                  size="sm"
                  asChild
                  className="w-full justify-start text-left h-auto py-2 px-3 text-sm font-normal hover:bg-primary/5"
                >
                  <a href={item.url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-3 h-3 mr-2 shrink-0" />
                    <span className="truncate">{item.name}</span>
                  </a>
                </Button>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-muted/50 border-dashed">
        <CardContent className="p-4 text-center text-sm text-muted-foreground">
          <p>
            Wszystkie linki prowadzą do oficjalnego Internetowego Systemu Aktów Prawnych (ISAP) 
            prowadzonego przez Kancelarię Sejmu RP.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default KnowledgeBase;
