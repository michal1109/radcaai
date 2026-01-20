import { useState, useEffect, useCallback } from "react";
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
  const [googleLoading, setGoogleLoading] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();

  const handleCheckoutAfterLogin = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    let redirected = false;

    const redirectIfAuthenticated = () => {
      if (redirected) return;
      redirected = true;

      const redirect = searchParams.get('redirect') || '/ai-assistant';

      // Defer async work away from the auth callback (avoids deadlocks)
      setTimeout(() => {
        void handleCheckoutAfterLogin();
        navigate(redirect);
      }, 0);
    };

    // Listen FIRST, then check session (prevents missing the OAuth callback session)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) redirectIfAuthenticated();
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) redirectIfAuthenticated();
    });

    return () => subscription.unsubscribe();
  }, [navigate, searchParams, handleCheckoutAfterLogin]);

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

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth?redirect=/ai-assistant`,
          // In embedded previews (iframe), Google can block the auth page.
          // We fetch the URL and open it in a new tab instead.
          skipBrowserRedirect: true,
        },
      });
      if (error) throw error;

      const url = data?.url;
      if (!url) throw new Error("Nie udało się rozpocząć logowania Google.");

      const opened = window.open(url, "_blank", "noopener,noreferrer");
      if (!opened) {
        window.location.assign(url);
        return;
      }

      toast({
        title: "Otwieram logowanie Google",
        description: "Sprawdź nową kartę przeglądarki.",
      });
    } catch (error: any) {
      toast({
        title: "Błąd logowania Google",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setGoogleLoading(false);
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
        <CardContent className="space-y-6">
          {/* Google Login Button */}
          <Button 
            type="button"
            variant="outline" 
            className="w-full gap-3 py-6 text-base"
            onClick={handleGoogleLogin}
            disabled={googleLoading}
          >
            {googleLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            )}
            Kontynuuj przez Google
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">lub</span>
            </div>
          </div>

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
          <div className="text-center text-sm">
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
