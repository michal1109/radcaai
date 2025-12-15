import { Users, MessageSquare, FileText, Shield } from "lucide-react";
import { Badge } from "./ui/badge";

const stats = [
  {
    icon: Users,
    value: "2,500+",
    label: "Aktywnych użytkowników",
    description: "Osób korzysta z Papugi"
  },
  {
    icon: MessageSquare,
    value: "150,000+",
    label: "Udzielonych porad",
    description: "Pytań prawnych rozwiązanych"
  },
  {
    icon: FileText,
    value: "25,000+",
    label: "Wygenerowanych dokumentów",
    description: "Pism i umów utworzonych"
  },
  {
    icon: Shield,
    value: "98%",
    label: "Satysfakcji",
    description: "Użytkowników poleca Papugę"
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
    <section className="py-16 bg-primary text-primary-foreground">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {stats.map((stat, index) => (
            <div 
              key={index}
              className="text-center group"
            >
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary-foreground/10 flex items-center justify-center group-hover:bg-primary-foreground/20 transition-colors">
                <stat.icon className="w-8 h-8" />
              </div>
              <div className="text-4xl font-bold mb-2">{stat.value}</div>
              <div className="text-lg font-medium mb-1">{stat.label}</div>
              <div className="text-sm text-primary-foreground/70">{stat.description}</div>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap justify-center gap-4">
          {trustBadges.map((badge, index) => (
            <Badge 
              key={index}
              variant="outline" 
              className="border-primary-foreground/30 text-primary-foreground bg-primary-foreground/10 px-4 py-2"
            >
              {badge}
            </Badge>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Stats;
