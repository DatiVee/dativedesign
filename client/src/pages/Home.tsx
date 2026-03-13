import { useEffect, useRef, useState, type FormEvent, type MouseEvent, type ReactNode } from "react";
import {
  AnimatePresence,
  LazyMotion,
  domAnimation,
  m as motion,
  useInView,
  useScroll,
  useTransform,
} from "framer-motion";
import {
  Award,
  CheckCircle,
  ChevronDown,
  Facebook,
  FileText,
  Heart,
  Instagram,
  Layers,
  Linkedin,
  Mail,
  MapPin,
  Megaphone,
  Package,
  Palette,
  Pen,
  Phone,
  Send,
  Sparkles,
  Star,
  Users,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const HERO_BG = "/hero.jpg";
const PORTFOLIO_SHOWCASE = "/portfolio1.jpg";
const SERVICES_BG = "/portfolio2.jpg";
const BRANDING_IMG = "/portfolio3.jpg";
const PACKAGING_IMG = "/portfolio4.jpg";

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7 } },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } } as const,
};

type Language = "pl" | "en";

type Service = {
  icon: typeof Palette;
  title: string;
  subtitle: string;
  description: string;
  tags: string[];
};

type Project = {
  client: string;
  title: string;
  category: string;
  description: string;
  tags: string[];
  image: string;
  gallery?: string[];
};

type Review = {
  name: string;
  rating: number;
  text: string;
  project: string;
  initials: string;
};

type Stat = {
  value?: string;
  icon?: typeof Users;
  label: string;
  sublabel: string;
};

type DeliverableGroup = {
  title: string;
  items: string[];
};

type Faq = {
  question: string;
  answer: string;
};

type ContactItem = {
  icon: typeof Phone;
  label: string;
  value: string;
  href?: string;
};

type PageCopy = {
  pageTitle: string;
  pageDescription: string;
  ogTitle: string;
  ogDescription: string;
  navItems: readonly [string, string][];
  navCta: string;
  switchLabel: string;
  hero: {
    eyebrow: string;
    titleTop: string;
    titleBottom: string;
    description: string;
    primaryCta: string;
    secondaryCta: string;
    highlights: string[];
    scroll: string;
  };
  marqueeItems: string[];
  about: {
    eyebrow: string;
    titleTop: string;
    titleMiddle: string;
    titleBottom: string;
    paragraphs: string[];
    badges: string[];
    stats: Stat[];
  };
  strengthsEyebrow: string;
  strengths: { icon: typeof Award; title: string; description: string }[];
  servicesSection: {
    eyebrow: string;
    title: string;
    accent: string;
    description: string;
  };
  services: Service[];
  audience: {
    eyebrow: string;
    titleTop: string;
    titleBottom: string;
    description: string;
    industries: string[];
  };
  processEyebrow: string;
  processSteps: { title: string; description: string }[];
  portfolio: {
    eyebrow: string;
    titleTop: string;
    titleBottom: string;
    sideText: string;
    more: string;
  };
  projects: Project[];
  deliverablesSection: {
    eyebrow: string;
    titleTop: string;
    titleBottom: string;
    description: string;
    primaryCta: string;
    secondaryCta: string;
  };
  deliverables: DeliverableGroup[];
  quickCta: {
    eyebrow: string;
    title: string;
    description: string;
    primaryCta: string;
  };
  reviewsSection: {
    eyebrow: string;
    title: string;
    badgeText: string;
  };
  reviewBadges: { icon: typeof Award; label: string }[];
  reviews: Review[];
  faqSection: {
    eyebrow: string;
    titleTop: string;
    titleBottom: string;
  };
  faqs: Faq[];
  contact: {
    eyebrow: string;
    titleTop: string;
    titleBottom: string;
    description: string;
    items: ContactItem[];
    form: {
      nameLabel: string;
      emailLabel: string;
      messageLabel: string;
      messagePlaceholder: string;
      submit: string;
      submitting: string;
      direct: string;
      successTitle: string;
      successText: string;
      errors: {
        fillAll: string;
        sendFailed: string;
      };
      toast: {
        sent: string;
        sentDesc: string;
      };
    };
  };
  modalCta: string;
  mobileContact: string;
  footer: string;
};

