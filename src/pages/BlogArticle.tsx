import { useParams, Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Clock, ArrowLeft, ArrowRight, Scale, Share2, Bot } from "lucide-react";

// Article content database
const articlesContent: Record<string, {
  title: string;
  category: string;
  readTime: string;
  date: string;
  tags: string[];
  content: React.ReactNode;
}> = {
  "umowa-najmu-mieszkania": {
    title: "Umowa najmu mieszkania - na co zwrócić uwagę w 2025?",
    category: "Prawo cywilne",
    readTime: "8 min",
    date: "2025-01-10",
    tags: ["najem", "umowa", "mieszkanie", "lokator"],
    content: (
      <>
        <h2>Wprowadzenie</h2>
        <p>
          Umowa najmu mieszkania to jeden z najczęściej zawieranych dokumentów prawnych w Polsce. 
          Niezależnie od tego, czy jesteś najemcą szukającym lokum, czy właścicielem wynajmującym 
          swoją nieruchomość - znajomość podstawowych zasad jest kluczowa dla ochrony Twoich interesów.
        </p>

        <h2>Forma umowy najmu</h2>
        <p>
          Umowa najmu mieszkania może być zawarta w dowolnej formie - ustnej lub pisemnej. 
          <strong>Jednak zdecydowanie zalecamy formę pisemną</strong>, ponieważ:
        </p>
        <ul>
          <li>Stanowi dowód zawarcia umowy i jej warunków</li>
          <li>Ułatwia dochodzenie roszczeń w przypadku sporu</li>
          <li>Jest wymagana dla najmu okazjonalnego (notarialnie poświadczone oświadczenie najemcy)</li>
        </ul>

        <h2>Kluczowe elementy umowy najmu</h2>
        <h3>1. Dane stron</h3>
        <p>
          Umowa musi precyzyjnie określać strony: wynajmującego (właściciela) i najemcę. 
          Należy podać pełne dane: imię, nazwisko, PESEL, adres zameldowania oraz numer dowodu osobistego.
        </p>

        <h3>2. Przedmiot najmu</h3>
        <p>
          Dokładny opis mieszkania: adres, powierzchnia, liczba pokoi, kondygnacja. 
          Warto dołączyć protokół zdawczo-odbiorczy z opisem stanu mieszkania i wyposażenia.
        </p>

        <h3>3. Czynsz i opłaty</h3>
        <p>
          Umowa powinna jasno określać:
        </p>
        <ul>
          <li>Wysokość czynszu najmu</li>
          <li>Termin płatności (np. do 10. dnia każdego miesiąca)</li>
          <li>Sposób płatności (przelew, gotówka)</li>
          <li>Kto ponosi opłaty eksploatacyjne (media, czynsz administracyjny)</li>
          <li>Warunki waloryzacji czynszu</li>
        </ul>

        <h3>4. Kaucja</h3>
        <p>
          Kaucja zabezpieczająca nie może przekroczyć <strong>12-krotności miesięcznego czynszu</strong>. 
          W praktyce wynosi zwykle 1-2 miesięczne czynsze. Powinna być zwrócona w ciągu miesiąca od 
          zakończenia najmu, po potrąceniu ewentualnych należności.
        </p>

        <h3>5. Okres najmu i wypowiedzenie</h3>
        <p>
          Umowa może być zawarta na czas określony lub nieokreślony. Przy umowie na czas nieokreślony 
          obowiązują ustawowe okresy wypowiedzenia:
        </p>
        <ul>
          <li>Gdy czynsz płatny miesięcznie - 3 miesiące naprzód na koniec miesiąca kalendarzowego</li>
          <li>Gdy czynsz płatny w krótszych okresach - 3 dni naprzód</li>
        </ul>

        <h2>Prawa i obowiązki stron</h2>
        <h3>Obowiązki wynajmującego</h3>
        <ul>
          <li>Wydanie mieszkania w stanie przydatnym do umówionego użytku</li>
          <li>Utrzymywanie mieszkania w odpowiednim stanie technicznym</li>
          <li>Przeprowadzanie niezbędnych napraw (z wyjątkiem drobnych)</li>
        </ul>

        <h3>Obowiązki najemcy</h3>
        <ul>
          <li>Terminowe płacenie czynszu i opłat</li>
          <li>Używanie mieszkania zgodnie z przeznaczeniem</li>
          <li>Drobne naprawy i konserwacja</li>
          <li>Zwrot mieszkania w stanie niepogorszonym</li>
        </ul>

        <h2>Czego unikać w umowie?</h2>
        <p>
          Uważaj na klauzule abuzywne (niedozwolone), takie jak:
        </p>
        <ul>
          <li>Zakaz przyjmowania gości</li>
          <li>Prawo wynajmującego do wejścia do mieszkania bez uprzedzenia</li>
          <li>Kary umowne za wcześniejsze rozwiązanie umowy na czas określony</li>
          <li>Automatyczne przedłużanie umowy bez zgody najemcy</li>
        </ul>

        <h2>Najem okazjonalny</h2>
        <p>
          Najem okazjonalny to szczególna forma najmu dająca wynajmującemu dodatkowe zabezpieczenia:
        </p>
        <ul>
          <li>Najemca składa oświadczenie o poddaniu się egzekucji (notarialne)</li>
          <li>Wskazuje adres, pod który się wyprowadzi po zakończeniu najmu</li>
          <li>Umowa musi być zgłoszona do urzędu skarbowego w ciągu 14 dni</li>
        </ul>

        <h2>Podsumowanie</h2>
        <p>
          Dobrze przygotowana umowa najmu chroni obie strony przed potencjalnymi problemami. 
          Pamiętaj o protokole zdawczo-odbiorczym, jasnych zasadach dotyczących opłat i terminów, 
          oraz o dokumentowaniu wszelkich ustaleń na piśmie.
        </p>
      </>
    )
  },
  "rozwod-podzial-majatku": {
    title: "Rozwód i podział majątku - kompletny przewodnik prawny",
    category: "Prawo rodzinne",
    readTime: "12 min",
    date: "2025-01-08",
    tags: ["rozwód", "majątek", "alimenty", "dzieci"],
    content: (
      <>
        <h2>Podstawy rozwodu w Polsce</h2>
        <p>
          Rozwód to rozwiązanie małżeństwa przez sąd. W Polsce orzeka o nim sąd okręgowy 
          właściwy ze względu na ostatnie wspólne miejsce zamieszkania małżonków.
        </p>

        <h2>Przesłanki rozwodu</h2>
        <p>
          Sąd może orzec rozwód, jeżeli nastąpił <strong>trwały i zupełny rozkład pożycia</strong>. 
          Oznacza to ustanie trzech więzi:
        </p>
        <ul>
          <li>Duchowej (uczuciowej)</li>
          <li>Fizycznej (intymnej)</li>
          <li>Gospodarczej (wspólne prowadzenie domu)</li>
        </ul>

        <h2>Rozwód z orzekaniem o winie</h2>
        <p>
          Sąd może orzec rozwód:
        </p>
        <ul>
          <li><strong>Bez orzekania o winie</strong> - na zgodny wniosek obu stron</li>
          <li><strong>Z winy jednego małżonka</strong> - np. zdrada, alkoholizm, przemoc</li>
          <li><strong>Z winy obojga małżonków</strong></li>
        </ul>
        <p>
          Orzeczenie o winie ma znaczenie dla alimentów między małżonkami - niewinny może 
          żądać alimentów od winnego, jeśli rozwód pogorszył istotnie jego sytuację materialną.
        </p>

        <h2>Podział majątku wspólnego</h2>
        <h3>Co wchodzi w skład majątku wspólnego?</h3>
        <ul>
          <li>Wynagrodzenie za pracę</li>
          <li>Dochody z majątku wspólnego i osobistego</li>
          <li>Środki na rachunkach OFE i PPE</li>
          <li>Nabyte wspólnie nieruchomości i ruchomości</li>
        </ul>

        <h3>Majątek osobisty (odrębny)</h3>
        <ul>
          <li>Przedmioty nabyte przed małżeństwem</li>
          <li>Spadki i darowizny (chyba że darczyńca postanowił inaczej)</li>
          <li>Przedmioty osobistego użytku</li>
          <li>Odszkodowania za uszkodzenie ciała</li>
        </ul>

        <h3>Zasady podziału</h3>
        <p>
          Co do zasady, udziały małżonków w majątku wspólnym są <strong>równe</strong>. 
          Sąd może ustalić nierówne udziały, jeśli jeden z małżonków w sposób rażący 
          nie przyczyniał się do powstania majątku wspólnego.
        </p>

        <h2>Władza rodzicielska i kontakty z dziećmi</h2>
        <p>
          W wyroku rozwodowym sąd obligatoryjnie orzeka o:
        </p>
        <ul>
          <li>Władzy rodzicielskiej nad małoletnimi dziećmi</li>
          <li>Kontaktach z dziećmi</li>
          <li>Alimentach na dzieci</li>
        </ul>
        <p>
          Coraz częściej sądy orzekają <strong>opiekę naprzemienną</strong>, gdy oboje rodzice 
          są w stanie współpracować dla dobra dziecka.
        </p>

        <h2>Koszty rozwodu</h2>
        <ul>
          <li>Opłata od pozwu: <strong>600 zł</strong></li>
          <li>Przy zgodnym wniosek o rozwód bez orzekania o winie: <strong>300 zł</strong></li>
          <li>Koszty adwokata: od 2000 do 10000+ zł (zależnie od złożoności sprawy)</li>
        </ul>

        <h2>Czas trwania postępowania</h2>
        <p>
          Rozwód bez orzekania o winie może zakończyć się na pierwszej rozprawie (kilka miesięcy). 
          Rozwód z orzekaniem o winie trwa zazwyczaj od roku do kilku lat.
        </p>
      </>
    )
  },
  "prawa-pracownika-zwolnienie": {
    title: "Twoje prawa przy zwolnieniu z pracy - poradnik 2025",
    category: "Prawo pracy",
    readTime: "10 min",
    date: "2025-01-05",
    tags: ["zwolnienie", "wypowiedzenie", "odprawa", "praca"],
    content: (
      <>
        <h2>Rodzaje rozwiązania umowy o pracę</h2>
        <p>
          Umowa o pracę może zostać rozwiązana na kilka sposobów:
        </p>
        <ul>
          <li>Za porozumieniem stron</li>
          <li>Za wypowiedzeniem</li>
          <li>Bez wypowiedzenia (dyscyplinarka)</li>
          <li>Z upływem czasu, na który była zawarta</li>
        </ul>

        <h2>Okresy wypowiedzenia</h2>
        <p>
          Okres wypowiedzenia umowy na czas nieokreślony i określony zależy od stażu pracy:
        </p>
        <ul>
          <li>Zatrudnienie do 6 miesięcy: <strong>2 tygodnie</strong></li>
          <li>Zatrudnienie od 6 miesięcy do 3 lat: <strong>1 miesiąc</strong></li>
          <li>Zatrudnienie co najmniej 3 lata: <strong>3 miesiące</strong></li>
        </ul>

        <h2>Ochrona przed zwolnieniem</h2>
        <p>
          Niektóre grupy pracowników są szczególnie chronione:
        </p>
        <ul>
          <li>Kobiety w ciąży i na urlopie macierzyńskim</li>
          <li>Pracownicy w wieku przedemerytalnym (4 lata do emerytury)</li>
          <li>Pracownicy na urlopie i zwolnieniu lekarskim</li>
          <li>Działacze związkowi</li>
        </ul>

        <h2>Odprawa pieniężna</h2>
        <p>
          Przy zwolnieniach grupowych (lub indywidualnych z przyczyn niedotyczących pracownika) 
          w firmach zatrudniających co najmniej 20 osób przysługuje odprawa:
        </p>
        <ul>
          <li>Staż do 2 lat: 1-miesięczne wynagrodzenie</li>
          <li>Staż 2-8 lat: 2-miesięczne wynagrodzenie</li>
          <li>Staż ponad 8 lat: 3-miesięczne wynagrodzenie</li>
        </ul>

        <h2>Zwolnienie dyscyplinarne</h2>
        <p>
          Pracodawca może rozwiązać umowę bez wypowiedzenia tylko w przypadku:
        </p>
        <ul>
          <li>Ciężkiego naruszenia podstawowych obowiązków pracowniczych</li>
          <li>Popełnienia przestępstwa uniemożliwiającego dalsze zatrudnienie</li>
          <li>Zawinionej utraty uprawnień koniecznych do wykonywania pracy</li>
        </ul>
        <p>
          Na zwolnienie dyscyplinarne pracodawca ma <strong>1 miesiąc</strong> od dowiedzenia się 
          o przyczynie uzasadniającej rozwiązanie umowy.
        </p>

        <h2>Jak się odwołać?</h2>
        <p>
          Od wypowiedzenia lub rozwiązania umowy bez wypowiedzenia możesz odwołać się do sądu pracy. 
          Termin to <strong>21 dni</strong> od doręczenia pisma pracodawcy.
        </p>
        <p>
          Możesz żądać:
        </p>
        <ul>
          <li>Uznania wypowiedzenia za bezskuteczne</li>
          <li>Przywrócenia do pracy</li>
          <li>Odszkodowania (zazwyczaj równowartość wynagrodzenia za okres wypowiedzenia)</li>
        </ul>

        <h2>Świadectwo pracy</h2>
        <p>
          Pracodawca musi wydać świadectwo pracy <strong>niezwłocznie</strong> (w dniu rozwiązania umowy 
          lub w ciągu 7 dni). Możesz żądać sprostowania świadectwa w ciągu 14 dni od jego otrzymania.
        </p>
      </>
    )
  },
  "reklamacja-towaru-uslugi": {
    title: "Jak skutecznie reklamować wadliwy towar lub usługę?",
    category: "Prawo konsumenckie",
    readTime: "7 min",
    date: "2025-01-03",
    tags: ["reklamacja", "konsument", "gwarancja", "rękojmia"],
    content: (
      <>
        <h2>Rękojmia vs Gwarancja</h2>
        <p>
          To dwa różne uprawnienia konsumenta, często mylone:
        </p>
        <ul>
          <li><strong>Rękojmia</strong> - wynika z przepisów prawa, przysługuje zawsze (sprzedawca odpowiada)</li>
          <li><strong>Gwarancja</strong> - dobrowolna, udzielana przez producenta lub sprzedawcę</li>
        </ul>

        <h2>Terminy reklamacji z rękojmi</h2>
        <p>
          Sprzedawca odpowiada za wady fizyczne towaru, które istniały w chwili wydania:
        </p>
        <ul>
          <li>Przez <strong>2 lata</strong> od wydania rzeczy</li>
          <li>Przez <strong>5 lat</strong> dla nieruchomości</li>
          <li>Przy rzeczach używanych sprzedawca może ograniczyć odpowiedzialność do 1 roku</li>
        </ul>
        <p>
          <strong>Ważne:</strong> Jeśli wada ujawni się w ciągu roku od zakupu, domniemywa się, 
          że istniała już w momencie sprzedaży (ciężar dowodu spoczywa na sprzedawcy).
        </p>

        <h2>Czego możesz żądać?</h2>
        <p>W ramach rękojmi możesz:</p>
        <ul>
          <li>Żądać <strong>naprawy</strong> towaru</li>
          <li>Żądać <strong>wymiany</strong> na nowy</li>
          <li>Żądać <strong>obniżenia ceny</strong></li>
          <li><strong>Odstąpić od umowy</strong> (zwrot pieniędzy) - przy wadzie istotnej</li>
        </ul>

        <h2>Procedura reklamacji</h2>
        <ol>
          <li>Zgłoś reklamację sprzedawcy (najlepiej pisemnie)</li>
          <li>Opisz dokładnie wadę i wskaż czego żądasz</li>
          <li>Dołącz dowód zakupu (paragon, faktura, potwierdzenie przelewu)</li>
          <li>Sprzedawca ma <strong>14 dni</strong> na odpowiedź - brak odpowiedzi = uznanie reklamacji</li>
        </ol>

        <h2>Co gdy sprzedawca nie uznaje reklamacji?</h2>
        <ul>
          <li>Złóż odwołanie na piśmie</li>
          <li>Skorzystaj z bezpłatnej pomocy Rzecznika Konsumentów</li>
          <li>Złóż skargę do UOKiK</li>
          <li>Skieruj sprawę do sądu lub mediacji</li>
        </ul>

        <h2>Zakupy przez internet</h2>
        <p>
          Przy zakupach online masz dodatkowe prawo - <strong>14 dni na odstąpienie od umowy</strong> 
          bez podania przyczyny. Wystarczy odesłać towar i odzyskasz pełną kwotę zakupu.
        </p>
      </>
    )
  },
  "spadek-dziedziczenie-testament": {
    title: "Spadek i dziedziczenie - co musisz wiedzieć?",
    category: "Prawo spadkowe",
    readTime: "11 min",
    date: "2024-12-28",
    tags: ["spadek", "testament", "dziedziczenie", "zachowek"],
    content: (
      <>
        <h2>Dziedziczenie ustawowe</h2>
        <p>
          Jeśli spadkodawca nie zostawił testamentu, dziedziczenie odbywa się według zasad ustawowych:
        </p>
        <ul>
          <li><strong>Grupa I:</strong> Małżonek i dzieci (po równo, małżonek min. 1/4)</li>
          <li><strong>Grupa II:</strong> Małżonek i rodzice (małżonek 1/2, rodzice po 1/4)</li>
          <li><strong>Grupa III:</strong> Rodzice, rodzeństwo</li>
          <li><strong>Grupa IV:</strong> Dziadkowie, ciocie, wujkowie</li>
          <li><strong>Ostatecznie:</strong> Gmina lub Skarb Państwa</li>
        </ul>

        <h2>Testament</h2>
        <p>
          Testament pozwala rozporządzić majątkiem według własnej woli. Rodzaje:
        </p>
        <ul>
          <li><strong>Własnoręczny</strong> - napisany w całości ręcznie, podpisany, z datą</li>
          <li><strong>Notarialny</strong> - sporządzony przez notariusza (najpewniejsza forma)</li>
          <li><strong>Allograficzny</strong> - ustny przed urzędnikiem</li>
        </ul>

        <h2>Zachowek</h2>
        <p>
          Osoby pominięte w testamencie mogą żądać zachowku:
        </p>
        <ul>
          <li>Zstępni (dzieci, wnuki), małżonek, rodzice</li>
          <li>Wysokość: <strong>1/2</strong> udziału ustawowego</li>
          <li>Dla małoletnich i trwale niezdolnych do pracy: <strong>2/3</strong></li>
        </ul>

        <h2>Przyjęcie lub odrzucenie spadku</h2>
        <p>
          Masz <strong>6 miesięcy</strong> od dowiedzenia się o powołaniu do spadku na decyzję:
        </p>
        <ul>
          <li><strong>Przyjęcie wprost</strong> - odpowiadasz za długi całym majątkiem</li>
          <li><strong>Przyjęcie z dobrodziejstwem inwentarza</strong> - odpowiadasz do wartości spadku</li>
          <li><strong>Odrzucenie spadku</strong> - nie dziedziczysz nic (przechodzi na Twoje dzieci!)</li>
        </ul>
        <p>
          <strong>Uwaga:</strong> Od 2015 r. brak oświadczenia = przyjęcie z dobrodziejstwem inwentarza.
        </p>

        <h2>Podatek od spadku</h2>
        <p>
          Najbliższa rodzina (małżonek, dzieci, rodzice, rodzeństwo) może być zwolniona z podatku, 
          jeśli zgłosi nabycie do urzędu skarbowego w ciągu <strong>6 miesięcy</strong>.
        </p>

        <h2>Postępowanie spadkowe</h2>
        <p>
          Aby formalnie nabyć spadek, potrzebujesz:
        </p>
        <ul>
          <li>Sądowego postanowienia o stwierdzeniu nabycia spadku, lub</li>
          <li>Notarialnego aktu poświadczenia dziedziczenia</li>
        </ul>
        <p>
          Następnie możesz przeprowadzić dział spadku - podział majątku między spadkobierców.
        </p>
      </>
    )
  },
  "odszkodowanie-wypadek": {
    title: "Odszkodowanie za wypadek - jak uzyskać pełną rekompensatę?",
    category: "Prawo cywilne",
    readTime: "9 min",
    date: "2024-12-20",
    tags: ["odszkodowanie", "wypadek", "szkoda", "ubezpieczenie"],
    content: (
      <>
        <h2>Rodzaje roszczeń po wypadku</h2>
        <p>Po wypadku możesz dochodzić:</p>
        <ul>
          <li><strong>Odszkodowania</strong> - pokrycie strat materialnych</li>
          <li><strong>Zadośćuczynienia</strong> - rekompensata za ból i cierpienie</li>
          <li><strong>Renty</strong> - przy trwałym uszczerbku na zdrowiu</li>
        </ul>

        <h2>Wypadek komunikacyjny</h2>
        <p>
          Przy wypadku drogowym roszczenia kierujesz do ubezpieczyciela sprawcy (OC pojazdu):
        </p>
        <ol>
          <li>Zgłoś szkodę ubezpieczycielowi w ciągu 7 dni (formalnie)</li>
          <li>Zbierz dokumentację: notatka policyjna, dokumentacja medyczna, zdjęcia</li>
          <li>Ubezpieczyciel ma 30 dni na wypłatę (90 dni w skomplikowanych sprawach)</li>
        </ol>

        <h2>Wypadek przy pracy</h2>
        <p>
          Przy wypadku w pracy masz prawo do:
        </p>
        <ul>
          <li>Jednorazowego odszkodowania z ZUS (za stały lub długotrwały uszczerbek)</li>
          <li>Renty z tytułu niezdolności do pracy</li>
          <li>Odszkodowania od pracodawcy (jeśli wypadek wynikł z jego winy)</li>
        </ul>

        <h2>Co wpływa na wysokość odszkodowania?</h2>
        <ul>
          <li>Stopień uszczerbku na zdrowiu</li>
          <li>Koszty leczenia i rehabilitacji</li>
          <li>Utracone zarobki</li>
          <li>Trwałe następstwa (blizny, niepełnosprawność)</li>
          <li>Wiek poszkodowanego</li>
          <li>Przyczynienie się do wypadku</li>
        </ul>

        <h2>Przedawnienie roszczeń</h2>
        <p>
          Roszczenia o naprawienie szkody przedawniają się z upływem <strong>3 lat</strong> od dnia, 
          w którym poszkodowany dowiedział się o szkodzie i osobie odpowiedzialnej. 
          Maksymalnie <strong>10 lat</strong> od zdarzenia (20 lat przy przestępstwie).
        </p>

        <h2>Jak zwiększyć szanse na wyższą wypłatę?</h2>
        <ul>
          <li>Dokumentuj wszystko od początku</li>
          <li>Nie podpisuj szybko ugody z ubezpieczycielem</li>
          <li>Skonsultuj sprawę z prawnikiem przed akceptacją propozycji</li>
          <li>Zbieraj faktury za wszystkie wydatki związane z leczeniem</li>
        </ul>
      </>
    )
  }
};

