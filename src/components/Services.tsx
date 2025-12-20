import { MessageSquare, FileText, BarChart3, Phone } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { useNavigate } from "react-router-dom";
import papuga1 from "@/assets/papuga-1.png";
import papuga2 from "@/assets/papuga-2.png";
import papuga3 from "@/assets/papuga-3.png";
import feathersBg from "@/assets/feathers-button-bg.jpg";

const services = [
  {
    icon: MessageSquare,
    image: papuga1,
    title: "Porady prawne",
    description: "Zadawaj pytania i otrzymuj odpowiedzi na problematyczne kwestie prawne",
    tab: "chat"
  },
  {
    icon: FileText,
    image: papuga2,
    title: "Generowanie dokumentów",
    description: "Twórz pozwy, wnioski i inne dokumenty prawne",
    tab: "generate"
  },
  {
    icon: BarChart3,
    image: papuga3,
    title: "Analiza sprawy",
    description: "Oceń szanse wygranej i poznaj możliwe scenariusze",
    tab: "chat"
  },
  {
    icon: Phone,
    image: papuga1,
    title: "Analiza dokumentów",
    description: "Prześlij dokumenty w formie zdjęć lub PDF do analizy",
    tab: "analyze"
  }
];

const Services = () => {
  const navigate = useNavigate();

  const handleCardClick = (tab: string) => {
    navigate(`/ai-assistant?tab=${tab}`);
  };

  return (
    <section id="services" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Funkcje Asystenta AI</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Kompleksowa pomoc prawna wspierana sztuczną inteligencją
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {services.map((service, index) => (
            <Card 
              key={index} 
              className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 animate-fade-in-delayed text-white border-none cursor-pointer overflow-hidden"
              style={{ 
                animationDelay: `${index * 100}ms`,
                backgroundImage: `url(${feathersBg})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
              onClick={() => handleCardClick(service.tab)}
            >
              <CardHeader>
                <div className="w-20 h-20 mx-auto mb-4">
                  <img 
                    src={service.image} 
                    alt={service.title}
                    className="w-full h-full object-contain drop-shadow-lg"
                  />
                </div>
                <CardTitle className="text-2xl text-center">{service.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base text-center text-white/90">
                  {service.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-16 max-w-3xl mx-auto">
          <Card className="bg-yellow-500/20 border-yellow-500/50">
            <CardHeader>
              <div className="flex items-start gap-3">
                <span className="text-3xl">⚠️</span>
                <div>
                  <CardTitle className="text-xl mb-2">Ważne</CardTitle>
                  <CardDescription className="text-base text-foreground/80">
                    Papuga to wirtualny asystent prawny. Porady mają charakter informacyjny i nie zastępują konsultacji z prawnikiem.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default Services;
