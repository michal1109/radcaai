import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import LiveDemo from "@/components/LiveDemo";
import Services from "@/components/Services";
import HowItWorks from "@/components/HowItWorks";
import Stats from "@/components/Stats";
import Testimonials from "@/components/Testimonials";
import Pricing from "@/components/Pricing";
import ReferralProgram from "@/components/ReferralProgram";
import FAQ from "@/components/FAQ";
import LegalDisclaimer from "@/components/LegalDisclaimer";
import About from "@/components/About";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import FloatingChatbot from "@/components/FloatingChatbot";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navigation />
      <main className="pt-0">
        <Hero />
        <LiveDemo />
        <Services />
        <HowItWorks />
        <Stats />
        <Testimonials />
        <Pricing />
        <ReferralProgram />
        <FAQ />
        <LegalDisclaimer />
        <About />
        <Contact />
      </main>
      <Footer />
      <FloatingChatbot />
    </div>
  );
};

export default Index;
