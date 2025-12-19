import { CheckCircle2, Bot, Brain, Shield, Database } from "lucide-react";
import papuga1 from "@/assets/papuga-1.png";

const advantages = [
  "Dostępność 24 godziny na dobę, 7 dni w tygodniu",
  "Natychmiastowe odpowiedzi na pytania prawne",
  "Generowanie dokumentów prawnych na żądanie",
  "Analiza dokumentów z plików PDF i zdjęć",
  "Oparty na polskim prawie i przepisach",
  "Rozmowy z asystentem głosowym"
];

const About = () => {
  return (
    <section id="about" className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Image */}
          <div className="relative flex justify-center">
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-br from-primary/20 to-accent/20 rounded-3xl blur-2xl" />
              <img 
                src={papuga1} 
                alt="Papuga - Asystent AI" 
                className="relative w-full max-w-md h-auto drop-shadow-2xl rounded-2xl"
              />
            </div>
          </div>

          {/* Right Column - Content */}
          <div className="space-y-6">
            <div className="space-y-4">
              <h2 className="text-4xl lg:text-5xl font-bold text-foreground">
                O Asystencie Papuga
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Papuga to zaawansowany asystent prawny oparty na sztucznej inteligencji, 
                który pomaga w codziennych kwestiach prawnych dostępny 24 godziny na dobę, 7 dni w tygodniu.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Nasz system wykorzystuje najnowsze modele językowe przeszkolone na polskim prawie, 
                aby dostarczać precyzyjne porady, generować dokumenty prawne i analizować sprawy sądowe.
              </p>
              
              {/* Data Sources Section */}
              <div className="bg-primary/5 rounded-lg p-4 border border-primary/20">
                <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                  <Database className="w-4 h-4 text-primary" />
                  Źródła danych
                </h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Dzienniki Ustaw RP (aktualizacja: grudzień 2024)</li>
                  <li>• Orzecznictwo Sądu Najwyższego</li>
                  <li>• Orzecznictwo Naczelnego Sądu Administracyjnego</li>
                  <li>• Kodeksy i ustawy w wersji ujednoliconej</li>
                  <li>• Komentarze prawnicze i doktryna</li>
                </ul>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-6 py-6">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-primary/10 flex items-center justify-center">
                  <Bot className="w-8 h-8 text-primary" />
                </div>
                <div className="text-sm font-medium text-foreground">Dostępność 24/7</div>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-primary/10 flex items-center justify-center">
                  <Brain className="w-8 h-8 text-primary" />
                </div>
                <div className="text-sm font-medium text-foreground">Sztuczna Inteligencja</div>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-primary/10 flex items-center justify-center">
                  <Shield className="w-8 h-8 text-primary" />
                </div>
                <div className="text-sm font-medium text-foreground">Polskie Prawo</div>
              </div>
            </div>

            <div className="space-y-3 pt-4">
              <h3 className="text-2xl font-semibold text-foreground mb-4">
                Co oferujemy?
              </h3>
              {advantages.map((advantage, index) => (
                <div key={index} className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" />
                  <p className="text-base text-foreground">{advantage}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
