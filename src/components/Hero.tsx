import { Button } from "@/components/ui/button";
import { Scale, Phone, Mail, Bot } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useRef } from "react";
import papugaLogo from "@/assets/papuga-logo.png";
import papuga2 from "@/assets/papuga-2.png";
import papugaAvatar from "@/assets/papuga-avatar.png";
import feathersBg from "@/assets/feathers-bg.png";

const Hero = () => {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();

  useEffect(() => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.src = papugaAvatar;
    
    img.onload = () => {
      let phase = 0;
      const animate = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        // Subtle breathing animation
        phase += 0.02;
        const scale = 1 + Math.sin(phase) * 0.02;
        
        ctx.save();
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.scale(scale, scale);
        ctx.translate(-canvas.width / 2, -canvas.height / 2);
        ctx.globalAlpha = 0.1;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        ctx.restore();
        
        animationRef.current = requestAnimationFrame(animate);
      };
      
      animate();
    };

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background with feathers */}
      <div 
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `url(${feathersBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      
      <div className="container mx-auto px-4 py-20 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Text Content */}
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
              <Scale className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-foreground">Profesjonalna pomoc prawna</span>
            </div>
            
            <div className="space-y-4">
              <h1 className="text-5xl lg:text-6xl font-bold text-foreground leading-tight">
                Papuga
              </h1>
              <h2 className="text-3xl lg:text-4xl font-semibold text-primary">
                Prywatny Radca Prawny
              </h2>
              <p className="text-xl text-muted-foreground max-w-xl">
                Kompleksowa obsługa prawna dla firm i osób prywatnych. 
                Doświadczenie, profesjonalizm i indywidualne podejście do każdego klienta.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg" 
                className="text-lg h-14 px-8 shadow-lg hover:shadow-xl transition-all"
                onClick={() => navigate('/ai-assistant')}
              >
                <Bot className="mr-2 h-5 w-5" />
                Asystent AI
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="text-lg h-14 px-8 border-2"
              >
                <Phone className="mr-2 h-5 w-5" />
                Umów konsultację
              </Button>
            </div>

            <div className="flex flex-wrap gap-8 pt-8 border-t border-border">
              <div>
                <p className="text-3xl font-bold text-primary">15+</p>
                <p className="text-sm text-muted-foreground">Lat doświadczenia</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-primary">500+</p>
                <p className="text-sm text-muted-foreground">Zadowolonych klientów</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-primary">98%</p>
                <p className="text-sm text-muted-foreground">Wygranych spraw</p>
              </div>
            </div>
          </div>

          {/* Right Column - Animated Avatar */}
          <div className="relative flex justify-center lg:justify-end">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 rounded-full blur-3xl" />
              <canvas 
                ref={canvasRef} 
                width={500} 
                height={500}
                className="relative w-full max-w-md lg:max-w-lg drop-shadow-2xl animate-in fade-in zoom-in duration-700 rounded-full"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