const content: Record<Language, PageCopy> = {
  pl: {
    pageTitle: "DatiVe Design | Projektowanie graficzne, logo, etykiety i branding",
    pageDescription: "DatiVe Design tworzy logo, branding, etykiety, opakowania i materiały reklamowe dla firm z Rzeszowa, Kolbuszowej i całej Polski.",
    ogTitle: "DatiVe Design | Projektowanie graficzne dla marek",
    ogDescription: "Logo, branding, etykiety, opakowania i materiały reklamowe zaprojektowane z wyczuciem marki i sprzedaży.",
    navItems: [["#about", "O Nas"], ["#services", "Usługi"], ["#portfolio", "Portfolio"], ["#reviews", "Opinie"], ["#contact", "Kontakt"]],
    navCta: "Napisz do mnie",
    switchLabel: "Zmień język",
    hero: {
      eyebrow: "◆ Projektant Graficzny - Rzeszów / Kolbuszowa",
      titleTop: "Z POMYSŁU",
      titleBottom: "DO REALIZACJI",
      description: "Profesjonalne usługi graficzne dla Twojej firmy. Tworzę identyfikacje wizualne, etykiety, materiały drukowane i grafiki reklamowe, które wyróżniają Twoją markę.",
      primaryCta: "Zobacz portfolio",
      secondaryCta: "Napisz o projekcie",
      highlights: ["PROFESJONALIZM", "DOŚWIADCZENIE", "INNOWACYJNOŚĆ"],
      scroll: "Przewiń",
    },
    marqueeItems: ["branding", "logo", "etykiety", "wizytówki", "opakowania", "social media", "materiały drukowane", "grafika reklamowa", "rebranding"],
    about: {
      eyebrow: "Nasza Historia",
      titleTop: "GRAFIK",
      titleMiddle: "KOMPUTEROWY",
      titleBottom: "Z PASJĄ",
      paragraphs: [
        "DatiVe Design to studio graficzne z siedzibą w Rzeszowie i Kolbuszowej. Specjalizuję się w tworzeniu profesjonalnych materiałów graficznych dla firm, które chcą wyróżnić się na rynku i zbudować silną, rozpoznawalną markę.",
        "Każdy projekt traktuję indywidualnie - słucham potrzeb klienta, analizuję rynek i tworzę rozwiązania, które nie tylko dobrze wyglądają, ale przede wszystkim działają. Od pomysłu do realizacji.",
      ],
      badges: ["Zawsze dostępny", "100% rekomendacji", "12 recenzji"],
      stats: [
        { value: "100%", label: "Poleceń od klientów", sublabel: "na podstawie opinii" },
        { value: "100+", label: "Obserwujących", sublabel: "aktywnie rosnąca społeczność" },
        { value: "Różne", label: "Branże", sublabel: "Różnorodne projekty" },
        { icon: Users, label: "Kontakt bez pośredników", sublabel: "rozmawiasz bezpośrednio ze mną" },
      ],
    },
    strengthsEyebrow: "Dlaczego warto",
    strengths: [
      { icon: Award, title: "Profesjonalne podejście", description: "Każdy projekt ma konkretny cel, porządną kompozycję i sensowny kierunek wizualny." },
      { icon: Users, title: "Bezpośredni kontakt", description: "Rozmawiasz bezpośrednio ze mną, więc nic nie ginie po drodze i szybciej dochodzimy do efektu." },
      { icon: Sparkles, title: "Dopracowane detale", description: "Dbam o typografię, kolor, proporcje i końcowe pliki, żeby projekt dobrze działał w praktyce." },
    ],
    servicesSection: {
      eyebrow: "Co robię",
      title: "Usługi",
      accent: "graficzne",
      description: "Od logo po gotowe materiały do druku i promocji. Wszystko spójne, czytelne i zrobione z głową.",
    },
    services: [
      { icon: Palette, title: "Branding i identyfikacja wizualna", subtitle: "Spójny wizerunek marki", description: "Projektuję identyfikacje wizualne, które wyglądają profesjonalnie, budują zaufanie i ułatwiają zapamiętanie marki.", tags: ["Logo", "Kolorystyka", "Typografia", "Brandbook"] },
      { icon: Package, title: "Etykiety i opakowania", subtitle: "Projekt na półkę i do sprzedaży", description: "Tworzę etykiety i opakowania, które przyciągają uwagę, są czytelne i dobrze niosą charakter produktu.", tags: ["Label design", "Packaging", "Skład DTP", "Makiety"] },
      { icon: FileText, title: "Materiały drukowane", subtitle: "Druk, który robi robotę", description: "Wizytówki, ulotki, vouchery i katalogi przygotowane nie tylko estetycznie, ale też sensownie pod druk.", tags: ["Wizytówki", "Ulotki", "Vouchery", "Katalogi"] },
      { icon: Megaphone, title: "Grafika reklamowa", subtitle: "Kampanie i social media", description: "Projektuję grafiki promocyjne do social mediów, reklam i banerów tak, żeby były spójne z marką i konkretne w przekazie.", tags: ["Posty", "Banery", "Reklamy", "Promocje"] },
      { icon: Layers, title: "Projektowanie logo", subtitle: "Znak z charakterem", description: "Tworzę logo dopasowane do branży i stylu marki, z przemyślanymi proporcjami, wersjami i czytelnością w użyciu.", tags: ["Sygnet", "Logotyp", "Wersje", "Pliki końcowe"] },
      { icon: Pen, title: "Doradztwo wizualne", subtitle: "Pomoc w kierunku marki", description: "Jeśli nie wiesz, od czego zacząć, pomogę poukładać styl wizualny marki i dobrać sensowny kierunek komunikacji.", tags: ["Konsultacje", "Audyt", "Rebranding", "Strategia"] },
    ],
    audience: {
      eyebrow: "Dla kogo",
      titleTop: "Projektuję dla marek,",
      titleBottom: "które chcą się wyróżnić",
      description: "Niezależnie od tego, czy potrzebujesz logo, etykiety, materiałów reklamowych czy pełniejszego odświeżenia marki, projekt ma być spójny, mocny i gotowy do użycia.",
      industries: ["Marki lokalne i usługowe", "Gastronomia i produkty premium", "Social media i kampanie reklamowe", "Motoryzacja i branże techniczne"],
    },
    processEyebrow: "Jak wygląda współpraca",
    processSteps: [
      { title: "1. Brief i rozmowa", description: "Ustalamy, czego potrzebujesz, jaki masz styl marki i co finalnie ma dowieźć projekt." },
      { title: "2. Koncepcja projektu", description: "Przygotowuję kierunek wizualny, układ i rozwiązania dopasowane do Twojej branży." },
      { title: "3. Poprawki i dopracowanie", description: "Szlifujemy projekt tak, żeby był spójny, czytelny i gotowy do realnego użycia." },
      { title: "4. Finalne pliki", description: "Dostajesz gotowe materiały do druku, internetu albo dalszego wdrożenia bez chaosu." },
    ],
    portfolio: {
      eyebrow: "Realizacje",
      titleTop: "Wybrane",
      titleBottom: "projekty",
      sideText: "Każdy projekt to unikalna historia marki opowiedziana przez kształty, kolory i typografię.",
      more: "Zobacz więcej na Facebooku",
    },
    projects: [],
    deliverablesSection: {
      eyebrow: "Zakres usług",
      titleTop: "Co mogę dla Ciebie",
      titleBottom: "zaprojektować?",
      description: "Jeśli potrzebujesz spójnej oprawy marki albo pojedynczych materiałów reklamowych, mogę wejść w temat od logo aż po gotowe pliki do druku i internetu.",
      primaryCta: "Zapytaj o projekt",
      secondaryCta: "Zobacz usługi",
    },
    deliverables: [],
    quickCta: {
      eyebrow: "Szybki kontakt",
      title: "Masz pomysł, markę albo produkt?",
      description: "Napisz i zobaczymy, jak ubrać to w mocną grafikę, która będzie wyglądać profesjonalnie i robić robotę.",
      primaryCta: "Napisz do mnie",
    },
    reviewsSection: { eyebrow: "Opinie klientów", title: "100% REKOMENDACJI", badgeText: "5/5 od klientów" },
    reviewBadges: [],
    reviews: [],
    faqSection: { eyebrow: "FAQ", titleTop: "Najczęstsze", titleBottom: "pytania" },
    faqs: [],
    contact: {
      eyebrow: "Kontakt",
      titleTop: "NAPISZ",
      titleBottom: "DO MNIE",
      description: "Chcesz wyróżnić swoją markę? Masz projekt do omówienia? Napisz do mnie - razem stworzymy coś wyjątkowego.",
      items: [],
      form: {
        nameLabel: "Imię i nazwisko",
        emailLabel: "Adres e-mail",
        messageLabel: "Napisz, czego potrzebujesz",
        messagePlaceholder: "Np. potrzebuję logo i kompletu materiałów do otwarcia nowej marki...",
        submit: "Wyślij wiadomość",
        submitting: "Wysyłanie...",
        direct: "Możesz też napisać bezpośrednio: kontakt@dativedesign.com",
        successTitle: "Wiadomość wysłana",
        successText: "Dzięki. Odezwę się tak szybko, jak to możliwe.",
        errors: { fillAll: "Uzupełnij wszystkie pola.", sendFailed: "Nie udało się wysłać wiadomości. Spróbuj jeszcze raz." },
        toast: { sent: "Wiadomość wysłana.", sentDesc: "Odezwę się najszybciej, jak się da." },
      },
    },
    modalCta: "Zamów podobny projekt",
    mobileContact: "Kontakt",
    footer: "© 2025 DatiVe Design - Profesjonalne Usługi Graficzne dla Twojej firmy",
  },
  en: {} as PageCopy,
};

content.pl.projects = [
  { client: "Free Premium Beer", title: "Nowa etykieta, nowa jakość", category: "Etykieta piwa premium", description: "Projekt etykiety oparty na nowoczesnej estetyce, mocnym kontraście i czytelnej hierarchii informacji.", tags: ["#LabelDesign", "#PackagingDesign", "#BeerDesign"], image: PACKAGING_IMG, gallery: [PACKAGING_IMG, PORTFOLIO_SHOWCASE, BRANDING_IMG] },
  { client: "Bean to Bite", title: "Elegancja z nutą natury", category: "Materiały marki spożywczej", description: "Spójny zestaw materiałów promocyjnych pod markę premium: wizytówki, gift cardy i drukowane dodatki.", tags: ["#Branding", "#PrintDesign"], image: PORTFOLIO_SHOWCASE },
  { client: "Royal Customs", title: "Wizytówki dla królewskiej marki", category: "Materiały drukowane", description: "Projekt wizytówek budujący prestiż marki i mocny, elegancki charakter komunikacji.", tags: ["#BusinessCard", "#Branding"], image: BRANDING_IMG },
  { client: "ChunkServe.pl", title: "Post reklamowy hostingu", category: "Grafika reklamowa", description: "Kreacja promocyjna dopasowana do branży gamingowej, z czytelną ofertą i wyrazistym klimatem.", tags: ["#SocialMedia", "#Gaming"], image: SERVICES_BG },
  { client: "Wul-Kam", title: "Wizytówki dla wulkanizatora", category: "Identyfikacja lokalnej firmy", description: "Projekt materiałów reklamowych dla serwisu opon z naciskiem na czytelność, konkret i zawodowy wygląd.", tags: ["#Print", "#Identyfikacja"], image: "/portfolio5.jpg" },
  { client: "Phoenix", title: "Billboard z charakterem", category: "Outdoor i reklama", description: "Mocna, oszczędna kompozycja billboardu dla marki automotive, zaprojektowana pod szybki odbiór w ruchu.", tags: ["#Outdoor", "#Automotive"], image: "/portfolio6.jpg" },
  { client: "Studio Aurora", title: "Identyfikacja dla marki beauty", category: "Branding", description: "Placeholder pod rozbudowaną identyfikację wizualną marki beauty z naciskiem na elegancję i spójność.", tags: ["#Branding", "#Beauty"], image: PORTFOLIO_SHOWCASE },
  { client: "Mondo Pasta", title: "Menu i materiały restauracyjne", category: "Materiały drukowane", description: "Placeholder pod projekt menu, voucherów i dodatkowych materiałów dla lokalu gastronomicznego.", tags: ["#MenuDesign", "#Print"], image: BRANDING_IMG },
  { client: "Nord Craft", title: "Seria etykiet produktowych", category: "Etykiety", description: "Placeholder pod linię etykiet dla produktów premium z wyraźnym systemem kolorów i typografii.", tags: ["#Labels", "#Packaging"], image: PACKAGING_IMG },
  { client: "Blackline Auto", title: "Key visual kampanii", category: "Grafika reklamowa", description: "Placeholder pod kreację reklamową do kampanii online i outdoor dla marki z branży motoryzacyjnej.", tags: ["#Campaign", "#Advertising"], image: SERVICES_BG },
  { client: "Atelier Form", title: "Logo i materiały startowe", category: "Logo", description: "Placeholder pod projekt logo oraz podstawowego zestawu materiałów dla nowej marki usługowej.", tags: ["#LogoDesign", "#Identity"], image: "/portfolio5.jpg" },
  { client: "Vero Casa", title: "Katalog kolekcji premium", category: "Katalog", description: "Placeholder pod elegancki katalog produktowy z naciskiem na układ, zdjęcia i premium feel marki.", tags: ["#Catalog", "#Layout"], image: "/portfolio6.jpg" },
];
content.pl.deliverables = [
  { title: "Logo i identyfikacja", items: ["logo", "logotyp", "księga znaku", "kolorystyka marki"] },
  { title: "Druk i materiały firmowe", items: ["wizytówki", "ulotki", "katalogi", "vouchery"] },
  { title: "Etykiety i opakowania", items: ["etykiety produktowe", "opakowania", "makiety", "materiały premium"] },
  { title: "Grafika reklamowa", items: ["posty social media", "banery", "grafiki promocyjne", "materiały kampanii"] },
];
content.pl.reviewBadges = [
  { icon: Award, label: "100% Rekomendacji" },
  { icon: Users, label: "300+ Zadowolonych klientów" },
  { icon: Sparkles, label: "Dopracowane projekty" },
  { icon: Users, label: "Współpraca 1:1" },
  { icon: Layers, label: "Jakość bez przypadkowości" },
  { icon: Star, label: "5/5 Ocena" },
];
content.pl.reviews = [
  { name: "Ewelina Konieczna", rating: 5, text: "Świetna współpraca od początku do końca. Projekt był dopracowany, spójny i dokładnie trafiał w klimat marki.", project: "Bean to Bite", initials: "EK" },
  { name: "Klient Free Premium Beer", rating: 5, text: "Etykieta wyróżnia produkt na półce i serio robi efekt premium. Dokładnie tego oczekiwałem.", project: "Free Premium Beer", initials: "FP" },
  { name: "ChunkServe.pl", rating: 5, text: "Grafiki dostarczone na czas, bez chaosu i z dobrym wyczuciem stylu. Bardzo konkretna współpraca.", project: "Grafika reklamowa", initials: "CS" },
  { name: "Klient Royal Customs", rating: 5, text: "Logo i materiały wizualne oddają charakter marki i wyglądają profesjonalnie w każdym użyciu.", project: "Royal Customs", initials: "RC" },
];
content.pl.faqs = [
  { question: "Jak długo trwa realizacja projektu?", answer: "To zależy od zakresu, ale mniejsze projekty zwykle zamykają się w kilku dniach, a większe potrzebują trochę więcej czasu." },
  { question: "Czy mogę zgłosić poprawki?", answer: "Tak. Projekt dopracowujemy wspólnie, żeby finalny efekt naprawdę pasował do marki i celu." },
  { question: "Jakie pliki dostaję na koniec?", answer: "Gotowe pliki pod druk i internet, w zależności od projektu: JPG, PNG, PDF i pliki źródłowe jeśli są potrzebne." },
  { question: "Czy działasz tylko lokalnie?", answer: "Nie. Współpracuję z klientami lokalnie i zdalnie, więc miejsce nie jest żadnym problemem." },
];
content.pl.contact.items = [
  { icon: Phone, label: "Telefon", value: "+48 796 106 675", href: "tel:+48796106675" },
  { icon: Mail, label: "E-mail", value: "kontakt@dativedesign.com", href: "mailto:kontakt@dativedesign.com" },
  { icon: MapPin, label: "Lokalizacja", value: "Rzeszów, Kolbuszowa i okolice" },
  { icon: Instagram, label: "Instagram", value: "@dative_design", href: "https://instagram.com/dative_design" },
  { icon: Facebook, label: "Facebook", value: "DatiVe Design", href: "https://facebook.com/DativeDesign" },
  { icon: Linkedin, label: "LinkedIn", value: "Damian Wilk", href: "https://www.linkedin.com/in/damian-wilk-456362271/" },
];

