import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, Bot } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import papugaLogo from "@/assets/papuga-logo-new.png";

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const isHomePage = location.pathname === "/";

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
          <div className="hidden md:flex items-center gap-6">
            {isHomePage && navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-foreground hover:text-primary transition-colors font-medium"
              >
                {link.label}
              </a>
            ))}
            <Link to="/ai-assistant">
              <Button variant="outline" className="gap-2">
                <Bot className="w-4 h-4" />
                Asystent AI
              </Button>
            </Link>
            {isHomePage && (
              <Button size="lg">
                Umów konsultację
              </Button>
            )}
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
            {isHomePage && navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="block text-foreground hover:text-primary transition-colors font-medium py-2"
              >
                {link.label}
              </a>
            ))}
            <Link to="/ai-assistant" onClick={() => setIsOpen(false)}>
              <Button variant="outline" className="w-full gap-2">
                <Bot className="w-4 h-4" />
                Asystent AI
              </Button>
            </Link>
            {isHomePage && (
              <Button size="lg" className="w-full">
                Umów konsultację
              </Button>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
