import { useState, useEffect } from "react";
import { Check, Star, Zap, Crown, Loader2 } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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
    buttonText: "Zacznij za Darmo (5 pytań)",
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
  const { toast } = useToast();
  const [loading, setLoading] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [currentPriceId, setCurrentPriceId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
      if (session?.user) {
        checkSubscription();
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
      if (session?.user) {
        checkSubscription();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkSubscription = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('check-subscription');
      if (error) throw error;
      if (data?.price_id) {
        setCurrentPriceId(data.price_id);
      }
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error checking subscription:', error);
      }
    }
  };

  const handleSelectPlan = async (priceId: string | null, planName: string) => {
    if (!priceId) {
      navigate("/auth");
      return;
    }

    if (!user) {
      // Store selected plan and redirect to auth
      sessionStorage.setItem('selectedPriceId', priceId);
      navigate("/auth?redirect=/ai-assistant");
      return;
    }

    // User is logged in, create checkout session
    setLoading(priceId);
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { priceId }
      });

      if (error) throw error;

      if (data?.url) {
        window.open(data.url, '_blank');
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (error: any) {
      if (import.meta.env.DEV) {
        console.error('Checkout error:', error);
      }
      toast({
        title: "Błąd",
        description: error.message || "Nie udało się utworzyć sesji płatności",
        variant: "destructive",
      });
    } finally {
      setLoading(null);
    }
  };

  const getButtonText = (plan: typeof plans[0]) => {
    if (currentPriceId === plan.priceId) {
      return "Twój aktualny plan";
    }
    return plan.buttonText;
  };

  const isCurrentPlan = (priceId: string | null) => {
    return currentPriceId === priceId;
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
                  : isCurrentPlan(plan.priceId)
                  ? "border-2 border-green-500 shadow-lg"
                  : "border-border"
              }`}
            >
              {plan.popular && !isCurrentPlan(plan.priceId) && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground">
                    Najpopularniejszy
                  </Badge>
                </div>
              )}
              {isCurrentPlan(plan.priceId) && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-green-500 text-white">
                    Twój plan
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
                    isCurrentPlan(plan.priceId)
                      ? "bg-green-500 hover:bg-green-600"
                      : plan.popular 
                      ? "bg-primary hover:bg-primary/90" 
                      : "bg-muted text-foreground hover:bg-muted/80"
                  }`}
                  onClick={() => handleSelectPlan(plan.priceId, plan.name)}
                  disabled={loading === plan.priceId || isCurrentPlan(plan.priceId)}
                >
                  {loading === plan.priceId && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {getButtonText(plan)}
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