content.en = {
  pageTitle: "DatiVe Design | Graphic design, logos, labels and branding",
  pageDescription: "DatiVe Design creates logos, branding, labels, packaging and advertising graphics for businesses in Poland and beyond.",
  ogTitle: "DatiVe Design | Graphic design for brands",
  ogDescription: "Logo design, branding, labels, packaging and promotional graphics created with strong visual direction and brand consistency.",
  navItems: [["#about", "About"], ["#services", "Services"], ["#portfolio", "Portfolio"], ["#reviews", "Reviews"], ["#contact", "Contact"]],
  navCta: "Contact me",
  switchLabel: "Switch language",
  hero: { eyebrow: "◆ Graphic Designer - Rzeszow / Kolbuszowa", titleTop: "FROM IDEA", titleBottom: "TO EXECUTION", description: "Professional graphic design services for your business. I create visual identities, labels, print materials and advertising graphics that make your brand stand out.", primaryCta: "View portfolio", secondaryCta: "Let's talk", highlights: ["PROFESSIONALISM", "EXPERIENCE", "INNOVATION"], scroll: "Scroll" },
  marqueeItems: ["branding", "logo", "labels", "business cards", "packaging", "social media", "print materials", "advertising design", "rebranding"],
  about: { eyebrow: "Our Story", titleTop: "GRAPHIC", titleMiddle: "DESIGNER", titleBottom: "WITH PASSION", paragraphs: ["DatiVe Design is a graphic design studio based in Rzeszow and Kolbuszowa. I create professional visual materials for brands that want to stand out and build a strong, recognizable presence.", "Every project is approached individually. I listen carefully, analyze what the brand really needs and design solutions that are not only visually strong, but genuinely effective. From concept to final delivery."], badges: ["Always available", "100% recommendations", "12 reviews"], stats: [{ value: "100%", label: "Client referrals", sublabel: "based on reviews" }, { value: "100+", label: "Followers", sublabel: "steadily growing audience" }, { value: "Various", label: "Industries", sublabel: "diverse projects" }, { icon: Users, label: "Direct contact", sublabel: "you talk directly with me" }] },
  strengthsEyebrow: "Why me",
  strengths: [{ icon: Award, title: "Professional approach", description: "Every project starts with a clear goal, a strong composition and a visual direction that actually supports the brand." }, { icon: Users, title: "Direct communication", description: "You work directly with me, so feedback stays clear and decisions move faster." }, { icon: Sparkles, title: "Refined details", description: "I pay close attention to typography, color, proportions and final files so the design performs well in real use." }],
  servicesSection: { eyebrow: "What I do", title: "Graphic", accent: "services", description: "From logos to print-ready and campaign-ready materials. Everything is designed to feel coherent, polished and useful." },
  services: [
    { icon: Palette, title: "Branding and visual identity", subtitle: "A consistent brand image", description: "I design visual identities that look professional, build trust and make your brand easier to remember.", tags: ["Logo", "Colors", "Typography", "Brandbook"] },
    { icon: Package, title: "Labels and packaging", subtitle: "Designed for shelf impact", description: "I create labels and packaging that catch attention, stay readable and communicate the product's character.", tags: ["Label design", "Packaging", "DTP", "Mockups"] },
    { icon: FileText, title: "Printed materials", subtitle: "Print that works", description: "Business cards, flyers, vouchers and catalogs designed not only to look good, but also to work well in print.", tags: ["Business cards", "Flyers", "Vouchers", "Catalogs"] },
    { icon: Megaphone, title: "Advertising graphics", subtitle: "Campaigns and social media", description: "I design promo graphics for social media, ads and banners that stay on-brand and communicate clearly.", tags: ["Posts", "Banners", "Ads", "Promotions"] },
    { icon: Layers, title: "Logo design", subtitle: "A mark with character", description: "I create logos suited to the industry and brand style, with strong proportions, versions and real usability.", tags: ["Symbol", "Wordmark", "Versions", "Final files"] },
    { icon: Pen, title: "Visual consulting", subtitle: "Clear direction for your brand", description: "If you are not sure where to start, I can help define the right visual direction and build a clearer brand communication strategy.", tags: ["Consulting", "Audit", "Rebranding", "Strategy"] },
  ],
  audience: { eyebrow: "Who it's for", titleTop: "I design for brands", titleBottom: "that want to stand out", description: "Whether you need a logo, labels, promotional graphics or a broader visual refresh, the result should feel coherent, distinctive and ready to use.", industries: ["Local and service brands", "Food and premium products", "Social media and campaigns", "Automotive and technical industries"] },
  processEyebrow: "How we work",
  processSteps: [
    { title: "1. Brief and conversation", description: "We define what you need, what your brand style is and what the final design should achieve." },
    { title: "2. Design concept", description: "I prepare a visual direction, layout and solutions tailored to your industry." },
    { title: "3. Revisions and polish", description: "We refine the design until it is coherent, clear and ready for real use." },
    { title: "4. Final files", description: "You get final materials ready for print, online use or further implementation." },
  ],
  portfolio: { eyebrow: "Selected work", titleTop: "Selected", titleBottom: "projects", sideText: "Every project is a unique brand story told through shapes, colors and typography.", more: "See more on Facebook" },
  projects: [
    { client: "Free Premium Beer", title: "New label, new quality", category: "Premium beer label", description: "A label design built on modern aesthetics, strong contrast and a clear information hierarchy.", tags: ["#LabelDesign", "#PackagingDesign", "#BeerDesign"], image: PACKAGING_IMG, gallery: [PACKAGING_IMG, PORTFOLIO_SHOWCASE, BRANDING_IMG] },
    { client: "Bean to Bite", title: "Elegance with a touch of nature", category: "Food brand materials", description: "A coherent set of premium promotional materials: business cards, gift cards and printed extras.", tags: ["#Branding", "#PrintDesign"], image: PORTFOLIO_SHOWCASE },
    { client: "Royal Customs", title: "Business cards for a royal brand", category: "Printed materials", description: "A business card design built to communicate prestige and a strong elegant brand character.", tags: ["#BusinessCard", "#Branding"], image: BRANDING_IMG },
    { client: "ChunkServe.pl", title: "Hosting ad post", category: "Advertising graphic", description: "A promo piece tailored to the gaming industry, with a clear offer and strong visual vibe.", tags: ["#SocialMedia", "#Gaming"], image: SERVICES_BG },
    { client: "Wul-Kam", title: "Business cards for a tire service", category: "Local business identity", description: "Promotional materials for a tire service focused on clarity, directness and a professional image.", tags: ["#Print", "#Identity"], image: "/portfolio5.jpg" },
    { client: "Phoenix", title: "A billboard with character", category: "Outdoor advertising", description: "A bold, restrained billboard composition for an automotive brand, designed for fast recognition in motion.", tags: ["#Outdoor", "#Automotive"], image: "/portfolio6.jpg" },
    { client: "Studio Aurora", title: "Visual identity for a beauty brand", category: "Branding", description: "A placeholder for a refined beauty brand identity focused on elegance, clarity and a premium visual feel.", tags: ["#Branding", "#Beauty"], image: PORTFOLIO_SHOWCASE },
    { client: "Mondo Pasta", title: "Menu and restaurant materials", category: "Printed materials", description: "A placeholder for menu design, vouchers and supporting print materials for a hospitality brand.", tags: ["#MenuDesign", "#Print"], image: BRANDING_IMG },
    { client: "Nord Craft", title: "Product label series", category: "Labels", description: "A placeholder for a premium label system built around consistent typography and strong color coding.", tags: ["#Labels", "#Packaging"], image: PACKAGING_IMG },
    { client: "Blackline Auto", title: "Campaign key visual", category: "Advertising graphic", description: "A placeholder for a campaign visual direction prepared for digital ads and outdoor placement.", tags: ["#Campaign", "#Advertising"], image: SERVICES_BG },
    { client: "Atelier Form", title: "Logo and starter materials", category: "Logo", description: "A placeholder for a logo project and core launch materials for a service-based brand.", tags: ["#LogoDesign", "#Identity"], image: "/portfolio5.jpg" },
    { client: "Vero Casa", title: "Premium collection catalog", category: "Catalog", description: "A placeholder for an elegant product catalog focused on layout, imagery and premium presentation.", tags: ["#Catalog", "#Layout"], image: "/portfolio6.jpg" },
  ],
  deliverablesSection: { eyebrow: "Scope of work", titleTop: "What can I", titleBottom: "design for you?", description: "If you need a coherent brand image or individual promotional materials, I can handle everything from logo work to ready-to-use print and digital files.", primaryCta: "Ask about a project", secondaryCta: "See services" },
  deliverables: [
    { title: "Logo and identity", items: ["logo", "wordmark", "brand guidelines", "brand colors"] },
    { title: "Print and business materials", items: ["business cards", "flyers", "catalogs", "vouchers"] },
    { title: "Labels and packaging", items: ["product labels", "packaging", "mockups", "premium materials"] },
    { title: "Advertising graphics", items: ["social media posts", "banners", "promo graphics", "campaign assets"] },
  ],
  quickCta: { eyebrow: "Quick contact", title: "Have an idea, a brand or a product?", description: "Send me a message and we will turn it into a strong visual direction that looks professional and actually does its job.", primaryCta: "Contact me" },
  reviewsSection: { eyebrow: "Client reviews", title: "100% RECOMMENDATIONS", badgeText: "5/5 from clients" },
  reviewBadges: [{ icon: Award, label: "100% Recommendations" }, { icon: Users, label: "300+ Happy clients" }, { icon: Sparkles, label: "Refined projects" }, { icon: Users, label: "1:1 cooperation" }, { icon: Layers, label: "Quality by design" }, { icon: Star, label: "5/5 Rating" }],
  reviews: [
    { name: "Ewelina Konieczna", rating: 5, text: "Great cooperation from start to finish. The project was polished, coherent and matched the brand perfectly.", project: "Bean to Bite", initials: "EK" },
    { name: "Free Premium Beer client", rating: 5, text: "The label stands out on the shelf and truly delivers a premium effect. Exactly what I expected.", project: "Free Premium Beer", initials: "FP" },
    { name: "ChunkServe.pl", rating: 5, text: "Graphics delivered on time, with no chaos and a strong sense of style. A very solid collaboration.", project: "Advertising design", initials: "CS" },
    { name: "Royal Customs client", rating: 5, text: "The logo and visual materials reflect the brand perfectly and look professional in every use case.", project: "Royal Customs", initials: "RC" },
  ],
  faqSection: { eyebrow: "FAQ", titleTop: "Frequently asked", titleBottom: "questions" },
  faqs: [
    { question: "How long does a project take?", answer: "It depends on the scope, but smaller projects usually take a few days while bigger ones need a bit more time." },
    { question: "Can I request revisions?", answer: "Yes. We refine the project together so the final result truly fits the brand and the goal." },
    { question: "What files do I receive?", answer: "Final files for print and digital use, depending on the project: JPG, PNG, PDF and source files if needed." },
    { question: "Do you work only locally?", answer: "No. I work with clients both locally and remotely, so location is not a problem." },
  ],
  contact: { eyebrow: "Contact", titleTop: "GET IN", titleBottom: "TOUCH", description: "Want your brand to stand out? Have a project in mind? Send me a message and let's create something that feels distinctive and well-crafted.", items: [{ icon: Phone, label: "Phone", value: "+48 796 106 675", href: "tel:+48796106675" }, { icon: Mail, label: "E-mail", value: "kontakt@dativedesign.com", href: "mailto:kontakt@dativedesign.com" }, { icon: MapPin, label: "Location", value: "Rzeszow, Kolbuszowa and nearby" }, { icon: Instagram, label: "Instagram", value: "@dative_design", href: "https://instagram.com/dative_design" }, { icon: Facebook, label: "Facebook", value: "DatiVe Design", href: "https://facebook.com/DativeDesign" }, { icon: Linkedin, label: "LinkedIn", value: "Damian Wilk", href: "https://www.linkedin.com/in/damian-wilk-456362271/" }], form: { nameLabel: "Full name", emailLabel: "E-mail address", messageLabel: "Tell me what you need", messagePlaceholder: "For example: I need a logo and a complete set of materials for a new brand...", submit: "Send message", submitting: "Sending...", direct: "You can also write directly: kontakt@dativedesign.com", successTitle: "Message sent", successText: "Thanks. I will get back to you as soon as possible.", errors: { fillAll: "Please fill in all fields.", sendFailed: "The message could not be sent. Please try again." }, toast: { sent: "Message sent.", sentDesc: "I will get back to you as soon as I can." } } },
  modalCta: "Order a similar project",
  mobileContact: "Contact",
  footer: "© 2025 DatiVe Design - Professional Graphic Design Services for Your Business",
};

