import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import papugaLogo from "@/assets/papuga-logo-new.png";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();

  const handleCheckoutAfterLogin = async () => {
    const selectedPriceId = sessionStorage.getItem('selectedPriceId');
    if (selectedPriceId) {
      sessionStorage.removeItem('selectedPriceId');
      try {
        const { data, error } = await supabase.functions.invoke('create-checkout', {
          body: { priceId: selectedPriceId }
        });
        if (error) throw error;
        if (data?.url) {
          window.open(data.url, '_blank');
        }
      } catch (error) {
        if (import.meta.env.DEV) {
          console.error('Checkout error:', error);
        }
      }
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        handleCheckoutAfterLogin();
        const redirect = searchParams.get('redirect') || '/ai-assistant';
        navigate(redirect);
      }
    });
  }, [navigate, searchParams]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        toast({
          title: "Zalogowano pomyślnie",
          description: "Witaj ponownie!",
        });
        await handleCheckoutAfterLogin();
        const redirect = searchParams.get('redirect') || '/ai-assistant';
        navigate(redirect);
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/ai-assistant`,
            data: {
              full_name: fullName,
            },
          },
        });
        if (error) throw error;
        toast({
          title: "Rejestracja pomyślna",
          description: "Możesz się teraz zalogować.",
        });
        setIsLogin(true);
      }
    } catch (error: any) {
      toast({
        title: "Błąd",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <img src={papugaLogo} alt="Papuga Logo" className="h-20 w-auto mx-auto mb-4" />
          <CardTitle className="text-2xl">
            {isLogin ? "Zaloguj się" : "Zarejestruj się"}
          </CardTitle>
          <CardDescription>
            {isLogin
              ? "Witaj ponownie w Papuga AI"
              : "Utwórz konto i rozpocznij konsultacje prawne"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAuth} className="space-y-4">
            {!isLogin && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Imię i nazwisko</label>
                <Input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Jan Kowalski"
                  required={!isLogin}
                />
              </div>
            )}
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="twoj@email.com"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Hasło</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isLogin ? "Zaloguj się" : "Zarejestruj się"}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-primary hover:underline"
            >
              {isLogin
                ? "Nie masz konta? Zarejestruj się"
                : "Masz już konto? Zaloguj się"}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
