import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { MessageSquare, Mic, FileSearch, FileText, LogOut } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();
  const [subscription, setSubscription] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSubscription();
  }, []);

  const loadSubscription = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (!error && data) {
        setSubscription(data);
      }
    } catch (error) {
      console.error("Error loading subscription:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  const features = [
    {
      icon: MessageSquare,
      title: "Chat AI",
      description: "Rozmowa z asystentem prawnym AI",
      tab: "chat",
    },
    {
      icon: Mic,
      title: "Asystent głosowy",
      description: "Komunikacja głosowa z AI",
      tab: "voice",
    },
    {
      icon: FileSearch,
      title: "Analiza dokumentów",
      description: "Analiza i ocena dokumentów prawnych",
      tab: "analyze",
    },
    {
      icon: FileText,
      title: "Generator dokumentów",
      description: "Tworzenie dokumentów prawnych",
      tab: "generate",
    },
  ];

  const getTierName = (tier: string) => {
    const names: Record<string, string> = {
      free: "Darmowy",
      basic: "Basic",
      pro: "Pro",
      premium: "Premium",
    };
    return names[tier] || tier;
  };

  return (
    <div 
      className="min-h-screen"
      style={{
        backgroundImage: `url('/src/assets/feathers-bg.png')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }}
    >
      <Navigation />
      <main className="pt-32 pb-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12 backdrop-blur-sm bg-background/80 rounded-lg p-8">
            <h1 className="text-5xl font-bold text-foreground mb-4">
              Papuga Prawnik AI
            </h1>
            <p className="text-xl text-muted-foreground mb-2">
              Twój inteligentny asystent prawny dostępny 24/7
            </p>
            {!loading && subscription && (
              <div className="mt-4 inline-block">
                <span className="px-4 py-2 rounded-full bg-primary/10 text-primary font-semibold">
                  Plan: {getTierName(subscription.tier)}
                </span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            {features.map((feature) => (
              <Card
                key={feature.tab}
                className="p-8 hover:shadow-xl transition-all cursor-pointer backdrop-blur-sm bg-card/95 border-2 hover:border-primary"
                onClick={() => navigate(`/ai-assistant?tab=${feature.tab}`)}
              >
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                    <feature.icon className="w-10 h-10 text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold text-foreground">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground">
                    {feature.description}
                  </p>
                  <Button className="mt-4">
                    Rozpocznij
                  </Button>
                </div>
              </Card>
            ))}
          </div>

          {!loading && subscription && (
            <Card className="p-6 backdrop-blur-sm bg-card/95 border-2">
              <h3 className="text-xl font-bold mb-4 text-foreground">Informacje o subskrypcji</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <p className="text-muted-foreground text-sm">Plan</p>
                  <p className="font-bold text-lg text-primary">{getTierName(subscription.tier)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">Status</p>
                  <p className="font-bold text-lg text-foreground">
                    {subscription.is_active ? "Aktywny" : "Nieaktywny"}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">Data rozpoczęcia</p>
                  <p className="font-bold text-lg text-foreground">
                    {new Date(subscription.starts_at).toLocaleDateString("pl-PL")}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">Działania</p>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleLogout}
                    className="mt-1"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Wyloguj
                  </Button>
                </div>
              </div>
            </Card>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Index;
