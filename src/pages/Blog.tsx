import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Calendar, Clock, ArrowRight, Scale, FileText, Users, Home, Briefcase, ShoppingCart } from "lucide-react";

const blogArticles = [
  {
    id: "umowa-najmu-mieszkania",
    title: "Umowa najmu mieszkania - na co zwrócić uwagę w 2025?",
    excerpt: "Dowiedz się jakie klauzule powinny znaleźć się w umowie najmu, jak zabezpieczyć swoje prawa jako najemca lub wynajmujący oraz jakich błędów unikać.",
    category: "Prawo cywilne",
    icon: Home,
    readTime: "8 min",
    date: "2025-01-10",
    tags: ["najem", "umowa", "mieszkanie", "lokator"]
  },
  {
    id: "rozwod-podzial-majatku",
    title: "Rozwód i podział majątku - kompletny przewodnik prawny",
    excerpt: "Wszystko co musisz wiedzieć o rozwodzie: procedura, koszty, podział majątku wspólnego, alimenty i władza rodzicielska nad dziećmi.",
    category: "Prawo rodzinne",
    icon: Users,
    readTime: "12 min",
    date: "2025-01-08",
    tags: ["rozwód", "majątek", "alimenty", "dzieci"]
  },
  {
    id: "prawa-pracownika-zwolnienie",
    title: "Twoje prawa przy zwolnieniu z pracy - poradnik 2025",
    excerpt: "Jakie masz prawa gdy pracodawca chce Cię zwolnić? Okresy wypowiedzenia, odprawa, odszkodowanie i jak się odwołać od niesłusznego zwolnienia.",
    category: "Prawo pracy",
    icon: Briefcase,
    readTime: "10 min",
    date: "2025-01-05",
    tags: ["zwolnienie", "wypowiedzenie", "odprawa", "praca"]
  },
  {
    id: "reklamacja-towaru-uslugi",
    title: "Jak skutecznie reklamować wadliwy towar lub usługę?",
    excerpt: "Poznaj swoje prawa konsumenta: rękojmia vs gwarancja, terminy reklamacji, wzory pism i co robić gdy sprzedawca nie uznaje reklamacji.",
    category: "Prawo konsumenckie",
    icon: ShoppingCart,
    readTime: "7 min",
    date: "2025-01-03",
    tags: ["reklamacja", "konsument", "gwarancja", "rękojmia"]
  },
  {
    id: "spadek-dziedziczenie-testament",
    title: "Spadek i dziedziczenie - co musisz wiedzieć?",
    excerpt: "Dziedziczenie ustawowe czy testament? Jak przeprowadzić postępowanie spadkowe, jakie są podatki od spadku i jak odrzucić spadek z długami.",
    category: "Prawo spadkowe",
    icon: FileText,
    readTime: "11 min",
    date: "2024-12-28",
    tags: ["spadek", "testament", "dziedziczenie", "zachowek"]
  },
  {
    id: "odszkodowanie-wypadek",
    title: "Odszkodowanie za wypadek - jak uzyskać pełną rekompensatę?",
    excerpt: "Krok po kroku jak dochodzić odszkodowania po wypadku komunikacyjnym, w pracy czy innym zdarzeniu. Terminy, dokumenty i wysokość roszczeń.",
    category: "Prawo cywilne",
    icon: Scale,
    readTime: "9 min",
    date: "2024-12-20",
    tags: ["odszkodowanie", "wypadek", "szkoda", "ubezpieczenie"]
  }
];

const Blog = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="pt-24 pb-16">
        {/* Hero Section */}
        <section className="container mx-auto px-4 mb-16">
          <div className="text-center max-w-3xl mx-auto">
            <Badge variant="outline" className="mb-4 text-primary border-primary">
              Blog Prawny
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Wiedza prawna dla każdego
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              Praktyczne artykuły napisane prostym językiem. Poznaj swoje prawa 
              i dowiedz się jak rozwiązywać najczęstsze problemy prawne.
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {["Prawo cywilne", "Prawo rodzinne", "Prawo pracy", "Prawo konsumenckie"].map((cat) => (
                <Badge key={cat} variant="secondary" className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors">
                  {cat}
                </Badge>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Article */}
        <section className="container mx-auto px-4 mb-16">
          <Card className="overflow-hidden border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-background">
            <div className="md:flex">
              <div className="md:w-1/3 bg-primary/10 flex items-center justify-center p-8">
                <Scale className="w-24 h-24 text-primary" />
              </div>
              <div className="md:w-2/3 p-8">
                <Badge className="mb-4 bg-primary text-primary-foreground">Polecany</Badge>
                <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                  {blogArticles[0].title}
                </h2>
                <p className="text-muted-foreground mb-6">
                  {blogArticles[0].excerpt}
                </p>
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-6">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {new Date(blogArticles[0].date).toLocaleDateString('pl-PL')}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {blogArticles[0].readTime} czytania
                  </span>
                </div>
                <Link to={`/blog/${blogArticles[0].id}`}>
                  <Button className="gap-2">
                    Czytaj artykuł
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        </section>

        {/* All Articles Grid */}
        <section className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-foreground mb-8">Wszystkie artykuły</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {blogArticles.map((article) => {
              const IconComponent = article.icon;
              return (
                <Card key={article.id} className="group hover:shadow-lg hover:border-primary/30 transition-all duration-300">
                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="outline">{article.category}</Badge>
                      <IconComponent className="w-5 h-5 text-primary" />
                    </div>
                    <CardTitle className="text-xl group-hover:text-primary transition-colors">
                      {article.title}
                    </CardTitle>
                    <CardDescription className="line-clamp-2">
                      {article.excerpt}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {article.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          #{tag}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(article.date).toLocaleDateString('pl-PL')}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {article.readTime}
                      </span>
                    </div>
                    <Link to={`/blog/${article.id}`}>
                      <Button variant="ghost" className="w-full mt-4 group-hover:bg-primary/10">
                        Czytaj więcej
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        {/* CTA Section */}
        <section className="container mx-auto px-4 mt-16">
          <Card className="bg-primary text-primary-foreground p-8 text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Masz pytanie prawne?
            </h2>
            <p className="text-primary-foreground/80 mb-6 max-w-xl mx-auto">
              Zadaj pytanie naszemu asystentowi AI i otrzymaj natychmiastową pomoc. 
              Papuga pomoże Ci zrozumieć Twoją sytuację prawną.
            </p>
            <Link to="/auth">
              <Button size="lg" variant="secondary" className="gap-2">
                Zapytaj Papugę
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </Card>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Blog;