function setMetaContent(selector: string, contentValue: string) {
  const element = document.querySelector<HTMLMetaElement>(selector);
  if (element) {
    element.setAttribute("content", contentValue);
  }
}

function AnimatedSection({ children, className = "" }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  return <motion.div ref={ref} variants={stagger} initial="hidden" animate={isInView ? "visible" : "hidden"} className={className}>{children}</motion.div>;
}

function AmbientBackdrop({ className = "", align = "center" }: { className?: string; align?: "left" | "center" | "right" }) {
  const alignClass = align === "left" ? "bg-gradient-to-r from-gold/8 via-transparent to-transparent" : align === "right" ? "bg-gradient-to-l from-gold/8 via-transparent to-transparent" : "bg-gradient-to-b from-gold/8 via-transparent to-transparent";
  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
      <div className={`absolute inset-0 ${alignClass}`} />
      <div className="section-grid absolute inset-0 opacity-45" />
      <div className="noise-overlay absolute inset-0" />
      <motion.div aria-hidden="true" className="ambient-orb ambient-orb-gold left-[10%] top-12 h-44 w-44" animate={{ x: [0, 18, -8, 0], y: [0, -12, 8, 0], scale: [1, 1.08, 0.96, 1] }} transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }} />
      <motion.div aria-hidden="true" className="ambient-orb ambient-orb-soft bottom-10 right-[12%] h-40 w-40" animate={{ x: [0, -12, 10, 0], y: [0, 16, -6, 0], scale: [1, 0.94, 1.06, 1] }} transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }} />
    </div>
  );
}

