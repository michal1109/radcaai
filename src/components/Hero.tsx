import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import feathersBg from "@/assets/feathers-bg-new.png";
import papugaLogo from "@/assets/papuga-logo-new.png";
import { AnimatedCounter } from "@/components/ui/animated-counter";
import { Users, Star, Clock, CheckCircle } from "lucide-react";

const stats = [
  { icon: Users, value: 12500, suffix: "+", label: "Użytkowników" },
  { icon: Star, value: 98, suffix: "%", label: "Zadowolonych" },
  { icon: Clock, value: 24, suffix: "/7", label: "Dostępność" },
  { icon: CheckCircle, value: 50000, suffix: "+", label: "Rozwiązanych spraw" },
];

const Hero = () => {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"]
  });
  
  const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const textY = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  return (
    <section 
      ref={ref}
      id="home" 
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Parallax Background */}
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
      
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/60 z-[1]" />
      
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
            <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight">
              Twój osobisty <br />
              <span className="text-primary">asystent prawny</span><br />
              dostępny 24/7
            </h1>
            <p className="text-xl md:text-2xl text-white/90 max-w-2xl">
              Uzyskaj profesjonalne porady prawne, generuj dokumenty i analizuj sprawy sądowe z pomocą sztucznej inteligencji opartej na polskim prawie
            </p>
            
            {/* CTA Buttons with enhanced animations */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link to="/auth">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button 
                    size="lg" 
                    className="text-lg px-8 py-6 bg-[hsl(25,95%,53%)] hover:bg-[hsl(25,95%,48%)] text-white shadow-lg hover:shadow-xl transition-all relative overflow-hidden group"
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
              <a href="#demo">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="text-lg px-8 py-6 border-2 bg-transparent hover:bg-white/10 text-white border-white/50 hover:border-white shadow-lg transition-all"
                  >
                    Wypróbuj Demo
                  </Button>
                </motion.div>
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
          
          {/* Animated Parrot Logo */}
          <motion.div 
            className="flex-1 flex justify-center lg:justify-end"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <motion.img 
              src={papugaLogo} 
              alt="Papuga - Prywatny Radca Prawny" 
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
