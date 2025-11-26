import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import feathersBg from "@/assets/feathers-bg-new.png";
import papugaLogo from "@/assets/papuga-logo-new.png";

const Hero = () => {
  return (
    <section 
      id="home" 
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      style={{
        backgroundImage: `url(${feathersBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/60" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
          <div className="flex-1 text-center lg:text-left space-y-8 animate-fade-in">
            <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight">
              Twój osobisty <br />
              <span className="text-primary">asystent prawny</span><br />
              dostępny 24/7
            </h1>
            <p className="text-xl md:text-2xl text-white/90 max-w-2xl">
              Uzyskaj profesjonalne porady prawne, generuj dokumenty i analizuj sprawy sądowe z pomocą sztucznej inteligencji opartej na polskim prawie
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link to="/auth">
                <Button 
                  size="lg" 
                  className="text-lg px-8 py-6 bg-[hsl(25,95%,53%)] hover:bg-[hsl(25,95%,48%)] text-white shadow-lg hover:shadow-xl transition-all"
                >
                  Zadaj pytanie prawne
                </Button>
              </Link>
              <a href="#services">
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="text-lg px-8 py-6 border-2 bg-[hsl(25,95%,53%)] hover:bg-[hsl(25,95%,48%)] text-white border-[hsl(25,95%,53%)] hover:border-[hsl(25,95%,48%)] shadow-lg"
                >
                  Zobacz funkcje
                </Button>
              </a>
            </div>
          </div>
          
          <div className="flex-1 flex justify-center lg:justify-end animate-fade-in-delayed">
            <img 
              src={papugaLogo} 
              alt="Papuga - Prywatny Radca Prawny" 
              className="w-full max-w-md lg:max-w-lg drop-shadow-2xl"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
