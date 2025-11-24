import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Phone, Mail, MapPin, Clock } from "lucide-react";

const Contact = () => {
  return (
    <section id="kontakt" className="py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-4xl lg:text-5xl font-bold text-foreground">
            Potrzebujesz dodatkowej pomocy?
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Skontaktuj się z nami, aby uzyskać dodatkowe informacje o asystencie AI
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Contact Info Cards */}
          <div className="space-y-6">
            <Card className="border-2">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
                  <Phone className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-lg">Telefon</CardTitle>
              </CardHeader>
              <CardContent>
                <a href="tel:+48123456789" className="text-foreground hover:text-primary transition-colors">
                  +48 123 456 789
                </a>
              </CardContent>
            </Card>

            <Card className="border-2">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
                  <Mail className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-lg">Email</CardTitle>
              </CardHeader>
              <CardContent>
                <a href="mailto:kontakt@papuga-radca.pl" className="text-foreground hover:text-primary transition-colors">
                  kontakt@papuga-radca.pl
                </a>
              </CardContent>
            </Card>

            <Card className="border-2">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
                  <MapPin className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-lg">Adres</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-foreground">
                  ul. Przykładowa 123<br />
                  00-000 Warszawa
                </p>
              </CardContent>
            </Card>

            <Card className="border-2">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
                  <Clock className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-lg">Godziny otwarcia</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-foreground">
                  Pon - Pt: 9:00 - 17:00<br />
                  Sob - Ndz: Zamknięte
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Contact Form */}
          <Card className="lg:col-span-2 border-2">
            <CardHeader>
              <CardTitle className="text-2xl">Wyślij wiadomość</CardTitle>
              <CardDescription>
                Wypełnij formularz, a skontaktujemy się z Tobą najszybciej jak to możliwe
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Imię i nazwisko</Label>
                    <Input id="name" placeholder="Jan Kowalski" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="jan@example.com" />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefon</Label>
                  <Input id="phone" type="tel" placeholder="+48 123 456 789" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject">Temat</Label>
                  <Input id="subject" placeholder="W jakiej sprawie chcesz się skontaktować?" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Wiadomość</Label>
                  <Textarea 
                    id="message" 
                    placeholder="Opisz swoją sprawę..." 
                    rows={6}
                  />
                </div>

                <Button type="submit" size="lg" className="w-full md:w-auto">
                  Wyślij wiadomość
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default Contact;
