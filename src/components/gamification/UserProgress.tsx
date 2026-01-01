import { useEffect, useState } from "react";
import { Flame, Trophy, Star, Target, Gift } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Progress } from "../ui/progress";
import { Badge } from "../ui/badge";
import { supabase } from "@/integrations/supabase/client";

interface UserStats {
  streak_days: number;
  total_messages: number;
  total_documents: number;
  points: number;
  level: number;
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
}

const ACHIEVEMENTS: Achievement[] = [
  { id: "first_message", name: "Pierwszy krok", description: "Wyślij pierwszą wiadomość", icon: "message", unlocked: false },
  { id: "streak_3", name: "Systematyczność", description: "3 dni z rzędu", icon: "flame", unlocked: false },
  { id: "streak_7", name: "Tygodniowy wojownik", description: "7 dni z rzędu", icon: "flame", unlocked: false },
  { id: "messages_10", name: "Rozmówca", description: "Wyślij 10 wiadomości", icon: "message", unlocked: false },
  { id: "messages_50", name: "Ekspert", description: "Wyślij 50 wiadomości", icon: "star", unlocked: false },
  { id: "document_1", name: "Dokumentalista", description: "Wygeneruj pierwszy dokument", icon: "file", unlocked: false },
];

const getLevelInfo = (points: number) => {
  const levels = [
    { level: 1, name: "Początkujący", minPoints: 0, maxPoints: 100 },
    { level: 2, name: "Uczeń", minPoints: 100, maxPoints: 300 },
    { level: 3, name: "Praktykant", minPoints: 300, maxPoints: 600 },
    { level: 4, name: "Znawca", minPoints: 600, maxPoints: 1000 },
    { level: 5, name: "Ekspert", minPoints: 1000, maxPoints: 2000 },
    { level: 6, name: "Mistrz", minPoints: 2000, maxPoints: Infinity },
  ];
  
  const currentLevel = levels.find(l => points >= l.minPoints && points < l.maxPoints) || levels[0];
  const nextLevel = levels.find(l => l.level === currentLevel.level + 1);
  const progressToNext = nextLevel 
    ? ((points - currentLevel.minPoints) / (nextLevel.minPoints - currentLevel.minPoints)) * 100
    : 100;
  
  return { ...currentLevel, progressToNext, nextLevelPoints: nextLevel?.minPoints || currentLevel.maxPoints };
};

