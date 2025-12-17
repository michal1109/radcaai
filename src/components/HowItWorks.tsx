import { Badge } from "./ui/badge";
import { Card, CardContent } from "./ui/card";
import { MessageSquare, FileSearch, FileText, CheckCircle } from "lucide-react";

const steps = [
  {
    icon: MessageSquare,
    step: "1",
    title: "Zadaj pytanie",
    description: "Opisz swoją sytuację prawną w prostych słowach. Możesz napisać lub wgrać dokument do analizy."
  },
  {
    icon: FileSearch,
    step: "2", 
    title: "AI analizuje",
    description: "Papuga przeanalizuje Twoją sprawę w kontekście polskiego prawa i przepisów."
  },
  {
    icon: FileText,
    step: "3",
    title: "Otrzymaj odpowiedź",
    description: "Dostaniesz zrozumiałą odpowiedź z wyjaśnieniem, opcjami działania i wzorami dokumentów."
  },
  {
    icon: CheckCircle,
    step: "4",
    title: "Działaj świadomie",
    description: "Podejmij decyzję ze świadomością prawnych konsekwencji. W razie potrzeby skonsultuj z prawnikiem."
  }
];

const exampleQuestions = [
  "Jak wypowiedzieć umowę najmu?",
  "Czy pracodawca może odmówić urlopu?",
  "Jak napisać reklamację?",
  "Co grozi za przekroczenie prędkości?",
  "Jak odzyskać dług od znajomego?"
];

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <Badge variant="outline" className="mb-4 text-primary border-primary">
            Jak to działa
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Pomoc prawna w 4 prostych krokach
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Uzyskaj odpowiedź na swoje pytanie prawne w kilka minut, nie godzin
          </p>
        </div>

        {/* Steps */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16 max-w-6xl mx-auto">
          {steps.map((item, index) => (
            <Card 
              key={index}
              className="relative bg-card hover:shadow-lg transition-all duration-300 hover:-translate-y-1 overflow-hidden"
            >
              <div className="absolute top-4 right-4 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-primary font-bold text-lg">{item.step}</span>
              </div>
              <CardContent className="p-6 pt-8">
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <item.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {item.description}
                </p>
              </CardContent>
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-3 w-6 h-0.5 bg-primary/30 transform -translate-y-1/2" />
              )}
            </Card>
          ))}
        </div>

        {/* Example Questions */}
        <div className="max-w-3xl mx-auto text-center">
          <h3 className="text-xl font-semibold text-foreground mb-6">
            Przykładowe pytania, które możesz zadać:
          </h3>
          <div className="flex flex-wrap justify-center gap-3">
            {exampleQuestions.map((question, index) => (
              <Badge 
                key={index}
                variant="secondary"
                className="px-4 py-2 text-sm cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                "{question}"
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
