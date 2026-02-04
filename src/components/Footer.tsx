import { Scale, Mail, MessageSquare, FileText, Shield, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import NewsletterSignup from "./NewsletterSignup";

const Footer = () => {
  return (
    <footer className="bg-foreground text-background py-12">
      <div className="container mx-auto px-4">
        {/* Legal Disclaimer Banner */}
        <div className="bg-background/10 border border-background/20 rounded-lg p-4 mb-8">
          <div className="flex items-start gap-3">
            <Scale className="w-5 h-5 text-primary shrink-0 mt-0.5" />
            <p className="text-sm opacity-90">
              <strong>Aplikacja RadcaAI dostarcza wyłącznie ogólnych informacji prawnych</strong> i nie stanowi 
              porady prawnej w rozumieniu ustawy o radcach prawnych oraz ustawy Prawo o adwokaturze. 
              Użycie aplikacji nie tworzy relacji klient-prawnik. Odpowiedzi są generowane przez AI i mogą zawierać błędy.
            </p>
          </div>
        </div>

        {/* Newsletter Section */}
        <div className="max-w-md mx-auto mb-12">
          <NewsletterSignup source="footer" />
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Scale className="w-8 h-8 text-primary" />
              <div>
                <p className="font-bold text-lg">RadcaAI</p>
                <p className="text-sm opacity-80">Wsparcie informacyjne</p>
              </div>
            </div>
            <p className="text-sm opacity-80">
              System informacji prawnej dostępny 24/7
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
                  Uruchom RadcaAI
                </Link>
              </li>
            </ul>
          </div>

          {/* Find a Lawyer */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Znajdź prawnika</h3>
            <ul className="space-y-2 text-sm opacity-80">
              <li className="flex items-center gap-2">
                <ExternalLink className="w-4 h-4" />
                <a 
                  href="https://www.adwokatura.pl/znajdz-adwokata/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-primary transition-colors"
                >
                  Naczelna Rada Adwokacka
                </a>
              </li>
              <li className="flex items-center gap-2">
                <ExternalLink className="w-4 h-4" />
                <a 
                  href="https://rejestr.kirp.pl/home" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-primary transition-colors"
                >
                  Krajowa Izba Radców Prawnych
                </a>
              </li>
            </ul>
            
            <h3 className="font-semibold text-lg mt-6 mb-4">Informacje prawne</h3>
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
                  Czat z RadcaAI
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-background/20 pt-8 text-center text-sm opacity-80">
          <p>&copy; {new Date().getFullYear()} RadcaAI - System wsparcia informacyjnego. Wszelkie prawa zastrzeżone.</p>
          <p className="mt-2 text-xs opacity-60">
            ⚠️ RadcaAI nie jest kancelarią prawną ani prawnikiem. Usługa ma charakter wyłącznie informacyjny i edukacyjny. 
            Informacje nie stanowią porady prawnej w rozumieniu przepisów prawa. Dane chronione zgodnie z RODO.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