function Navbar({
  language,
  onLanguageChange,
  navItems,
  ctaLabel,
  switchLabel,
}: {
  language: Language;
  onLanguageChange: (language: Language) => void;
  navItems: readonly [string, string][];
  ctaLabel: string;
  switchLabel: string;
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="fixed inset-x-0 top-0 z-50 border-b border-white/5 bg-background/80 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between">
        <a href="#hero" className="flex items-center" aria-label="Go to top">
          <img src="/logo.png" alt="DatiVe Design" className="h-10 w-auto" />
        </a>

        <div className="hidden items-center gap-8 md:flex">
          {navItems.map(([href, label]) => (
            <a key={href} href={href} className="font-display text-sm font-medium uppercase tracking-wider text-white/70 transition-colors hover:text-gold">
              {label}
            </a>
          ))}
        </div>

        <div className="hidden items-center gap-4 md:flex">
          <div className="flex items-center gap-2" aria-label={switchLabel}>
            <span className="sr-only">{switchLabel}</span>
            {(["pl", "en"] as Language[]).map((code) => (
              <button
                key={code}
                type="button"
                onClick={() => onLanguageChange(code)}
                className={`rounded-sm border px-2.5 py-1 text-xs font-bold uppercase tracking-widest transition-colors ${
                  language === code ? "border-gold/60 bg-gold/10 text-gold" : "border-white/10 text-white/50 hover:border-gold/30 hover:text-gold"
                }`}
                aria-pressed={language === code}
              >
                {code}
              </button>
            ))}
          </div>

          <motion.a href="#contact" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="gold-button-shimmer inline-flex items-center gap-2 rounded-sm px-6 py-2.5 text-sm font-black uppercase tracking-wider text-background transition-all">
            <Sparkles size={15} />
            {ctaLabel}
          </motion.a>
        </div>

        <button type="button" className="text-white/70 transition-colors hover:text-gold md:hidden" aria-expanded={menuOpen} aria-label={menuOpen ? "Close menu" : "Open menu"} onClick={() => setMenuOpen((open) => !open)}>
          <div className="flex w-6 flex-col gap-1.5">
            <span className={`block h-0.5 bg-current transition-all ${menuOpen ? "translate-y-2 rotate-45" : ""}`} />
            <span className={`block h-0.5 bg-current transition-all ${menuOpen ? "opacity-0" : ""}`} />
            <span className={`block h-0.5 bg-current transition-all ${menuOpen ? "-translate-y-2 -rotate-45" : ""}`} />
          </div>
        </button>
      </div>

      {menuOpen && (
        <div className="border-t border-white/5 bg-card py-4 md:hidden">
          <div className="container flex flex-col gap-4">
            <div className="flex gap-2">
              {(["pl", "en"] as Language[]).map((code) => (
                <button key={code} type="button" onClick={() => onLanguageChange(code)} className={`rounded-sm border px-2.5 py-1 text-xs font-bold uppercase tracking-widest transition-colors ${language === code ? "border-gold/60 bg-gold/10 text-gold" : "border-white/10 text-white/50 hover:border-gold/30 hover:text-gold"}`} aria-pressed={language === code}>
                  {code}
                </button>
              ))}
            </div>
            {navItems.map(([href, label]) => (
              <a key={href} href={href} onClick={() => setMenuOpen(false)} className="font-display text-sm font-bold uppercase tracking-wider text-white/70 transition-colors hover:text-gold">
                {label}
              </a>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}

function Hero({ copy }: { copy: PageCopy }) {
  const heroRef = useRef<HTMLElement | null>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const imageY = useTransform(scrollYProgress, [0, 1], ["0%", "14%"]);
  const imageScale = useTransform(scrollYProgress, [0, 1], [1, 1.12]);
  const glowY = useTransform(scrollYProgress, [0, 1], ["0%", "-12%"]);

  return (
    <section ref={heroRef} id="hero" className="relative flex min-h-screen items-center justify-center overflow-hidden">
      <div className="absolute inset-0">
        <motion.img src={HERO_BG} alt="" style={{ y: imageY, scale: imageScale }} className="h-full w-full object-cover opacity-45" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/35 to-background" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-background/30 to-background/55" />
        <motion.div style={{ y: glowY }} className="ambient-orb ambient-orb-gold left-[8%] top-[18%] h-64 w-64 opacity-80" />
        <motion.div style={{ y: glowY }} className="ambient-orb ambient-orb-soft bottom-[12%] right-[8%] h-72 w-72 opacity-70" />
        <div className="section-grid absolute inset-0 opacity-40" />
        <div className="noise-overlay absolute inset-0" />
      </div>

      <div className="relative container pb-20 pt-32 md:pb-24 md:pt-36">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="section-label mb-6">
          {copy.hero.eyebrow}
        </motion.div>
        <motion.h1 initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.1 }} className="font-display mb-8 max-w-5xl text-6xl font-black leading-[0.94] sm:text-7xl lg:text-[6.25rem] xl:text-[7.25rem]">
          <span className="block text-white">{copy.hero.titleTop}</span>
          <span className="gold-shimmer block">{copy.hero.titleBottom}</span>
        </motion.h1>
        <motion.p initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.3 }} className="mb-12 max-w-3xl text-xl leading-relaxed text-white/75 md:text-2xl">
          {copy.hero.description}
        </motion.p>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.5 }} className="mb-14 flex flex-wrap gap-4">
          <a href="#portfolio" className="inline-flex items-center gap-2 rounded-sm bg-gold px-10 py-4 text-sm font-bold uppercase tracking-wider text-background transition-all hover:bg-gold-light hover:shadow-lg hover:shadow-gold/20 md:text-base">
            <Sparkles size={18} />
            {copy.hero.primaryCta}
          </a>
          <a href="#contact" className="inline-flex items-center gap-2 rounded-sm border border-gold/30 px-10 py-4 text-sm font-bold uppercase tracking-wider text-gold transition-all hover:bg-gold/10 md:text-base">
            {copy.hero.secondaryCta}
          </a>
        </motion.div>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.7 }} className="flex flex-wrap gap-7">
          {copy.hero.highlights.map((item) => (
            <div key={item} className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-gold" />
              <span className="font-display text-sm font-bold uppercase tracking-widest text-white/55">{item}</span>
            </div>
          ))}
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }} className="absolute bottom-8 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2 text-white/30">
        <span className="font-display text-xs uppercase tracking-widest">{copy.hero.scroll}</span>
        <motion.div animate={{ y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}>
          <ChevronDown size={20} />
        </motion.div>
      </motion.div>
    </section>
  );
}

