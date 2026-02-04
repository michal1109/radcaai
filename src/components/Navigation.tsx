import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, Bot, Loader2, LogOut, User } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import papugaLogo from "@/assets/papuga-logo-lawyer.png";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [loggingOut, setLoggingOut] = useState(false);
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

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await supabase.auth.signOut();
      toast({
        title: "Wylogowano",
        description: "Do zobaczenia!",
      });
      navigate("/");
    } catch (error: any) {
      toast({
        title: "Błąd wylogowania",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoggingOut(false);
    }
  };

  const getUserInitials = () => {
    const name = user?.user_metadata?.full_name || user?.email || "";
    if (!name) return "U";
    const parts = name.split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const getUserDisplayName = () => {
    return user?.user_metadata?.full_name || user?.email || "Użytkownik";
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
        title: "Błąd logowania",
        description: error.message,
        variant: "destructive",
      });
    } finally {
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
              alt="RadcaAI Logo" 
              className="h-24 w-auto transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 group-hover:drop-shadow-[0_0_20px_hsl(var(--primary)/0.6)]"
            />
            <div className="hidden sm:block">
              <p className="font-bold text-lg text-foreground leading-tight">RadcaAI</p>
              <p className="text-xs text-muted-foreground">Wsparcie informacyjne</p>
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
              <>
                <Link to="/ai-assistant">
                  <Button variant="outline" className="gap-2">
                    <Bot className="w-4 h-4" />
                    RadcaAI
                  </Button>
                </Link>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="gap-2 px-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user?.user_metadata?.avatar_url} />
                        <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                          {getUserInitials()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="hidden lg:inline text-sm font-medium max-w-[150px] truncate">
                        {getUserDisplayName()}
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium">{user?.user_metadata?.full_name || "Użytkownik"}</p>
                        <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to="/ai-assistant" className="cursor-pointer">
                        <Bot className="mr-2 h-4 w-4" />
                        RadcaAI
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={handleLogout} 
                      disabled={loggingOut}
                      className="text-destructive focus:text-destructive cursor-pointer"
                    >
                      {loggingOut ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <LogOut className="mr-2 h-4 w-4" />
                      )}
                      Wyloguj się
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
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
                <Button size="lg" className="bg-primary hover:bg-primary/90">
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
              <div className="space-y-3">
                <div className="flex items-center gap-3 px-2 py-3 bg-muted/50 rounded-lg">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user?.user_metadata?.avatar_url} />
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {getUserInitials()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{user?.user_metadata?.full_name || "Użytkownik"}</p>
                    <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                  </div>
                </div>
                <Link to="/ai-assistant" onClick={() => setIsOpen(false)}>
                  <Button variant="outline" className="w-full gap-2">
                    <Bot className="w-4 h-4" />
                    RadcaAI
                  </Button>
                </Link>
                <Button 
                  variant="outline" 
                  className="w-full gap-2 text-destructive hover:text-destructive"
                  onClick={() => { handleLogout(); setIsOpen(false); }}
                  disabled={loggingOut}
                >
                  {loggingOut ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <LogOut className="w-4 h-4" />
                  )}
                  Wyloguj się
                </Button>
              </div>
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
                <Button size="lg" className="w-full bg-primary hover:bg-primary/90 mt-2">
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
