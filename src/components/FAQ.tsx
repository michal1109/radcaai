import { Badge } from "./ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";

const faqs = [
  {
    question: "Czy porady Papugi zastępują prawnika?",
    answer: "Papuga AI jest asystentem prawnym, który pomaga zrozumieć podstawowe kwestie prawne i generować dokumenty. Jednak w skomplikowanych sprawach zalecamy konsultację z profesjonalnym prawnikiem. Papuga może być świetnym pierwszym krokiem do zrozumienia Twojej sytuacji prawnej."
  },
  {
    question: "Jak bezpieczne są moje dane?",
    answer: "Bezpieczeństwo Twoich danych jest dla nas priorytetem. Wszystkie połączenia są szyfrowane SSL, a dane przechowywane zgodnie z RODO. Nie udostępniamy Twoich danych osobom trzecim i możesz je usunąć w dowolnym momencie."
  },
  {
    question: "Czy mogę anulować subskrypcję?",
    answer: "Tak, możesz anulować subskrypcję w dowolnym momencie. Twoje konto będzie aktywne do końca opłaconego okresu rozliczeniowego. Nie pobieramy żadnych opłat za anulowanie."
  },
  {
    question: "Jakie dokumenty mogę generować?",
    answer: "Papuga może generować wiele typów dokumentów prawnych: umowy (najmu, o dzieło, zlecenia), pozwy, wnioski, odwołania, reklamacje, pisma urzędowe i wiele innych. Lista dostępnych szablonów stale się powiększa."
  },
  {
    question: "W jakich obszarach prawa Papuga może pomóc?",
    answer: "Papuga specjalizuje się w prawie cywilnym, rodzinnym, pracy, konsumenckim i administracyjnym. Może pomóc w sprawach dotyczących umów, reklamacji, rozwodów, spadków, praw pracowniczych i wielu innych obszarach."
  },
  {
    question: "Czy Papuga działa w języku polskim?",
    answer: "Tak! Papuga została stworzona specjalnie dla polskich użytkowników i zna polskie prawo. Wszystkie porady i dokumenty są generowane w języku polskim, zgodnie z obowiązującym prawodawstwem."
  }
];

const FAQ = () => {
  return (
    <section id="faq" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <Badge variant="outline" className="mb-4 text-primary border-primary">
            FAQ
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Najczęściej zadawane pytania
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Odpowiedzi na pytania, które zadają nasi użytkownicy
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem 
                key={index} 
                value={`item-${index}`}
                className="border border-border rounded-lg px-6 bg-card"
              >
                <AccordionTrigger className="text-left font-semibold hover:text-primary">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
};

export default FAQ;
