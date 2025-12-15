import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import Services from "@/components/Services";
import Stats from "@/components/Stats";
import Testimonials from "@/components/Testimonials";
import Pricing from "@/components/Pricing";
import FAQ from "@/components/FAQ";
import About from "@/components/About";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navigation />
      <main className="pt-0">
        <Hero />
        <Services />
        <Stats />
        <Testimonials />
        <Pricing />
        <FAQ />
        <About />
        <Contact />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
