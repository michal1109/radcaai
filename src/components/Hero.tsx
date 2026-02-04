import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import feathersBg from "@/assets/feathers-bg-new.png";
import papugaLogo from "@/assets/papuga-logo-lawyer.png";
import { AnimatedCounter } from "@/components/ui/animated-counter";
import { Users, Star, Clock, CheckCircle, Loader2, Scale, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const stats = [
  { icon: Users, value: 12500, suffix: "+", label: "Użytkowników" },
  { icon: Star, value: 98, suffix: "%", label: "Zadowolonych" },
  { icon: Clock, value: 24, suffix: "/7", label: "Dostępność" },
  { icon: CheckCircle, value: 50000, suffix: "+", label: "Zapytań" },
];

const Hero = () => {
  const ref = useRef<HTMLElement>(null);
  const [googleLoading, setGoogleLoading] = useState(false);
  const { toast } = useToast();
  
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"]
  });
  
  const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const textY = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth?redirect=/ai-assistant`,
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
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Nieznany błąd";
      toast({
        title: "Błąd logowania",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <section 
      ref={ref}
      id="home" 
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Parallax Background - Navy Blue Theme */}
      <motion.div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `url(${feathersBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          y: backgroundY
        }}
      />
      
      <div className="absolute inset-0 bg-gradient-to-b from-[hsl(220,40%,15%)]/80 via-[hsl(220,40%,20%)]/70 to-[hsl(220,40%,15%)]/80 z-[1]" />
      
      <motion.div 
        className="container mx-auto px-4 relative z-10"
        style={{ y: textY, opacity }}
      >
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
          <motion.div 
            className="flex-1 text-center lg:text-left space-y-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="flex items-center gap-2 justify-center lg:justify-start">
              <Scale className="w-6 h-6 text-primary" />
              <span className="text-white/80 text-sm font-medium uppercase tracking-wider">
                System wsparcia informacyjnego
              </span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight">
              RadcaAI <br />
              <span className="text-primary">Informacje prawne</span><br />
              dostępne 24/7
            </h1>
            
            <p className="text-xl md:text-2xl text-white/90 max-w-2xl">
              Uzyskaj ogólne informacje o polskim prawie, analizuj dokumenty i generuj 
              robocze wersje pism z pomocą sztucznej inteligencji
            </p>
            
            {/* Legal Notice */}
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-4 max-w-2xl">
              <p className="text-sm text-white/80">
                <strong className="text-white">⚠️ Informacja:</strong> RadcaAI dostarcza wyłącznie ogólnych 
                informacji prawnych i nie stanowi porady prawnej. Odpowiedzi generowane przez AI mogą zawierać błędy.
              </p>
            </div>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link to="/auth">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button 
                    size="lg" 
                    className="text-lg px-8 py-6 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all relative overflow-hidden group"
                  >
                    <span className="relative z-10">Zacznij za Darmo (5 pytań)</span>
                    <motion.div 
                      className="absolute inset-0 bg-white/20"
                      initial={{ x: "-100%" }}
                      whileHover={{ x: "100%" }}
                      transition={{ duration: 0.5 }}
                    />
                  </Button>
                </motion.div>
              </Link>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button 
                  size="lg" 
                  variant="outline"
                  onClick={handleGoogleLogin}
                  disabled={googleLoading}
                  className="text-lg px-8 py-6 bg-white hover:bg-white/90 text-foreground shadow-lg hover:shadow-xl transition-all gap-3 border-0"
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
                  Zaloguj przez Google
                </Button>
              </motion.div>
              <a href="#demo">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button 
                    size="lg" 
                    variant="outline"
                    className="text-lg px-8 py-6 border-2 border-white/50 text-white hover:bg-white/10 shadow-lg transition-all"
                  >
                    Wypróbuj Demo
                  </Button>
                </motion.div>
              </a>
            </div>

            {/* Find a Lawyer Links */}
            <div className="flex flex-wrap gap-3 justify-center lg:justify-start pt-2">
              <a 
                href="https://www.adwokatura.pl/znajdz-adwokata/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-white/70 hover:text-primary transition-colors text-sm"
              >
                <ExternalLink className="w-4 h-4" />
                Znajdź adwokata (NRA)
              </a>
              <a 
                href="https://rejestr.kirp.pl/home" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-white/70 hover:text-primary transition-colors text-sm"
              >
                <ExternalLink className="w-4 h-4" />
                Znajdź radcę prawnego (KIRP)
              </a>
            </div>

            {/* Stats Section */}
            <motion.div 
              className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center border border-white/20"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
                  whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.15)" }}
                >
                  <stat.icon className="w-6 h-6 text-primary mx-auto mb-2" />
                  <div className="text-2xl md:text-3xl font-bold text-white">
                    <AnimatedCounter 
                      end={stat.value} 
                      suffix={stat.suffix}
                      duration={2}
                    />
                  </div>
                  <div className="text-sm text-white/70">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
          
          {/* Animated Logo */}
          <motion.div 
            className="flex-1 flex justify-center lg:justify-end"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <motion.img 
              src={papugaLogo} 
              alt="RadcaAI - System wsparcia informacyjnego" 
              className="w-full max-w-md lg:max-w-lg drop-shadow-2xl"
              animate={{ 
                y: [0, -15, 0],
              }}
              transition={{ 
                duration: 4, 
                repeat: Infinity, 
                ease: "easeInOut" 
              }}
            />
          </motion.div>
        </div>
      </motion.div>
      
      {/* Scroll Indicator */}
      <motion.div 
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
      >
        <motion.div
          className="w-6 h-10 border-2 border-white/50 rounded-full flex items-start justify-center p-1"
          animate={{ y: [0, 5, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <motion.div 
            className="w-1.5 h-2.5 bg-white/70 rounded-full"
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        </motion.div>
      </motion.div>
    </section>
  );
};

export default Hero;
