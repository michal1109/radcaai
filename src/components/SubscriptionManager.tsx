import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { CreditCard, Crown, Loader2, RefreshCcw, Calendar, AlertCircle } from "lucide-react";

interface SubscriptionInfo {
  subscribed: boolean;
  product_id: string | null;
  subscription_end: string | null;
}

interface UsageInfo {
  messages_count: number;
  limit: number;
  tier: string;
}

const TIER_LIMITS: Record<string, number> = {
  free: 5,
  basic: 50,
  pro: 200,
  premium: -1, // unlimited
};

const TIER_NAMES: Record<string, string> = {
  free: "Darmowy",
  basic: "Basic",
  pro: "Pro",
  premium: "Premium",
};

const SubscriptionManager = () => {
  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null);
  const [usage, setUsage] = useState<UsageInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPortalLoading, setIsPortalLoading] = useState(false);
  const { toast } = useToast();

  const fetchSubscription = async () => {
    try {
      const { data, error } = await supabase.functions.invoke("check-subscription");
      
      if (error) throw error;
      
      setSubscription(data);
    } catch (error) {
      console.error("Error fetching subscription:", error);
    }
  };

  const fetchUsage = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get user's subscription tier
      const { data: subData } = await supabase
        .from("subscriptions")
        .select("tier")
        .eq("user_id", user.id)
        .eq("is_active", true)
        .single();

      const tier = subData?.tier || "free";
      const limit = TIER_LIMITS[tier] || 5;

      // Get today's usage
      const today = new Date().toISOString().split("T")[0];
      const { data: usageData } = await supabase
        .from("user_usage")
        .select("messages_count")
        .eq("user_id", user.id)
        .eq("usage_date", today)
        .single();

      setUsage({
        messages_count: usageData?.messages_count || 0,
        limit,
        tier,
      });
    } catch (error) {
      console.error("Error fetching usage:", error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await Promise.all([fetchSubscription(), fetchUsage()]);
      setIsLoading(false);
    };
    
    loadData();
    
    // Auto-refresh every minute
    const interval = setInterval(loadData, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleManageSubscription = async () => {
    setIsPortalLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke("customer-portal");
      
      if (error) throw error;
      
      if (data?.url) {
        window.open(data.url, "_blank");
      }
    } catch (error) {
      console.error("Error opening customer portal:", error);
      toast({
        title: "Błąd",
        description: "Nie udało się otworzyć panelu zarządzania. Spróbuj ponownie.",
        variant: "destructive",
      });
    } finally {
      setIsPortalLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsLoading(true);
    await Promise.all([fetchSubscription(), fetchUsage()]);
    setIsLoading(false);
    toast({
      title: "Odświeżono",
      description: "Status subskrypcji został zaktualizowany.",
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  const tierName = usage ? TIER_NAMES[usage.tier] : "Darmowy";
  const isUnlimited = usage?.limit === -1;
  const usagePercent = isUnlimited ? 0 : ((usage?.messages_count || 0) / (usage?.limit || 1)) * 100;
  const isNearLimit = usagePercent >= 80;

  return (
    <Card className="border-primary/20">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Crown className="w-5 h-5 text-primary" />
            <CardTitle className="text-lg">Twoja Subskrypcja</CardTitle>
          </div>
          <Button variant="ghost" size="icon" onClick={handleRefresh} disabled={isLoading}>
            <RefreshCcw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
        <CardDescription>Zarządzaj planem i sprawdź wykorzystanie</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Plan */}
        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
          <div>
            <p className="text-sm text-muted-foreground">Aktualny plan</p>
            <p className="font-semibold text-foreground">{tierName}</p>
          </div>
          <Badge variant={subscription?.subscribed ? "default" : "secondary"}>
            {subscription?.subscribed ? "Aktywna" : "Darmowa"}
          </Badge>
        </div>

        {/* Usage */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Wykorzystanie dzisiaj</span>
            <span className={`font-medium ${isNearLimit ? 'text-destructive' : 'text-foreground'}`}>
              {isUnlimited 
                ? `${usage?.messages_count || 0} wiadomości (bez limitu)`
                : `${usage?.messages_count || 0} / ${usage?.limit || 0}`
              }
            </span>
          </div>
          {!isUnlimited && (
            <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all ${isNearLimit ? 'bg-destructive' : 'bg-primary'}`}
                style={{ width: `${Math.min(usagePercent, 100)}%` }}
              />
            </div>
          )}
          {isNearLimit && !isUnlimited && (
            <div className="flex items-center gap-2 text-xs text-destructive">
              <AlertCircle className="w-3 h-3" />
              <span>Zbliżasz się do limitu dziennego</span>
            </div>
          )}
        </div>

        {/* Subscription End Date */}
        {subscription?.subscription_end && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="w-4 h-4" />
            <span>
              Odnowienie: {new Date(subscription.subscription_end).toLocaleDateString("pl-PL")}
            </span>
          </div>
        )}

        {/* Actions */}
        <div className="pt-2 space-y-2">
          {subscription?.subscribed ? (
            <Button 
              variant="outline" 
              className="w-full gap-2"
              onClick={handleManageSubscription}
              disabled={isPortalLoading}
            >
              {isPortalLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <CreditCard className="w-4 h-4" />
              )}
              Zarządzaj subskrypcją
            </Button>
          ) : (
            <Button 
              className="w-full gap-2"
              onClick={() => window.location.href = "/#pricing"}
            >
              <Crown className="w-4 h-4" />
              Ulepsz plan
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default SubscriptionManager;
