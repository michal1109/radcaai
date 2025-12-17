import { Bot, Phone, Mail, MessageSquare } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-foreground text-background py-12">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Bot className="w-8 h-8 text-primary" />
              <div>
                <p className="font-bold text-lg">Papuga</p>
                <p className="text-sm opacity-80">Asystent Prawny AI</p>
              </div>
            </div>
            <p className="text-sm opacity-80">
              Inteligentna pomoc prawna dostępna 24/7
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Nawigacja</h3>
            <ul className="space-y-2 text-sm opacity-80">
              <li>
                <a href="#services" className="hover:text-primary transition-colors">
                  Funkcje
                </a>
              </li>
              <li>
                <a href="#how-it-works" className="hover:text-primary transition-colors">
                  Jak to działa
                </a>
              </li>
              <li>
                <a href="#pricing" className="hover:text-primary transition-colors">
                  Cennik
                </a>
              </li>
              <li>
                <a href="#faq" className="hover:text-primary transition-colors">
                  FAQ
                </a>
              </li>
              <li>
                <Link to="/auth" className="hover:text-primary transition-colors">
                  Uruchom asystenta
                </Link>
              </li>
            </ul>
          </div>

          {/* Features */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Funkcje AI</h3>
            <ul className="space-y-2 text-sm opacity-80">
              <li>Porady prawne</li>
              <li>Generowanie dokumentów</li>
              <li>Analiza sprawy</li>
              <li>Analiza dokumentów</li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Kontakt</h3>
            <ul className="space-y-3 text-sm opacity-80">
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                <a href="tel:+48123456789" className="hover:text-primary transition-colors">
                  +48 123 456 789
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <a href="mailto:kontakt@papuga-radca.pl" className="hover:text-primary transition-colors">
                  kontakt@papuga-radca.pl
                </a>
              </li>
              <li className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                <Link to="/ai-assistant" className="hover:text-primary transition-colors">
                  Czat z AI
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-background/20 pt-8 text-center text-sm opacity-80">
          <p>&copy; {new Date().getFullYear()} Papuga - Asystent Prawny AI. Wszelkie prawa zastrzeżone.</p>
          <p className="mt-2 text-xs opacity-60">
            ⚠️ Papuga AI nie jest prawnikiem. Usługa ma charakter informacyjny i edukacyjny. 
            Porady nie stanowią porady prawnej w rozumieniu przepisów prawa.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