const BlogArticle = () => {
  const { articleId } = useParams<{ articleId: string }>();
  const article = articleId ? articlesContent[articleId] : null;

  if (!article) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="pt-24 pb-16 container mx-auto px-4">
          <div className="text-center py-16">
            <h1 className="text-3xl font-bold text-foreground mb-4">Artykuł nie znaleziony</h1>
            <p className="text-muted-foreground mb-8">Przepraszamy, ale nie możemy znaleźć tego artykułu.</p>
            <Link to="/blog">
              <Button>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Wróć do bloga
              </Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="pt-24 pb-16">
        {/* Breadcrumb */}
        <div className="container mx-auto px-4 mb-8">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link to="/" className="hover:text-primary">Strona główna</Link>
            <span>/</span>
            <Link to="/blog" className="hover:text-primary">Blog</Link>
            <span>/</span>
            <span className="text-foreground">{article.category}</span>
          </div>
        </div>

        {/* Article Header */}
        <article className="container mx-auto px-4 max-w-4xl">
          <header className="mb-12">
            <Badge variant="outline" className="mb-4 text-primary border-primary">
              {article.category}
            </Badge>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6 leading-tight">
              {article.title}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-6">
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {new Date(article.date).toLocaleDateString('pl-PL', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {article.readTime} czytania
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {article.tags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  #{tag}
                </Badge>
              ))}
            </div>
          </header>

          {/* Article Content */}
          <div className="prose prose-lg dark:prose-invert max-w-none mb-12 
            prose-headings:text-foreground prose-headings:font-bold prose-headings:mt-8 prose-headings:mb-4
            prose-h2:text-2xl prose-h2:border-b prose-h2:border-border prose-h2:pb-2
            prose-h3:text-xl
            prose-p:text-muted-foreground prose-p:leading-relaxed prose-p:mb-4
            prose-ul:text-muted-foreground prose-ul:my-4 prose-ul:list-disc prose-ul:pl-6
            prose-ol:text-muted-foreground prose-ol:my-4 prose-ol:list-decimal prose-ol:pl-6
            prose-li:mb-2
            prose-strong:text-foreground prose-strong:font-semibold">
            {article.content}
          </div>

          {/* Share and CTA */}
          <div className="flex flex-col md:flex-row gap-6 items-center justify-between border-t border-border pt-8 mb-12">
            <Button variant="outline" className="gap-2">
              <Share2 className="w-4 h-4" />
              Udostępnij artykuł
            </Button>
            <Link to="/auth">
              <Button className="gap-2">
                <Bot className="w-4 h-4" />
                Zapytaj AI o szczegóły
              </Button>
            </Link>
          </div>

          {/* AI Assistant CTA */}
          <Card className="bg-primary/5 border-primary/20 mb-12">
            <CardContent className="p-8 text-center">
              <Scale className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-bold text-foreground mb-2">
                Masz pytania dotyczące tego tematu?
              </h3>
              <p className="text-muted-foreground mb-6">
                Nasz asystent AI Papuga pomoże Ci zrozumieć Twoją konkretną sytuację prawną. 
                Zadaj pytanie i otrzymaj spersonalizowaną odpowiedź.
              </p>
              <Link to="/auth">
                <Button size="lg" className="gap-2">
                  Rozpocznij rozmowę z Papugą
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Back to Blog */}
          <div className="text-center">
            <Link to="/blog">
              <Button variant="outline" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Wróć do wszystkich artykułów
              </Button>
            </Link>
          </div>
        </article>
      </main>

      <Footer />
    </div>
  );
};

export default BlogArticle;
