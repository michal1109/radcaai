import { Star, Quote } from "lucide-react";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback } from "./ui/avatar";

const testimonials = [
  {
    name: "Anna Kowalska",
    role: "Przedsiębiorca",
    content: "Papuga pomogła mi przygotować umowę najmu w 10 minut! Wcześniej zapłaciłabym prawnikowi kilkaset złotych za to samo.",
    rating: 5,
    initials: "AK"
  },
  {
    name: "Marek Nowak",
    role: "Freelancer",
    content: "Świetne narzędzie do szybkich porad prawnych. Odpowiedzi są zrozumiałe i konkretne. Polecam każdemu!",
    rating: 5,
    initials: "MN"
  },
  {
    name: "Katarzyna Wiśniewska",
    role: "Manager HR",
    content: "Używam Papugi do weryfikacji umów o pracę. Oszczędza mi mnóstwo czasu i daje pewność, że wszystko jest zgodne z prawem.",
    rating: 5,
    initials: "KW"
  },
  {
    name: "Piotr Zieliński",
    role: "Student prawa",
    content: "Doskonałe wsparcie w nauce! Papuga wyjaśnia skomplikowane zagadnienia prawne w przystępny sposób.",
    rating: 4,
    initials: "PZ"
  },
  {
    name: "Ewa Dąbrowska",
    role: "Właścicielka sklepu",
    content: "Reklamacja klienta? Papuga podpowiedziała mi jak postępować zgodnie z prawem. Bezproblemowo rozwiązałam sprawę.",
    rating: 5,
    initials: "ED"
  },
  {
    name: "Tomasz Lewandowski",
    role: "Kierownik projektu",
    content: "Analiza umowy z kontrahentem w 5 minut. Papuga wskazała potencjalne ryzyka, które bym przeoczył.",
    rating: 5,
    initials: "TL"
  }
];

const Testimonials = () => {
  return (
    <section id="testimonials" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <Badge variant="outline" className="mb-4 text-primary border-primary">
            Opinie użytkowników
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Dołącz do zadowolonych użytkowników
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Zobacz, co mówią o nas osoby, które już korzystają z Papugi
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <Card 
              key={index}
              className="bg-card hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
            >
              <CardContent className="p-6">
                <Quote className="w-8 h-8 text-primary/20 mb-4" />
                <p className="text-muted-foreground mb-6 italic">
                  "{testimonial.content}"
                </p>
                <div className="flex items-center gap-4">
                  <Avatar className="w-12 h-12 bg-primary">
                    <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
                      {testimonial.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-semibold text-foreground">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                  <div className="flex gap-0.5">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-secondary text-secondary" />
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
