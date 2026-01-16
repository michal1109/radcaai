import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, Bot, Loader2 } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import papugaLogo from "@/assets/papuga-logo-new.png";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isHomePage = location.pathname === "/";

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/ai-assistant`,
        },
      });
      if (error) throw error;
    } catch (error: any) {
      toast({
        title: "Błąd logowania",
        description: error.message,
        variant: "destructive",
      });
      setGoogleLoading(false);
    }
  };

  const navLinks = [
    { href: "#services", label: "Funkcje" },
    { href: "#how-it-works", label: "Jak to działa" },
    { href: "#pricing", label: "Cennik" },
    { href: "#faq", label: "FAQ" },
    { href: "/blog", label: "Blog", isRoute: true },
    { href: "#contact", label: "Kontakt" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <img 
              src={papugaLogo} 
              alt="Papuga Logo" 
              className="h-24 w-auto transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 group-hover:drop-shadow-[0_0_20px_hsl(var(--primary)/0.6)]"
            />
            <div className="hidden sm:block">
              <p className="font-bold text-lg text-foreground leading-tight">Papuga</p>
              <p className="text-xs text-muted-foreground">Radca Prawny</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-4">
            {isHomePage && navLinks.map((link) => (
              link.isRoute ? (
                <Link
                  key={link.href}
                  to={link.href}
                  className="text-foreground hover:text-primary transition-colors font-medium"
                >
                  {link.label}
                </Link>
              ) : (
                <a
                  key={link.href}
                  href={link.href}
                  className="text-foreground hover:text-primary transition-colors font-medium"
                >
                  {link.label}
                </a>
              )
            ))}
            <ThemeToggle />
            {user ? (
              <Link to="/ai-assistant">
                <Button variant="outline" className="gap-2">
                  <Bot className="w-4 h-4" />
                  Asystent AI
                </Button>
              </Link>
            ) : (
              <>
                <Button 
                  variant="outline" 
                  className="gap-2"
                  onClick={handleGoogleLogin}
                  disabled={googleLoading}
                >
                  {googleLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                  )}
                  Zaloguj przez Google
                </Button>
                <Link to="/auth">
                  <Button variant="outline" className="gap-2">
                    <Bot className="w-4 h-4" />
                    Email
                  </Button>
                </Link>
              </>
            )}
            {isHomePage && !user && (
              <Link to="/auth">
                <Button size="lg" className="bg-[hsl(25,95%,53%)] hover:bg-[hsl(25,95%,48%)]">
                  Zacznij za Darmo
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 md:hidden">
            <ThemeToggle />
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 text-foreground hover:text-primary transition-colors"
            >
              {isOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden py-6 space-y-4 border-t border-border">
            {isHomePage && navLinks.map((link) => (
              link.isRoute ? (
                <Link
                  key={link.href}
                  to={link.href}
                  onClick={() => setIsOpen(false)}
                  className="block text-foreground hover:text-primary transition-colors font-medium py-2"
                >
                  {link.label}
                </Link>
              ) : (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className="block text-foreground hover:text-primary transition-colors font-medium py-2"
                >
                  {link.label}
                </a>
              )
            ))}
            {user ? (
              <Link to="/ai-assistant" onClick={() => setIsOpen(false)}>
                <Button variant="outline" className="w-full gap-2">
                  <Bot className="w-4 h-4" />
                  Asystent AI
                </Button>
              </Link>
            ) : (
              <>
                <Button 
                  variant="outline" 
                  className="w-full gap-2"
                  onClick={() => { handleGoogleLogin(); setIsOpen(false); }}
                  disabled={googleLoading}
                >
                  {googleLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                  )}
                  Zaloguj przez Google
                </Button>
                <Link to="/auth" onClick={() => setIsOpen(false)}>
                  <Button variant="outline" className="w-full gap-2 mt-2">
                    <Bot className="w-4 h-4" />
                    Zaloguj przez Email
                  </Button>
                </Link>
              </>
            )}
            {isHomePage && !user && (
              <Link to="/auth" onClick={() => setIsOpen(false)}>
                <Button size="lg" className="w-full bg-[hsl(25,95%,53%)] hover:bg-[hsl(25,95%,48%)] mt-2">
                  Zacznij za Darmo
                </Button>
              </Link>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
