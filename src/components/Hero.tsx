import { Button } from "@/components/ui/button";
import { Scale, Phone, Mail, Bot } from "lucide-react";
import { useNavigate } from "react-router-dom";
import papugaLogo from "@/assets/papuga-logo.png";
import papuga2 from "@/assets/papuga-2.png";
import feathersBg from "@/assets/feathers-bg-new.png";

const Hero = () => {
  const navigate = useNavigate();

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background with feathers */}
      <div 
        className="absolute inset-0 opacity-50"
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

          {/* Right Column - Mascot Image */}
          <div className="relative flex justify-center lg:justify-end">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 rounded-full blur-3xl" />
              <img 
                src={papuga2} 
                alt="Papuga - Prywatny Radca Prawny" 
                className="relative w-full max-w-md lg:max-w-lg h-auto drop-shadow-2xl animate-in fade-in zoom-in duration-700"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