function Services({ copy }: { copy: PageCopy }) {
  const [activeService, setActiveService] = useState(0);
  return (
    <section id="services" className="relative overflow-hidden py-24 md:py-32">
      <div className="absolute inset-0">
        <img src={SERVICES_BG} alt="" className="h-full w-full object-cover opacity-10" />
        <div className="absolute inset-0 bg-background/90" />
        <div className="section-grid absolute inset-0 opacity-35" />
        <div className="noise-overlay absolute inset-0" />
      </div>
      <div className="relative container">
        <AnimatedSection className="mb-16 text-center">
          <motion.div variants={fadeUp} className="section-label mb-4">{copy.servicesSection.eyebrow}</motion.div>
          <motion.h2 variants={fadeUp} className="font-display mb-4 text-5xl font-black text-white md:text-6xl">{copy.servicesSection.title} <span className="text-gold">{copy.servicesSection.accent}</span></motion.h2>
          <motion.p variants={fadeUp} className="mx-auto max-w-2xl text-white/55">{copy.servicesSection.description}</motion.p>
        </AnimatedSection>
        <div className="grid gap-6 lg:grid-cols-3">
          {copy.services.map((service, index) => {
            const Icon = service.icon;
            const isActive = activeService === index;
            return (
              <AnimatedSection key={service.title}>
                <motion.button type="button" variants={fadeUp} onClick={() => setActiveService(index)} className={`group card-hover h-full w-full rounded-sm border p-6 text-left transition-all duration-300 ${isActive ? "border-gold/50 bg-gold/5" : "gold-border-hover border-white/5 bg-card"}`}>
                  <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-sm transition-colors ${isActive ? "bg-gold text-background" : "bg-white/5 text-gold"}`}><Icon size={22} /></div>
                  <div className="section-label mb-2">{service.subtitle}</div>
                  <h3 className="font-display mb-3 text-xl font-bold text-white">{service.title}</h3>
                  <p className="mb-4 text-sm leading-relaxed text-white/65">{service.description}</p>
                  <div className="flex flex-wrap gap-2">{service.tags.map((tag) => <span key={tag} className="rounded-sm bg-white/5 px-2 py-0.5 font-display text-xs tracking-wider text-white/45">{tag}</span>)}</div>
                </motion.button>
              </AnimatedSection>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function Contact({ copy }: { copy: PageCopy }) {
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const form = copy.contact.form;

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      toast.error(form.errors.fillAll);
      return;
    }
    setIsSubmitting(true);
    try {
      const response = await fetch("https://api.web3forms.com/submit", { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify({ access_key: "447b562f-6ef2-4c83-bf42-36a6655fa08f", subject: "DatiVe Design contact form", from_name: "DatiVe Design", name: formData.name, email: formData.email, message: formData.message }) });
      const result = await response.json();
      if (!result.success) throw new Error("send failed");
      setFormSubmitted(true);
      setFormData({ name: "", email: "", message: "" });
      toast.success(form.toast.sent, { description: form.toast.sentDesc });
    } catch {
      toast.error(form.errors.sendFailed);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="py-24 md:py-32">
      <div className="container">
        <div className="grid items-start gap-16 lg:grid-cols-2">
          <AnimatedSection>
            <motion.div variants={fadeUp} className="section-label mb-4">{copy.contact.eyebrow}</motion.div>
            <motion.h2 variants={fadeUp} className="font-display mb-6 text-5xl font-black text-white md:text-6xl">{copy.contact.titleTop}<br /><span className="text-gold">{copy.contact.titleBottom}</span></motion.h2>
            <motion.div variants={fadeUp} className="gold-line mb-8 w-24" />
            <motion.p variants={fadeUp} className="mb-10 max-w-xl leading-relaxed text-white/65">{copy.contact.description}</motion.p>
            <motion.div variants={stagger} className="grid gap-x-16 gap-y-6 sm:grid-flow-col sm:grid-rows-3 sm:w-fit">
              {copy.contact.items.map(({ icon: Icon, label, value, href }) => (
                <motion.div key={label} variants={fadeUp} className="flex items-center gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-sm border border-gold/20 bg-gold/10"><Icon size={16} className="text-gold" /></div>
                  <div>
                    <div className="mb-0.5 font-display text-xs uppercase tracking-wider text-white/30">{label}</div>
                    {href ? <a href={href} target={href.startsWith("http") ? "_blank" : undefined} rel={href.startsWith("http") ? "noopener noreferrer" : undefined} className="text-sm text-white/80 transition-colors hover:text-gold">{value}</a> : <span className="text-sm text-white/80">{value}</span>}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </AnimatedSection>
          <AnimatedSection>
            <motion.div variants={fadeUp} className="rounded-sm border border-white/5 bg-card p-8">
              {formSubmitted ? <div className="py-12 text-center"><CheckCircle size={48} className="mx-auto mb-4 text-gold" /><h3 className="font-display mb-2 text-2xl font-bold text-white">{form.successTitle}</h3><p className="text-white/55">{form.successText}</p></div> : <form onSubmit={handleSubmit} className="space-y-5"><div><label htmlFor="contact-name" className="mb-2 block font-display text-xs font-bold uppercase tracking-wider text-white/40">{form.nameLabel}</label><Input id="contact-name" name="name" required value={formData.name} onChange={(event) => setFormData({ ...formData, name: event.target.value })} placeholder="Jan Kowalski" className="rounded-sm border-white/10 bg-background text-white placeholder:text-white/20 focus:border-gold/50" /></div><div><label htmlFor="contact-email" className="mb-2 block font-display text-xs font-bold uppercase tracking-wider text-white/40">{form.emailLabel}</label><Input id="contact-email" name="email" type="email" required value={formData.email} onChange={(event) => setFormData({ ...formData, email: event.target.value })} placeholder="jan@firma.pl" className="rounded-sm border-white/10 bg-background text-white placeholder:text-white/20 focus:border-gold/50" /></div><div><label htmlFor="contact-message" className="mb-2 block font-display text-xs font-bold uppercase tracking-wider text-white/40">{form.messageLabel}</label><Textarea id="contact-message" name="message" required value={formData.message} onChange={(event) => setFormData({ ...formData, message: event.target.value })} placeholder={form.messagePlaceholder} rows={5} className="resize-none rounded-sm border-white/10 bg-background text-white placeholder:text-white/20 focus:border-gold/50" /></div><Button type="submit" disabled={isSubmitting} className="flex h-12 w-full items-center gap-2 rounded-sm bg-gold font-display font-bold uppercase tracking-wider text-background hover:bg-gold-light disabled:opacity-60"><Send size={16} />{isSubmitting ? form.submitting : form.submit}</Button><p className="text-center font-display text-xs text-white/25">{form.direct}</p></form>}
            </motion.div>
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  const [language, setLanguage] = useState<Language>(() => (localStorage.getItem("language") as Language) || "pl");
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [activeImage, setActiveImage] = useState("");
  const [reactionCounts, setReactionCounts] = useState<Record<string, number>>({});
  const [likedProjects, setLikedProjects] = useState<string[]>([]);
  const copy = content[language];

  useEffect(() => {
    document.documentElement.lang = language;
    document.title = copy.pageTitle;
    setMetaContent('meta[name="description"]', copy.pageDescription);
    setMetaContent('meta[property="og:title"]', copy.ogTitle);
    setMetaContent('meta[property="og:description"]', copy.ogDescription);
    setMetaContent('meta[name="twitter:title"]', copy.ogTitle);
    setMetaContent('meta[name="twitter:description"]', copy.ogDescription);
    setMetaContent('meta[property="og:locale"]', language === "pl" ? "pl_PL" : "en_US");
    localStorage.setItem("language", language);
  }, [language, copy.pageDescription, copy.ogDescription, copy.ogTitle, copy.pageTitle]);

  useEffect(() => {
    fetch("/api/reactions").then((response) => response.json()).then((data) => setReactionCounts(data)).catch(() => {});
    setLikedProjects(JSON.parse(localStorage.getItem("likedProjects") || "[]"));
  }, []);

  useEffect(() => {
    document.body.style.overflow = selectedProject ? "hidden" : "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [selectedProject]);

  useEffect(() => {
    if (!selectedProject) return;

    const gallery = selectedProject.gallery?.length ? selectedProject.gallery : [selectedProject.image];

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSelectedProject(null);
        return;
      }

      if (gallery.length < 2) return;

      const currentIndex = Math.max(gallery.indexOf(activeImage), 0);

      if (event.key === "ArrowRight") {
        event.preventDefault();
        setActiveImage(gallery[(currentIndex + 1) % gallery.length]);
      }

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        setActiveImage(gallery[(currentIndex - 1 + gallery.length) % gallery.length]);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedProject, activeImage]);

  const handleReactionClick = async (event: MouseEvent<HTMLButtonElement>, title: string) => {
    event.stopPropagation();
    if (likedProjects.includes(title)) return;
    setReactionCounts((prev) => ({ ...prev, [title]: (prev[title] || 0) + 1 }));
    try {
      const response = await fetch(`/api/reactions/${encodeURIComponent(title)}`, { method: "POST" });
      if (!response.ok) throw new Error("save failed");
      const next = [...likedProjects, title];
      setLikedProjects(next);
      localStorage.setItem("likedProjects", JSON.stringify(next));
    } catch {
      setReactionCounts((prev) => ({ ...prev, [title]: Math.max((prev[title] || 1) - 1, 0) }));
    }
  };

  return (
    <LazyMotion features={domAnimation}>
      <div className="min-h-screen overflow-x-hidden bg-background text-foreground">
        <Navbar language={language} onLanguageChange={setLanguage} navItems={copy.navItems} ctaLabel={copy.navCta} switchLabel={copy.switchLabel} />
        <Hero copy={copy} />
        <div className="overflow-hidden border-y border-gold/20 bg-gold/10 py-4"><div className="flex animate-marquee whitespace-nowrap">{[...copy.marqueeItems, ...copy.marqueeItems].map((item, index) => <span key={`${item}-${index}`} className="inline-flex items-center gap-4 px-6 font-display text-xs font-bold uppercase tracking-widest text-gold/70">{item}<span className="text-gold/30">•</span></span>)}</div></div>
        <section id="about" className="relative py-24 md:py-32"><AmbientBackdrop align="left" /><div className="container"><div className="grid items-center gap-16 md:grid-cols-2"><AnimatedSection><motion.div variants={fadeUp} className="section-label mb-4">{copy.about.eyebrow}</motion.div><motion.h2 variants={fadeUp} className="font-display mb-6 text-5xl font-black text-white md:text-6xl">{copy.about.titleTop}<br /><span className="text-gold">{copy.about.titleMiddle}</span><br />{copy.about.titleBottom}</motion.h2><motion.div variants={fadeUp} className="gold-line mb-8 w-24" /><motion.p variants={fadeUp} className="mb-6 leading-relaxed text-white/70">{copy.about.paragraphs[0]}</motion.p><motion.p variants={fadeUp} className="mb-8 leading-relaxed text-white/70">{copy.about.paragraphs[1]}</motion.p><motion.div variants={fadeUp} className="flex flex-wrap gap-3">{copy.about.badges.map((tag) => <span key={tag} className="rounded-sm border border-gold/30 px-4 py-1.5 font-display text-xs font-bold uppercase tracking-wider text-gold">{tag}</span>)}</motion.div></AnimatedSection><AnimatedSection className="grid grid-cols-2 gap-4">{copy.about.stats.map((stat) => <motion.div key={stat.label} variants={fadeUp} className="card-hover gold-border-hover rounded-sm border border-white/5 bg-card p-6"><div className="mb-1 text-gold">{"icon" in stat && stat.icon ? <stat.icon size={34} /> : <div className="font-display text-4xl font-black">{stat.value}</div>}</div><div className="mb-1 text-sm font-bold text-white">{stat.label}</div><div className="font-display text-xs tracking-wider text-white/40">{stat.sublabel}</div></motion.div>)}</AnimatedSection></div></div></section>
        <section className="relative pb-10 md:pb-16"><AmbientBackdrop className="opacity-70" align="right" /><div className="container"><div className="grid gap-6 md:grid-cols-3">{copy.strengths.map(({ icon: Icon, title, description }) => <AnimatedSection key={title}><motion.div variants={fadeUp} className="gold-border-hover card-hover rounded-sm border border-white/5 bg-card p-6"><div className="mb-4 flex h-12 w-12 items-center justify-center rounded-sm bg-gold/10 text-gold"><Icon size={22} /></div><h3 className="font-display mb-3 text-xl font-bold text-white">{title}</h3><p className="text-sm leading-relaxed text-white/65">{description}</p></motion.div></AnimatedSection>)}</div></div></section>
        <Services copy={copy} />
        <section className="relative py-24 md:py-28"><AmbientBackdrop className="opacity-70" align="center" /><div className="container"><div className="grid gap-12 lg:grid-cols-2"><AnimatedSection><motion.div variants={fadeUp} className="section-label mb-4">{copy.audience.eyebrow}</motion.div><motion.h2 variants={fadeUp} className="font-display mb-6 text-4xl font-black leading-[1.18] text-white md:text-5xl">{copy.audience.titleTop}<br /><span className="text-gold">{copy.audience.titleBottom}</span></motion.h2><motion.p variants={fadeUp} className="mb-8 max-w-xl leading-relaxed text-white/65">{copy.audience.description}</motion.p><motion.div variants={fadeUp} className="grid gap-3 sm:grid-cols-2">{copy.audience.industries.map((item) => <div key={item} className="rounded-sm border border-gold/20 bg-gold/5 px-4 py-3 text-sm text-white/75">{item}</div>)}</motion.div></AnimatedSection><AnimatedSection><motion.div variants={fadeUp} className="section-label mb-4">{copy.processEyebrow}</motion.div><div className="space-y-4">{copy.processSteps.map((step) => <motion.div key={step.title} variants={fadeUp} className="rounded-sm border border-white/5 bg-card p-5"><h3 className="font-display mb-2 text-lg font-bold text-white">{step.title}</h3><p className="text-sm leading-relaxed text-white/65">{step.description}</p></motion.div>)}</div></AnimatedSection></div></div></section>
        <section id="portfolio" className="relative py-24 md:py-32"><AmbientBackdrop className="opacity-80" align="right" /><div className="container"><AnimatedSection className="mb-16 flex flex-col justify-between gap-8 md:flex-row md:items-center"><div><motion.div variants={fadeUp} className="section-label mb-4">{copy.portfolio.eyebrow}</motion.div><motion.h2 variants={fadeUp} className="font-display text-5xl font-black leading-none text-white md:text-6xl">{copy.portfolio.titleTop}<br /><span className="text-gold">{copy.portfolio.titleBottom}</span></motion.h2></div><motion.div variants={fadeUp} className="mt-6 max-w-md border-l-2 border-gold/30 py-2 pl-6 md:mt-0"><p className="text-sm leading-relaxed text-white/60 md:text-base">{copy.portfolio.sideText}</p></motion.div></AnimatedSection><div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">{copy.projects.map((project) => { const isLiked = likedProjects.includes(project.title); return <AnimatedSection key={project.title}><motion.div variants={fadeUp} onClick={() => { setSelectedProject(project); setActiveImage(project.gallery ? project.gallery[0] : project.image); }} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); setSelectedProject(project); setActiveImage(project.gallery ? project.gallery[0] : project.image); } }} role="button" tabIndex={0} className="group card-hover gold-border-hover relative block w-full cursor-pointer overflow-hidden rounded-sm border border-white/5 bg-card text-left"><div className="aspect-square overflow-hidden"><img src={project.image} alt={`${project.client} - ${project.title}`} className="h-full w-full object-cover opacity-70 transition-transform duration-700 group-hover:scale-105 group-hover:opacity-90" /><div className="portfolio-sheen absolute inset-0" /><div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" /></div><div className="absolute bottom-0 left-0 right-0 p-6"><div className="section-label mb-2 text-[10px]">{project.category}</div><h3 className="font-display mb-2 text-lg font-bold uppercase text-white">{project.title}</h3><div className="flex flex-wrap gap-2">{project.tags.map((tag) => <span key={tag} className="font-display text-[10px] text-gold/60">{tag}</span>)}</div></div><button type="button" onClick={(event) => handleReactionClick(event, project.title)} className={`absolute right-4 top-4 z-10 inline-flex items-center gap-1 rounded-full border px-2 py-1 font-display text-[10px] transition-colors ${isLiked ? "border-gold/60 bg-gold/15 text-gold" : "border-white/10 bg-background/80 text-white/50 hover:border-gold/50 hover:text-gold"}`} aria-pressed={isLiked}><Heart size={12} className={isLiked ? "fill-current" : ""} />{reactionCounts[project.title] ?? 0}</button></motion.div></AnimatedSection>; })}</div><AnimatedSection className="mt-12 text-center"><motion.a variants={fadeUp} href="https://www.facebook.com/DativeDesign/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-3 rounded-sm border border-gold/30 px-8 py-3 font-display text-sm font-bold uppercase tracking-wider text-gold transition-all hover:bg-gold/10"><Facebook size={16} />{copy.portfolio.more}</motion.a></AnimatedSection></div></section>
        <section className="relative py-24 md:py-28"><AmbientBackdrop className="opacity-75" align="center" /><div className="container"><div className="grid items-start gap-12 lg:grid-cols-[1.05fr_1fr]"><AnimatedSection><motion.div variants={fadeUp} className="section-label mb-4">{copy.deliverablesSection.eyebrow}</motion.div><motion.h2 variants={fadeUp} className="font-display mb-6 text-4xl font-black leading-[1.1] text-white md:text-5xl">{copy.deliverablesSection.titleTop}<br /><span className="text-gold">{copy.deliverablesSection.titleBottom}</span></motion.h2><motion.p variants={fadeUp} className="max-w-xl leading-relaxed text-white/65">{copy.deliverablesSection.description}</motion.p><motion.div variants={fadeUp} className="mt-8 flex flex-wrap gap-3"><a href="#contact" className="inline-flex items-center gap-2 rounded-sm bg-gold px-6 py-3 text-sm font-bold uppercase tracking-wider text-background transition-all hover:bg-gold-light"><Mail size={16} />{copy.deliverablesSection.primaryCta}</a><a href="#services" className="inline-flex items-center gap-2 rounded-sm border border-gold/30 px-6 py-3 text-sm font-bold uppercase tracking-wider text-gold transition-all hover:bg-gold/10"><Layers size={16} />{copy.deliverablesSection.secondaryCta}</a></motion.div></AnimatedSection><div className="grid gap-4 sm:grid-cols-2">{copy.deliverables.map((group) => <AnimatedSection key={group.title}><motion.div variants={fadeUp} className="gold-border-hover card-hover rounded-sm border border-white/5 bg-card p-5"><h3 className="font-display mb-4 text-lg font-bold text-white">{group.title}</h3><div className="space-y-2">{group.items.map((item) => <div key={item} className="flex items-center gap-2 text-sm text-white/65"><div className="h-1.5 w-1.5 rounded-full bg-gold" /><span>{item}</span></div>)}</div></motion.div></AnimatedSection>)}</div></div></div></section>
        <section className="relative pb-20 md:pb-24"><AmbientBackdrop className="opacity-60" align="left" /><div className="container"><AnimatedSection><motion.div variants={fadeUp} className="overflow-hidden rounded-sm border border-gold/20 bg-gradient-to-r from-gold/12 via-card to-card p-8 md:p-10"><div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between"><div className="max-w-2xl"><div className="section-label mb-3">{copy.quickCta.eyebrow}</div><h2 className="font-display mb-3 text-3xl font-black text-white md:text-4xl">{copy.quickCta.title}</h2><p className="text-white/65">{copy.quickCta.description}</p></div><div className="flex flex-col gap-3 sm:flex-row"><a href="#contact" className="inline-flex items-center justify-center gap-2 rounded-sm bg-gold px-6 py-3 text-sm font-bold uppercase tracking-wider text-background transition-all hover:bg-gold-light"><Sparkles size={16} />{copy.quickCta.primaryCta}</a><a href="mailto:kontakt@dativedesign.com" className="inline-flex items-center justify-center gap-2 rounded-sm border border-white/10 px-6 py-3 text-sm font-bold uppercase tracking-wider text-white transition-all hover:border-gold/30 hover:text-gold"><Mail size={16} />kontakt@dativedesign.com</a></div></div></motion.div></AnimatedSection></div></section>
        <section id="reviews" className="relative bg-card/50 py-24 md:py-32"><AmbientBackdrop className="opacity-75" align="left" /><div className="container"><AnimatedSection className="mb-16 text-center"><motion.div variants={fadeUp} className="section-label mb-4">{copy.reviewsSection.eyebrow}</motion.div><motion.h2 variants={fadeUp} className="font-display mb-4 text-5xl font-black text-white md:text-6xl">{copy.reviewsSection.title}</motion.h2><motion.div variants={fadeUp} className="mb-4 flex items-center justify-center gap-1">{[...Array(5)].map((_, index) => <Star key={index} size={20} className="fill-gold text-gold" />)}<span className="ml-2 font-display text-sm text-white/50">{copy.reviewsSection.badgeText}</span></motion.div></AnimatedSection><div className="grid gap-6 md:grid-cols-2">{copy.reviews.map((review) => <AnimatedSection key={review.name}><motion.div variants={fadeUp} className="gold-border-hover card-hover rounded-sm border border-white/5 bg-background p-6"><div className="mb-4 flex gap-1">{[...Array(review.rating)].map((_, index) => <Star key={index} size={14} className="fill-gold text-gold" />)}</div><p className="mb-6 italic leading-relaxed text-white/70">"{review.text}"</p><div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-full border border-gold/30 bg-gold/20"><span className="font-display text-xs font-bold text-gold">{review.initials}</span></div><div><div className="text-sm font-bold text-white">{review.name}</div><div className="font-display text-xs tracking-wider text-white/40">{review.project}</div></div><div className="ml-auto"><CheckCircle size={16} className="text-gold/50" /></div></div></motion.div></AnimatedSection>)}</div><AnimatedSection className="mt-12 flex flex-wrap justify-center gap-8">{copy.reviewBadges.map(({ icon: Icon, label }) => <motion.div key={label} variants={fadeUp} className="flex items-center gap-3 text-white/40"><Icon size={20} className="text-gold/60" /><span className="font-display text-sm font-bold tracking-wider">{label}</span></motion.div>)}</AnimatedSection></div></section>
        <section className="relative py-24 md:py-28"><AmbientBackdrop className="opacity-65" align="center" /><div className="container"><AnimatedSection className="mb-14 text-center"><motion.div variants={fadeUp} className="section-label mb-4">{copy.faqSection.eyebrow}</motion.div><motion.h2 variants={fadeUp} className="font-display text-4xl font-black text-white md:text-5xl">{copy.faqSection.titleTop}<span className="text-gold"> {copy.faqSection.titleBottom}</span></motion.h2></AnimatedSection><div className="grid gap-4 md:grid-cols-2">{copy.faqs.map((faq) => <AnimatedSection key={faq.question}><motion.div variants={fadeUp} className="rounded-sm border border-white/5 bg-card p-6"><h3 className="font-display mb-3 text-lg font-bold text-white">{faq.question}</h3><p className="text-sm leading-relaxed text-white/65">{faq.answer}</p></motion.div></AnimatedSection>)}</div></div></section>
        <div className="relative"><AmbientBackdrop className="opacity-70" align="right" /><Contact copy={copy} /></div>
        <footer className="border-t border-white/5 py-12"><div className="container"><div className="flex flex-col items-center justify-between gap-6 md:flex-row"><div className="flex items-center"><img src="/logo.png" alt="DatiVe Design" className="h-11 w-auto opacity-80 transition-opacity hover:opacity-100" /></div><p className="text-center font-display text-xs tracking-wider text-white/25">{copy.footer}</p><div className="flex items-center gap-4"><a href="https://instagram.com/dative_design" target="_blank" rel="noopener noreferrer" className="text-white/30 transition-colors hover:text-gold" aria-label="Instagram"><Instagram size={18} /></a><a href="https://facebook.com/DativeDesign" target="_blank" rel="noopener noreferrer" className="text-white/30 transition-colors hover:text-gold" aria-label="Facebook"><Facebook size={18} /></a><a href="mailto:kontakt@dativedesign.com" className="text-white/30 transition-colors hover:text-gold" aria-label="Mail"><Mail size={18} /></a></div></div></div></footer>
        <AnimatePresence>{selectedProject && <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 md:p-8"><motion.button type="button" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedProject(null)} className="absolute inset-0 cursor-pointer bg-background/95 backdrop-blur-md" aria-label="Close project" /><motion.div initial={{ opacity: 0, scale: 0.98, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.98, y: 20 }} role="dialog" aria-modal="true" aria-labelledby="project-modal-title" className="relative z-10 flex h-[100dvh] w-full max-w-full flex-col overflow-hidden bg-card shadow-2xl md:h-[85vh] md:flex-row md:rounded-sm md:border md:border-white/10 lg:max-w-7xl"><button type="button" onClick={() => setSelectedProject(null)} className="absolute right-3 top-3 z-20 rounded-sm border border-white/10 bg-background/80 p-2 text-white transition-all hover:bg-white/5 hover:text-gold md:right-4 md:top-4 md:bg-background/50 md:p-3" aria-label="Close project"><X size={20} className="md:h-6 md:w-6" /></button><div className="relative flex h-[40%] w-full shrink-0 flex-col border-b border-white/5 bg-black/40 md:h-full md:w-[60%] md:border-b-0 md:border-r"><div className="relative flex-1 overflow-hidden"><motion.img key={activeImage} initial={{ opacity: 0, filter: "blur(4px)" }} animate={{ opacity: 1, filter: "blur(0px)" }} transition={{ duration: 0.4 }} src={activeImage} alt={selectedProject.title} className="absolute inset-0 h-full w-full object-contain p-2 md:p-12" /></div>{selectedProject.gallery && selectedProject.gallery.length > 1 && <div className="flex overflow-x-auto border-t border-white/5 bg-card/80 p-3 backdrop-blur-md md:gap-4 md:p-6">{selectedProject.gallery.map((image, index) => <button key={image} type="button" onClick={() => setActiveImage(image)} className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-sm transition-all duration-300 md:h-28 md:w-28 ${activeImage === image ? "scale-95 ring-2 ring-gold opacity-100" : "opacity-40 hover:opacity-100"}`} aria-label={`Preview ${index + 1}`}><img src={image} alt="" className="h-full w-full object-cover" /></button>)}</div>}</div><div className="flex h-[60%] w-full flex-col overflow-y-auto bg-card p-6 md:h-full md:w-[40%] md:p-14"><div className="section-label mb-2 text-xs md:mb-4 md:text-sm">{selectedProject.category}</div><h3 id="project-modal-title" className="font-display mb-4 text-2xl font-black uppercase leading-tight text-white md:mb-8 md:text-5xl">{selectedProject.title}</h3><div className="gold-line mb-6 w-16 shrink-0 md:mb-8 md:w-24" /><p className="mb-8 text-sm leading-relaxed text-white/70 md:mb-12 md:text-lg">{selectedProject.description}</p><div className="mt-auto"><div className="mb-3 font-display text-xs font-bold uppercase tracking-wider text-white/40 md:mb-4 md:text-sm">Tags</div><div className="flex flex-wrap gap-2 md:gap-3">{selectedProject.tags.map((tag) => <span key={tag} className="rounded-sm border border-white/5 bg-white/5 px-3 py-1.5 font-display text-xs tracking-wider text-gold/80 md:px-4 md:py-2 md:text-sm">{tag}</span>)}</div></div><div className="mt-8 shrink-0 border-t border-white/10 pt-6 md:mt-10 md:pt-8"><a href="#contact" onClick={(event) => { event.preventDefault(); setSelectedProject(null); setTimeout(() => document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" }), 300); }} className="group inline-flex w-full items-center justify-center gap-2 rounded-sm bg-gold px-4 py-3 text-xs font-black uppercase tracking-widest text-background transition-all hover:bg-gold-light hover:shadow-[0_0_20px_rgba(212,175,55,0.3)] md:gap-3 md:px-8 md:py-4 md:text-sm"><Sparkles size={16} className="transition-transform group-hover:scale-125" />{copy.modalCta}</a></div></div></motion.div></div>}</AnimatePresence>
        <a href="#contact" className="fixed bottom-4 right-4 z-40 inline-flex items-center gap-2 rounded-full bg-gold px-4 py-3 text-xs font-bold uppercase tracking-wider text-background shadow-[0_10px_30px_rgba(212,175,55,0.25)] md:hidden"><Mail size={16} />{copy.mobileContact}</a>
      </div>
    </LazyMotion>
  );
}
