import { Scale, Phone, Mail, MapPin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-foreground text-background py-12">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Scale className="w-8 h-8 text-primary" />
              <div>
                <p className="font-bold text-lg">Papuga</p>
                <p className="text-sm opacity-80">Radca Prawny</p>
              </div>
            </div>
            <p className="text-sm opacity-80">
              Profesjonalna pomoc prawna dla firm i osób prywatnych
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Nawigacja</h3>
            <ul className="space-y-2 text-sm opacity-80">
              <li>
                <a href="#uslugi" className="hover:text-primary transition-colors">
                  Usługi
                </a>
              </li>
              <li>
                <a href="#o-nas" className="hover:text-primary transition-colors">
                  O nas
                </a>
              </li>
              <li>
                <a href="#kontakt" className="hover:text-primary transition-colors">
                  Kontakt
                </a>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Usługi</h3>
            <ul className="space-y-2 text-sm opacity-80">
              <li>Prawo gospodarcze</li>
              <li>Prawo cywilne</li>
              <li>Prawo nieruchomości</li>
              <li>Reprezentacja sądowa</li>
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
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>ul. Przykładowa 123<br />00-000 Warszawa</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-background/20 pt-8 text-center text-sm opacity-80">
          <p>&copy; {new Date().getFullYear()} Papuga - Prywatny Radca Prawny. Wszelkie prawa zastrzeżone.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
