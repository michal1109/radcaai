import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Briefcase, 
  FileText, 
  Home, 
  Users, 
  Building2, 
  Gavel 
} from "lucide-react";

const services = [
  {
    icon: Briefcase,
    title: "Prawo gospodarcze",
    description: "Obsługa prawna firm, kontrakty, umowy handlowe i doradztwo biznesowe."
  },
  {
    icon: FileText,
    title: "Prawo cywilne",
    description: "Sprawy spadkowe, rodzinne, zobowiązania i odszkodowania."
  },
  {
    icon: Home,
    title: "Prawo nieruchomości",
    description: "Transakcje kupna-sprzedaży, dzierżawy i zarządzanie nieruchomościami."
  },
  {
    icon: Users,
    title: "Prawo pracy",
    description: "Umowy o pracę, spory pracownicze i doradztwo dla pracodawców."
  },
  {
    icon: Building2,
    title: "Prawo budowlane",
    description: "Pozwolenia, inwestycje budowlane i sprawy administracyjne."
  },
  {
    icon: Gavel,
    title: "Reprezentacja sądowa",
    description: "Profesjonalna reprezentacja w postępowaniach sądowych i arbitrażowych."
  }
];

const Services = () => {
  return (
    <section id="uslugi" className="py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-4xl lg:text-5xl font-bold text-foreground">
            Zakres usług
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Oferujemy kompleksową obsługę prawną w szerokim zakresie dziedzin prawa
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, index) => {
            const Icon = service.icon;
            return (
              <Card 
                key={index}
                className="border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-lg group"
              >
                <CardHeader>
                  <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                    <Icon className="w-7 h-7 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{service.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {service.description}
                  </CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Services;
