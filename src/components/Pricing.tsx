import { Check, Star, Zap, Crown } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { useNavigate } from "react-router-dom";

const plans = [
  {
    name: "Darmowy",
    price: "0",
    description: "Na start - poznaj możliwości Papugi",
    features: [
      "5 wiadomości dziennie",
      "Podstawowe porady prawne",
      "Dostęp do czatu AI",
      "Analiza prostych dokumentów"
    ],
    icon: Star,
    popular: false,
    buttonText: "Rozpocznij za darmo",
    priceId: null
  },
  {
    name: "Basic",
    price: "29",
    description: "Dla osób z regularnymi pytaniami",
    features: [
      "50 wiadomości dziennie",
      "Rozszerzone porady prawne",
      "Generowanie dokumentów",
      "Analiza dokumentów PDF i zdjęć",
      "Historia rozmów"
    ],
    icon: Zap,
    popular: false,
    buttonText: "Wybierz Basic",
    priceId: "price_1RXGwJG8RWnc6xpP4oojhC6j"
  },
  {
    name: "Pro",
    price: "59",
    description: "Najpopularniejszy wybór",
    features: [
      "200 wiadomości dziennie",
      "Pełne porady prawne",
      "Wszystkie typy dokumentów",
      "Priorytetowa analiza",
      "Wzory pism prawnych",
      "Wsparcie email"
    ],
    icon: Crown,
    popular: true,
    buttonText: "Wybierz Pro",
    priceId: "price_1RXGx4G8RWnc6xpPgLSuiJ55"
  },
  {
    name: "Premium",
    price: "99",
    description: "Bez limitów - pełna moc AI",
    features: [
      "Nielimitowane wiadomości",
      "Wszystkie funkcje Pro",
      "Dedykowany konsultant AI",
      "Analiza złożonych spraw",
      "Priorytetowe wsparcie",
      "Dostęp do nowych funkcji"
    ],
    icon: Crown,
    popular: false,
    buttonText: "Wybierz Premium",
    priceId: "price_1RXGxeG8RWnc6xpPkUVdFrVG"
  }
];

const Pricing = () => {
  const navigate = useNavigate();

  const handleSelectPlan = (priceId: string | null) => {
    if (priceId) {
      navigate("/auth?redirect=/ai-assistant");
    } else {
      navigate("/auth");
    }
  };

  return (
    <section id="pricing" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <Badge variant="outline" className="mb-4 text-primary border-primary">
            Cennik
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Wybierz plan dla siebie
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Przejrzyste ceny, bez ukrytych opłat. Możesz zmienić plan w dowolnym momencie.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {plans.map((plan, index) => (
            <Card 
              key={index}
              className={`relative transition-all duration-300 hover:shadow-xl hover:-translate-y-2 ${
                plan.popular 
                  ? "border-2 border-primary shadow-lg scale-105" 
                  : "border-border"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground">
                    Najpopularniejszy
                  </Badge>
                </div>
              )}
              <CardHeader className="text-center pb-2">
                <div className={`w-12 h-12 mx-auto mb-4 rounded-full flex items-center justify-center ${
                  plan.popular ? "bg-primary text-primary-foreground" : "bg-muted text-primary"
                }`}>
                  <plan.icon className="w-6 h-6" />
                </div>
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <div className="mb-6">
                  <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                  <span className="text-muted-foreground"> PLN/mies.</span>
                </div>
                <ul className="space-y-3 mb-6 text-left">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      <span className="text-sm text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button 
                  className={`w-full ${
                    plan.popular 
                      ? "bg-primary hover:bg-primary/90" 
                      : "bg-muted text-foreground hover:bg-muted/80"
                  }`}
                  onClick={() => handleSelectPlan(plan.priceId)}
                >
                  {plan.buttonText}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <p className="text-center text-sm text-muted-foreground mt-8">
          Wszystkie ceny są w PLN i zawierają VAT. Możesz anulować subskrypcję w dowolnym momencie.
        </p>
      </div>
    </section>
  );
};

export default Pricing;
