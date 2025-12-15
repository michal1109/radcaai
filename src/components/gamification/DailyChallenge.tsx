import { useState, useEffect } from "react";
import { Target, CheckCircle, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Progress } from "../ui/progress";
import { Badge } from "../ui/badge";
import { supabase } from "@/integrations/supabase/client";

interface Challenge {
  id: string;
  title: string;
  description: string;
  target: number;
  current: number;
  points: number;
  type: "messages" | "documents" | "login";
}

const DailyChallenge = () => {
  const [challenges, setChallenges] = useState<Challenge[]>([
    {
      id: "daily_messages",
      title: "Dzienny rozmówca",
      description: "Wyślij 3 wiadomości",
      target: 3,
      current: 0,
      points: 30,
      type: "messages"
    },
    {
      id: "daily_document",
      title: "Dokumentalista dnia",
      description: "Wygeneruj 1 dokument",
      target: 1,
      current: 0,
      points: 50,
      type: "documents"
    }
  ]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDailyProgress();
  }, []);

  const loadDailyProgress = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Get user's conversations first
      const { data: conversations } = await supabase
        .from("conversations")
        .select("id")
        .eq("user_id", user.id);

      const conversationIds = conversations?.map(c => c.id) || [];
      
      let messagesCount = 0;
      if (conversationIds.length > 0) {
        // Count today's messages
        const { data: messages } = await supabase
          .from("messages")
          .select("id")
          .in("conversation_id", conversationIds)
          .eq("role", "user")
          .gte("created_at", today.toISOString());
        messagesCount = messages?.length || 0;
      }

      // Count today's documents
      const { data: documents } = await supabase
        .from("documents")
        .select("id")
        .eq("user_id", user.id)
        .gte("created_at", today.toISOString());
      const documentsCount = documents?.length || 0;

      setChallenges(prev => prev.map(challenge => {
        if (challenge.type === "messages") {
          return { ...challenge, current: messagesCount };
        }
        if (challenge.type === "documents") {
          return { ...challenge, current: documentsCount };
        }
        return challenge;
      }));

    } catch (error) {
      console.error("Error loading daily progress:", error);
    } finally {
      setLoading(false);
    }
  };

  const getTimeUntilReset = () => {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    const diff = tomorrow.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}h ${minutes}m`;
  };

  if (loading) {
    return <div className="animate-pulse bg-muted h-32 rounded-lg" />;
  }

  const completedCount = challenges.filter(c => c.current >= c.target).length;
  const totalPoints = challenges
    .filter(c => c.current >= c.target)
    .reduce((sum, c) => sum + c.points, 0);

  return (
    <Card className="border-secondary/30 bg-gradient-to-br from-secondary/5 to-transparent">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Target className="w-5 h-5 text-secondary" />
            Dzienne wyzwania
          </span>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="w-4 h-4" />
            {getTimeUntilReset()}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {challenges.map((challenge) => {
          const isCompleted = challenge.current >= challenge.target;
          const progress = Math.min((challenge.current / challenge.target) * 100, 100);
          
          return (
            <div 
              key={challenge.id}
              className={`p-3 rounded-lg border ${
                isCompleted 
                  ? "bg-primary/10 border-primary/30" 
                  : "bg-background border-border"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {isCompleted ? (
                    <CheckCircle className="w-5 h-5 text-primary" />
                  ) : (
                    <div className="w-5 h-5 rounded-full border-2 border-muted-foreground" />
                  )}
                  <span className={`font-medium ${isCompleted ? "line-through text-muted-foreground" : ""}`}>
                    {challenge.title}
                  </span>
                </div>
                <Badge variant={isCompleted ? "default" : "outline"} className="text-xs">
                  +{challenge.points} pkt
                </Badge>
              </div>
              <div className="ml-7">
                <p className="text-sm text-muted-foreground mb-2">{challenge.description}</p>
                <div className="flex items-center gap-2">
                  <Progress value={progress} className="h-1.5 flex-1" />
                  <span className="text-xs text-muted-foreground">
                    {challenge.current}/{challenge.target}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
        
        {completedCount > 0 && (
          <div className="text-center pt-2 border-t border-border">
            <span className="text-sm text-muted-foreground">
              Zdobyte dzisiaj: <strong className="text-primary">{totalPoints} pkt</strong>
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DailyChallenge;
