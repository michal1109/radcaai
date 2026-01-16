import { Users, Zap, FileText, Shield } from "lucide-react";
import { Badge } from "./ui/badge";
import feathersBg from "@/assets/feathers-button-bg.jpg";

const stats = [
  {
    icon: Users,
    label: "Dołącz do pierwszych użytkowników",
    description: "Bądź wśród pionierów AI prawniczego"
  },
  {
    icon: Zap,
    label: "Szybkie i precyzyjne analizy prawne",
    description: "Odpowiedzi w kilka sekund"
  },
  {
    icon: FileText,
    label: "Generowanie dokumentów",
    description: "Pisma i umowy od ręki"
  },
  {
    icon: Shield,
    label: "Bezpieczeństwo danych",
    description: "Pełna poufność rozmów"
  }
];

const trustBadges = [
  "Bezpieczne szyfrowanie SSL",
  "Zgodność z RODO",
  "Polska firma",
  "Wsparcie 24/7"
];

const Stats = () => {
  return (
    <section 
      className="py-16 text-white relative overflow-hidden"
      style={{
        backgroundImage: `url(${feathersBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      <div className="absolute inset-0 bg-black/30" />
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {stats.map((stat, index) => (
            <div 
              key={index}
              className="text-center group"
            >
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
                <stat.icon className="w-8 h-8" />
              </div>
              <div className="text-lg font-medium mb-1">{stat.label}</div>
              <div className="text-sm text-white/70">{stat.description}</div>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap justify-center gap-4 mb-6">
          {trustBadges.map((badge, index) => (
            <Badge 
              key={index}
              variant="outline" 
              className="border-white/30 text-white bg-white/10 px-4 py-2"
            >
              {badge}
            </Badge>
          ))}
        </div>

        <p className="text-center text-white/60 text-sm">
          Wersja Beta - stale rozwijamy naszą bazę wiedzy
        </p>
      </div>
    </section>
  );
};

export default Stats;
