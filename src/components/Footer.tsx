import { Bot, Mail, MessageSquare, FileText, Shield } from "lucide-react";
import { Link } from "react-router-dom";
import NewsletterSignup from "./NewsletterSignup";

const Footer = () => {
  return (
    <footer className="bg-foreground text-background py-12">
      <div className="container mx-auto px-4">
        {/* Newsletter Section */}
        <div className="max-w-md mx-auto mb-12">
          <NewsletterSignup source="footer" />
        </div>

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
                <Link to="/blog" className="hover:text-primary transition-colors">
                  Blog prawny
                </Link>
              </li>
              <li>
                <Link to="/auth" className="hover:text-primary transition-colors">
                  Uruchom asystenta
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Informacje prawne</h3>
            <ul className="space-y-2 text-sm opacity-80">
              <li className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                <Link to="/regulamin" className="hover:text-primary transition-colors">
                  Regulamin
                </Link>
              </li>
              <li className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                <Link to="/polityka-prywatnosci" className="hover:text-primary transition-colors">
                  Polityka Prywatności
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Kontakt</h3>
            <ul className="space-y-3 text-sm opacity-80">
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <a href="mailto:michal.plecha@vp.pl" className="hover:text-primary transition-colors">
                  michal.plecha@vp.pl
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
