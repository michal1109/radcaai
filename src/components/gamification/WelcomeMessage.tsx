import { useState, useEffect } from "react";
import { Sparkles, Sun, Moon, Coffee, Sunset } from "lucide-react";
import { Card, CardContent } from "../ui/card";
import { supabase } from "@/integrations/supabase/client";

const getTimeOfDay = () => {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return "morning";
  if (hour >= 12 && hour < 17) return "afternoon";
  if (hour >= 17 && hour < 21) return "evening";
  return "night";
};

const getGreeting = (timeOfDay: string, name?: string) => {
  const greetings = {
    morning: [
      "Dzień dobry! ☀️ Gotowy na nowe wyzwania prawne?",
      "Miłego poranka! ☕ Jak mogę Ci dziś pomóc?",
      "Witaj! 🌅 Rozpocznijmy dzień produktywnie!"
    ],
    afternoon: [
      "Cześć! 🌤️ Mam nadzieję, że dzień mija pomyślnie!",
      "Witaj z powrotem! 💪 Jestem gotowy do pomocy!",
      "Hej! 🙌 W czym mogę Ci dzisiaj pomóc?"
    ],
    evening: [
      "Dobry wieczór! 🌆 Jeszcze zdążymy rozwiązać Twoje sprawy!",
      "Witaj! 🌙 Wieczorna sesja prawna? Jestem do usług!",
      "Cześć! ✨ Wieczór to świetny czas na planowanie!"
    ],
    night: [
      "Nocna sowa? 🦉 Jestem tu dla Ciebie!",
      "Pracujesz po godzinach? 💫 Pomogę Ci szybko!",
      "Witaj nocnego marku! 🌟 Rozwiążmy to razem!"
    ]
  };

  const timeGreetings = greetings[timeOfDay as keyof typeof greetings] || greetings.afternoon;
  const randomGreeting = timeGreetings[Math.floor(Math.random() * timeGreetings.length)];
  
  if (name) {
    return randomGreeting.replace("!", `, ${name}!`);
  }
  return randomGreeting;
};

const getMotivationalTip = () => {
  const tips = [
    "💡 Tip: Możesz przesłać zdjęcie dokumentu do analizy!",
    "💡 Tip: Im więcej szczegółów podasz, tym lepsza będzie porada!",
    "💡 Tip: Zapisuj ważne rozmowy - możesz do nich wrócić!",
    "💡 Tip: Sprawdź dzienne wyzwania i zdobądź punkty!",
    "💡 Tip: Generowanie dokumentów oszczędza czas i pieniądze!",
    "💡 Tip: Twoja seria dni rośnie z każdym logowaniem!"
  ];
  return tips[Math.floor(Math.random() * tips.length)];
};

const TimeIcon = ({ timeOfDay }: { timeOfDay: string }) => {
  switch (timeOfDay) {
    case "morning": return <Coffee className="w-5 h-5 text-secondary" />;
    case "afternoon": return <Sun className="w-5 h-5 text-secondary" />;
    case "evening": return <Sunset className="w-5 h-5 text-secondary" />;
    case "night": return <Moon className="w-5 h-5 text-secondary" />;
    default: return <Sparkles className="w-5 h-5 text-secondary" />;
  }
};

const WelcomeMessage = () => {
  const [userName, setUserName] = useState<string | undefined>();
  const [greeting, setGreeting] = useState("");
  const [tip, setTip] = useState("");
  const timeOfDay = getTimeOfDay();

  useEffect(() => {
    loadUserName();
    setGreeting(getGreeting(timeOfDay));
    setTip(getMotivationalTip());
  }, [timeOfDay]);

  const loadUserName = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("id", user.id)
          .single();
        
        if (profile?.full_name) {
          const firstName = profile.full_name.split(" ")[0];
          setUserName(firstName);
          setGreeting(getGreeting(timeOfDay, firstName));
        }
      }
    } catch (error) {
      console.error("Error loading user name:", error);
    }
  };

  return (
    <Card className="bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/10 border-none mb-4">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
            <TimeIcon timeOfDay={timeOfDay} />
          </div>
          <div className="space-y-1">
            <p className="font-medium text-foreground">{greeting}</p>
            <p className="text-sm text-muted-foreground">{tip}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WelcomeMessage;
