import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, Scale } from "lucide-react";
import papugaLogo from "@/assets/papuga-3.png";

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { href: "#uslugi", label: "Usługi" },
    { href: "#o-nas", label: "O nas" },
    { href: "#kontakt", label: "Kontakt" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <a href="#" className="flex items-center gap-3 group">
            <img 
              src={papugaLogo} 
              alt="Papuga Logo" 
              className="h-16 w-auto transition-transform group-hover:scale-105"
            />
            <div className="hidden sm:block">
              <p className="font-bold text-lg text-foreground leading-tight">Papuga</p>
              <p className="text-xs text-muted-foreground">Radca Prawny</p>
            </div>
          </a>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-foreground hover:text-primary transition-colors font-medium"
              >
                {link.label}
              </a>
            ))}
            <Button size="lg" className="ml-4">
              Umów konsultację
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 text-foreground hover:text-primary transition-colors"
          >
            {isOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden py-6 space-y-4 border-t border-border">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="block text-foreground hover:text-primary transition-colors font-medium py-2"
              >
                {link.label}
              </a>
            ))}
            <Button size="lg" className="w-full">
              Umów konsultację
            </Button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
