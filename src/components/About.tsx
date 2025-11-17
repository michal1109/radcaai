import { CheckCircle2 } from "lucide-react";
import papuga1 from "@/assets/papuga-1.png";

const advantages = [
  "Indywidualne podejście do każdego klienta",
  "Wieloletnie doświadczenie w branży prawniczej",
  "Kompleksowa obsługa prawna",
  "Przejrzyste zasady współpracy",
  "Dostępność i szybki kontakt",
  "Konkurencyjne stawki"
];

const About = () => {
  return (
    <section id="o-nas" className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Image */}
          <div className="relative flex justify-center">
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-br from-primary/20 to-accent/20 rounded-3xl blur-2xl" />
              <img 
                src={papuga1} 
                alt="Papuga - O nas" 
                className="relative w-full max-w-md h-auto drop-shadow-2xl rounded-2xl"
              />
            </div>
          </div>

          {/* Right Column - Content */}
          <div className="space-y-6">
            <div className="space-y-4">
              <h2 className="text-4xl lg:text-5xl font-bold text-foreground">
                O kancelarii
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Kancelaria Papuga to zespół doświadczonych prawników, którzy z pasją 
                pomagają klientom rozwiązywać ich problemy prawne. Nasza misja to 
                dostarczanie najwyższej jakości usług prawnych w przystępnej formie.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Specjalizujemy się w obsłudze zarówno klientów indywidualnych, 
                jak i firm. Dzięki wieloletniemu doświadczeniu i stałemu podnoszeniu 
                kwalifikacji, zapewniamy profesjonalną pomoc w każdej sprawie.
              </p>
            </div>

            <div className="space-y-3 pt-4">
              <h3 className="text-2xl font-semibold text-foreground mb-4">
                Dlaczego my?
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
