import { useState } from "react";
import { MessageSquare, FileText, BarChart3, Phone, Sparkles, ArrowRight, X } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
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
    longDescription: "Nasz asystent AI odpowiada na Twoje pytania prawne w sposób zrozumiały i przystępny. Możesz pytać o prawo pracy, prawo rodzinne, prawo cywilne i wiele innych dziedzin.",
    examples: ["Jak wypowiedzieć umowę o pracę?", "Jakie mam prawa jako konsument?", "Jak odwołać się od mandatu?"],
    tab: "chat",
    isNew: false
  },
  {
    icon: FileText,
    image: papuga2,
    title: "Generowanie dokumentów",
    description: "Twórz pozwy, wnioski i inne dokumenty prawne",
    longDescription: "Automatycznie generuj profesjonalne dokumenty prawne dostosowane do Twojej sytuacji. Oszczędź czas i pieniądze na wizytach u prawnika.",
    examples: ["Wezwanie do zapłaty", "Umowa najmu", "Reklamacja towaru"],
    tab: "generate",
    isNew: true
  },
  {
    icon: BarChart3,
    image: papuga3,
    title: "Analiza sprawy",
    description: "Oceń szanse wygranej i poznaj możliwe scenariusze",
    longDescription: "AI przeanalizuje Twoją sprawę i przedstawi możliwe scenariusze wraz z szacunkową oceną szans powodzenia. Podejmuj świadome decyzje.",
    examples: ["Analiza szans w sprawie o odszkodowanie", "Ocena ryzyka procesowego", "Przewidywane koszty postępowania"],
    tab: "chat",
    isNew: false
  },
  {
    icon: Phone,
    image: papuga1,
    title: "Analiza dokumentów",
    description: "Prześlij dokumenty w formie zdjęć lub PDF do analizy",
    longDescription: "Wyślij zdjęcie lub PDF dokumentu, a AI przeanalizuje jego treść i wyjaśni znaczenie poszczególnych klauzul oraz potencjalne ryzyka.",
    examples: ["Analiza umowy kredytowej", "Sprawdzenie warunków ubezpieczenia", "Weryfikacja aktu notarialnego"],
    tab: "analyze",
    isNew: true
  }
];

const Services = () => {
  const navigate = useNavigate();
  const [selectedService, setSelectedService] = useState<number | null>(null);
  const [hoveredService, setHoveredService] = useState<number | null>(null);

  const handleCardClick = (index: number) => {
    setSelectedService(index);
  };

  const handleGoToService = (tab: string) => {
    navigate(`/ai-assistant?tab=${tab}`);
    setSelectedService(null);
  };

  return (
    <section id="services" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Funkcje Asystenta AI</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Kompleksowa pomoc prawna wspierana sztuczną inteligencją
          </p>
        </motion.div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {services.map((service, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              onHoverStart={() => setHoveredService(index)}
              onHoverEnd={() => setHoveredService(null)}
            >
              <Card 
                className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 text-white border-none cursor-pointer overflow-hidden relative h-full"
                style={{ 
                  backgroundImage: `url(${feathersBg})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
                onClick={() => handleCardClick(index)}
              >
                <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors" />
                
                {/* NEW Badge */}
                {service.isNew && (
                  <div className="absolute top-3 right-3 z-20">
                    <Badge className="bg-secondary text-secondary-foreground animate-pulse">
                      <Sparkles className="w-3 h-3 mr-1" />
                      NOWOŚĆ
                    </Badge>
                  </div>
                )}
                
                <CardHeader className="relative z-10">
                  <div className="w-32 h-32 mx-auto mb-4 transition-transform duration-300 group-hover:scale-110">
                    <img 
                      src={service.image} 
                      alt={service.title}
                      className="w-full h-full object-contain drop-shadow-lg"
                    />
                  </div>
                  <CardTitle className="text-2xl text-center">{service.title}</CardTitle>
                </CardHeader>
                <CardContent className="relative z-10">
                  <CardDescription className="text-base text-center text-white/90">
                    {service.description}
                  </CardDescription>
                  
                  {/* Hover Expanded Content */}
                  <AnimatePresence>
                    {hoveredService === index && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-4 pt-4 border-t border-white/20 overflow-hidden"
                      >
                        <p className="text-sm text-white/80 mb-3">Kliknij, aby zobaczyć więcej</p>
                        <div className="flex items-center justify-center gap-2 text-primary">
                          <span className="text-sm font-medium">Szczegóły</span>
                          <ArrowRight className="w-4 h-4" />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Service Detail Modal */}
        <AnimatePresence>
          {selectedService !== null && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setSelectedService(null)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-card rounded-2xl max-w-lg w-full p-6 shadow-2xl relative"
                onClick={(e) => e.stopPropagation()}
              >
                <button 
                  onClick={() => setSelectedService(null)}
                  className="absolute top-4 right-4 p-2 hover:bg-muted rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
                
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center">
                    {(() => {
                      const IconComponent = services[selectedService].icon;
                      return <IconComponent className="w-8 h-8 text-primary" />;
                    })()}
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-foreground">{services[selectedService].title}</h3>
                    {services[selectedService].isNew && (
                      <Badge className="bg-secondary text-secondary-foreground mt-1">
                        <Sparkles className="w-3 h-3 mr-1" />
                        NOWOŚĆ
                      </Badge>
                    )}
                  </div>
                </div>
                
                <p className="text-muted-foreground mb-6">
                  {services[selectedService].longDescription}
                </p>
                
                <div className="mb-6">
                  <h4 className="font-semibold text-foreground mb-3">Przykłady użycia:</h4>
                  <ul className="space-y-2">
                    {services[selectedService].examples.map((example, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                        {example}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <Button 
                  className="w-full gap-2" 
                  size="lg"
                  onClick={() => handleGoToService(services[selectedService].tab)}
                >
                  Wypróbuj teraz
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

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