const UserProgress = () => {
  const [stats, setStats] = useState<UserStats>({
    streak_days: 0,
    total_messages: 0,
    total_documents: 0,
    points: 0,
    level: 1
  });
  const [achievements, setAchievements] = useState<Achievement[]>(ACHIEVEMENTS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserStats();
  }, []);

  const loadUserStats = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      // Get user's conversations first
      const { data: conversations } = await supabase
        .from("conversations")
        .select("id")
        .eq("user_id", user.id);

      const conversationIds = conversations?.map(c => c.id) || [];
      
      let messagesCount = 0;
      if (conversationIds.length > 0) {
        // Get messages for these conversations
        const { data: messages } = await supabase
          .from("messages")
          .select("id, created_at")
          .in("conversation_id", conversationIds)
          .eq("role", "user");
        messagesCount = messages?.length || 0;
        
        // Calculate streak
        let streakDays = 0;
        if (messages && messages.length > 0) {
          const today = new Date();
          const messagesByDay = new Map<string, boolean>();
          
          messages.forEach(msg => {
            const date = new Date(msg.created_at).toDateString();
            messagesByDay.set(date, true);
          });

          for (let i = 0; i < 30; i++) {
            const checkDate = new Date(today);
            checkDate.setDate(today.getDate() - i);
            if (messagesByDay.has(checkDate.toDateString())) {
              streakDays++;
            } else if (i > 0) {
              break;
            }
          }
        }
        
        // Update stats with streak
        setStats(prev => ({ ...prev, streak_days: streakDays }));
      }

      // Load documents count
      const { data: documents } = await supabase
        .from("documents")
        .select("id")
        .eq("user_id", user.id);
      const documentsCount = documents?.length || 0;

      // Calculate points (10 points per message, 50 per document)
      const calculatedPoints = messagesCount * 10 + documentsCount * 50;

      const newStats = {
        streak_days: stats.streak_days,
        total_messages: messagesCount,
        total_documents: documentsCount,
        points: calculatedPoints,
        level: getLevelInfo(calculatedPoints).level
      };

      setStats(newStats);

      // Update achievements
      const updatedAchievements = ACHIEVEMENTS.map(a => ({
        ...a,
        unlocked: checkAchievement(a.id, newStats)
      }));
      setAchievements(updatedAchievements);

    } catch (error) {
      if (import.meta.env.DEV) {
        console.error("Error loading user stats:", error);
      }
    } finally {
      setLoading(false);
    }
  };

  const checkAchievement = (id: string, userStats: UserStats): boolean => {
    switch (id) {
      case "first_message": return userStats.total_messages >= 1;
      case "streak_3": return userStats.streak_days >= 3;
      case "streak_7": return userStats.streak_days >= 7;
      case "messages_10": return userStats.total_messages >= 10;
      case "messages_50": return userStats.total_messages >= 50;
      case "document_1": return userStats.total_documents >= 1;
      default: return false;
    }
  };

  if (loading) {
    return <div className="animate-pulse bg-muted h-48 rounded-lg" />;
  }

  const levelInfo = getLevelInfo(stats.points);
  const unlockedCount = achievements.filter(a => a.unlocked).length;

  return (
    <div className="space-y-4">
      {/* Level & Points Card */}
      <Card className="bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <Trophy className="w-5 h-5 text-secondary" />
            Poziom {levelInfo.level}: {levelInfo.name}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{stats.points} punktów</span>
              <span className="text-muted-foreground">{levelInfo.nextLevelPoints} do następnego</span>
            </div>
            <Progress value={levelInfo.progressToNext} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="text-center p-3">
          <Flame className={`w-6 h-6 mx-auto mb-1 ${stats.streak_days > 0 ? "text-orange-500" : "text-muted-foreground"}`} />
          <div className="text-2xl font-bold">{stats.streak_days}</div>
          <div className="text-xs text-muted-foreground">Dni z rzędu</div>
        </Card>
        <Card className="text-center p-3">
          <Star className="w-6 h-6 mx-auto mb-1 text-secondary" />
          <div className="text-2xl font-bold">{stats.total_messages}</div>
          <div className="text-xs text-muted-foreground">Wiadomości</div>
        </Card>
        <Card className="text-center p-3">
          <Target className="w-6 h-6 mx-auto mb-1 text-primary" />
          <div className="text-2xl font-bold">{stats.total_documents}</div>
          <div className="text-xs text-muted-foreground">Dokumenty</div>
        </Card>
      </div>

      {/* Achievements */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Gift className="w-5 h-5 text-primary" />
              Osiągnięcia
            </span>
            <Badge variant="outline">{unlockedCount}/{achievements.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-2">
            {achievements.map((achievement) => (
              <div 
                key={achievement.id}
                className={`p-2 rounded-lg text-center transition-all ${
                  achievement.unlocked 
                    ? "bg-primary/10 border border-primary/30" 
                    : "bg-muted/50 opacity-50"
                }`}
                title={achievement.description}
              >
                <div className={`text-2xl mb-1 ${achievement.unlocked ? "" : "grayscale"}`}>
                  {achievement.icon === "flame" && "🔥"}
                  {achievement.icon === "message" && "💬"}
                  {achievement.icon === "star" && "⭐"}
                  {achievement.icon === "file" && "📄"}
                </div>
                <div className="text-xs font-medium truncate">{achievement.name}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserProgress;
