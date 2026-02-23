/* ============================================================
   DatiVe Design — Home Page
   Design: Dark Luxury — deep near-black bg, warm gold accents
   Sections: Navbar, Hero, Brand Story, Services, Portfolio, Social Proof, Contact, Footer
   ============================================================ */

import { useState, useEffect, useRef } from "react";
import { motion, useInView } from "framer-motion";
import {
  Palette, Package, FileText, Megaphone, Star, Award, Users, Mail,
  Phone, MapPin, Instagram, Facebook, ChevronDown, Send, CheckCircle,
  Layers, Pen, Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

// ─── Image URLs ────────────────────────────────────────────────────────────────
const HERO_BG = "https://private-us-east-1.manuscdn.com/sessionFile/k8tcCXw2SA4PyDeVSCiGNC/sandbox/2etJmC9WVxYsQihISnQTmu-img-1_1771854125000_na1fn_ZGF0aXZlLWhlcm8tYmc.jpg?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80&Expires=1798761600&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUvazh0Y0NYdzJTQTRQeURlVlNDaUdOQy9zYW5kYm94LzJldEptQzlXVnhZc1FpaElTblFUbXUtaW1nLTFfMTc3MTg1NDEyNTAwMF9uYTFmbl9aR0YwYVhabExXaGxjbTh0WW1jLmpwZz94LW9zcy1wcm9jZXNzPWltYWdlL3Jlc2l6ZSx3XzE5MjAsaF8xOTIwL2Zvcm1hdCx3ZWJwL3F1YWxpdHkscV84MCIsIkNvbmRpdGlvbiI6eyJEYXRlTGVzc1RoYW4iOnsiQVdTOkVwb2NoVGltZSI6MTc5ODc2MTYwMH19fV19&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=DqZjLdC2acWAqHUrdTtSlp7QHXJe6LtAKWEbYg-jlWgCAEcWvFI-mu1xe7h4kHRkZqs~JwzBw3eMImgZWXMx9CIlG5R9y4kFqLa~G7ULCbhFweTRO5rM6NnqTTmlcNrY5x-MaDMdhlkbiym23bZN0rNKA9Aw3JycxWrUuaBC0bNjLVUtQi1xTZKnK7L6sutfmKh2ADXnWBcVKCnTlntiofiFNxQRF0dcYh1ylIFiDgfStUVBdfMw0a0sJBYPmw0MWH4swwoWzXDK7yHWdtXykcqr6qsaoEl4~LV3wEOFWTkbl7kzeJRMZrI22Dtrhr4WRzhmALk7r680rF5mmHPW6A__";
const PORTFOLIO_SHOWCASE = "https://private-us-east-1.manuscdn.com/sessionFile/k8tcCXw2SA4PyDeVSCiGNC/sandbox/2etJmC9WVxYsQihISnQTmu-img-2_1771854127000_na1fn_ZGF0aXZlLXBvcnRmb2xpby1zaG93Y2FzZQ.jpg?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80&Expires=1798761600&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUvazh0Y0NYdzJTQTRQeURlVlNDaUdOQy9zYW5kYm94LzJldEptQzlXVnhZc1FaaElTblFUbXUtaW1nLTJfMTc3MTg1NDEyNzAwMF9uYTFmbl9aR0YwYVhabExYQnZjblJtYjJ4cGJ5MXphRzkzWTJGelpRLmpwZz94LW9zcy1wcm9jZXNzPWltYWdlL3Jlc2l6ZSx3XzE5MjAsaF8xOTIwL2Zvcm1hdCx3ZWJwL3F1YWxpdHkscV84MCIsIkNvbmRpdGlvbiI6eyJEYXRlTGVzc1RoYW4iOnsiQVdTOkVwb2NoVGltZSI6MTc5ODc2MTYwMH19fV19&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=DkewPjYfCyqNycnan7tAtITYB~sL5M3Th~lCMtX~Yp2Vq~Idg1a7E2hdV4b9fav9Ov1SNKzNOZlF5NbDZqJU-zPogxtKKRYcnNu75kT6QQu-QRa~U5MhA3eu9N6gVxKAajry2O0BNb2~CquNjKLkcDxsYYP4pI~nsFmUZNCeAQ1Bdy7REWUa6ts3EkWJPtqnmMvQd-rLxIrx7B94-7WnH~ep9BAXucv~euYclEpmFpJZPbplx0y2-NxtCg-qGZqNE~9QSOTNCc-MkeQMftYyxzROfCODT-vf0gGr1nRcd8hBVJ3shpm51wg6-pL0G7XSnyup7efJ7bmemTDBK8xaag__";
const SERVICES_BG = "https://private-us-east-1.manuscdn.com/sessionFile/k8tcCXw2SA4PyDeVSCiGNC/sandbox/2etJmC9WVxYsQihISnQTmu-img-3_1771854125000_na1fn_ZGF0aXZlLXNlcnZpY2VzLWJn.jpg?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80&Expires=1798761600&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUvazh0Y0NYdzJTQTRQeURlVlNDaUdOQy9zYW5kYm94LzJldEptQzlXVnhZc1FpaElTblFUbXUtaW1nLTNfMTc3MTg1NDEyNTAwMF9uYTFmbl9aR0YwYVhabExYTmxjblpwWTJWekxXSm4uanBnP3gtb3NzLXByb2Nlc3M9aW1hZ2UvcmVzaXplLHdfMTkyMCxoXzE5MjAvZm9ybWF0LHdlYnAvcXVhbGl0eSxxXzgwIiwiQ29uZGl0aW9uIjp7IkRhdGVMZXNzVGhhbiI6eyJBV1M6RXBvY2hUaW1lIjoxNzk4NzYxNjAwfX19XX0_&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=kk~3ctpqXGN1PG02Aj-8FRhbC-ULT8LPXSYoRry87uuYrN3kGAZ0tMLhywISu0eMQpYH33D1Ks33hbCfC9HfZuhY9BqgBMOKWeaiAiFHpLwg3fudvSK0dG5GeG4cNMWcjgo2mdmy3rG27Lc3j30o7lu2qP~nNpE7yI~DvNHDN4gu18rc2J3eLLXpaEnJ5gK-GfPlTpqF-2UwgV2fhCPNuxxUPd11q~C1PMLvzWRQg~2WSCHTawHawQlibbFbO8rIysJCjG~CMGWrIyNvifKmOlwR3jDGyAP65Y11bIuK4sbDvaINp1Iy79Qs3tjfGgGk9-igDXiCIVyK1FhR9wzd7A__";
const BRANDING_IMG = "https://private-us-east-1.manuscdn.com/sessionFile/k8tcCXw2SA4PyDeVSCiGNC/sandbox/2etJmC9WVxYsQihISnQTmu-img-4_1771854121000_na1fn_ZGF0aXZlLWJyYW5kaW5nLWNhcmQ.jpg?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80&Expires=1798761600&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUvazh0Y0NYdzJTQTRQeURlVlNDaUdOQy9zYW5kYm94LzJldEptQzlXVnhZc1FpaElTblFUbXUtaW1nLTRfMTc3MTg1NDEyMTAwMF9uYTFmbl9aR0YwYVhabExXSnlZVzVrYVc1bkxXTmhjbVEuanBnP3gtb3NzLXByb2Nlc3M9aW1hZ2UvcmVzaXplLHdfMTkyMCxoXzE5MjAvZm9ybWF0LHdlYnAvcXVhbGl0eSxxXzgwIiwiQ29uZGl0aW9uIjp7IkRhdGVMZXNzVGhhbiI6eyJBV1M6RXBvY2hUaW1lIjoxNzk4NzYxNjAwfX19XX0_&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=LhQTz3DmuVT6iFX9BAeKPC1cbGIaXJzqXc2SIWabWI5pBw7kcQOVoqTgWUMsGRYc2JsIErWMZpwsEEjv9EdowohxSbstaTZdIYCkX-bSlH3yxZjDGfcdrl1XMjh~3Htun4N52gb-W9qBk21v0VjOWjMfqgdsgf7GsN5sIUrWsrvssj9Wyai-wGdUd5LweVAjk90Tm-vD-Us-qzQT6lFCLvtWA1lrDb621C6ydOnJBOsrcwCqfWhvaUvMxy8f6iCy2zfA8tz~ns89NfcUcDuZgM1ExlwvVXV0VfzUGAMlc8Rj22cy4iAkAVaVfe3O3boZ0lCMO8WI~zOLk9RKwcaLw8Q__";
const PACKAGING_IMG = "https://private-us-east-1.manuscdn.com/sessionFile/k8tcCXw2SA4PyDeVSCiGNC/sandbox/2etJmC9WVxYsQihISnQTmu-img-5_1771854154000_na1fn_ZGF0aXZlLXBhY2thZ2luZy1jYXJk.jpg?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80&Expires=1798761600&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUvazh0Y0NYdzJTQTRQeURlVlNDaUdOQy9zYW5kYm94LzJldEptQzlXVnhZc1FpaElTblFUbXUtaW1nLTVfMTc3MTg1NDE1NDAwMF9uYTFmbl9aR0YwYVhabExYQmhZMnRoWjJsdVp5MWpZWEprLmpwZz94LW9zcy1wcm9jZXNzPWltYWdlL3Jlc2l6ZSx3XzE5MjAsaF8xOTIwL2Zvcm1hdCx3ZWJwL3F1YWxpdHkscV84MCIsIkNvbmRpdGlvbiI6eyJEYXRlTGVzc1RoYW4iOnsiQVdTOkVwb2NoVGltZSI6MTc5ODc2MTYwMH19fV19&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=XtvLaSS92e0HcozvsOSw3xwxjbhi9bheaDK7dthjogXODB~17cNe~H5ofYgpEv5g8J7pifk-xXHQtS5qRt~B9DufgCGkE~fFpf8g82lJdUvmHflAX8IqQMr7zkfoXVWPgB8Ai0ayBprUNoUFDT~hnQ5zYQvLmNmwg4pGfCfWIPSRtUeVVlWDCuaMFzl7BB8QmBhDuCvO1MYuGh~Je01Z8XQoS2Ti2SRXQTCv13S7Zd3eLUSPTxaTfLU5EJ99kZ7zogy5pcdiMVYrH6cLp2HT5MqadTl8sExjd-FeRjn5XqthLaNmejwOnNi-vbJ4M4J1req86PoHeAW8zgaeC0UIiA__";

// ─── Animation Variants ────────────────────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7 } },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15 } } as const,
};

// ─── Animated Section Wrapper ──────────────────────────────────────────────────
function AnimatedSection({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div
      ref={ref}
      variants={stagger}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ─── Diamond Logo SVG ──────────────────────────────────────────────────────────
function DiamondLogo({ size = 40, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <polygon points="50,5 95,35 95,65 50,95 5,65 5,35" stroke="currentColor" strokeWidth="3" fill="none" opacity="0.3"/>
      <polygon points="50,15 85,38 85,62 50,85 15,62 15,38" stroke="currentColor" strokeWidth="2" fill="none" opacity="0.5"/>
      <polygon points="50,25 75,42 75,58 50,75 25,58 25,42" stroke="currentColor" strokeWidth="2" fill="currentColor" opacity="0.15"/>
      <line x1="50" y1="5" x2="50" y2="95" stroke="currentColor" strokeWidth="1" opacity="0.3"/>
      <line x1="5" y1="50" x2="95" y2="50" stroke="currentColor" strokeWidth="1" opacity="0.3"/>
      <circle cx="50" cy="50" r="8" fill="currentColor" opacity="0.8"/>
    </svg>
  );
}

// ─── Services Data ─────────────────────────────────────────────────────────────
const services = [
  {
    icon: Palette,
    title: "Branding & Identyfikacja",
    subtitle: "Brand Identity",
    description: "Kompleksowe projekty identyfikacji wizualnej — od logo po pełne brand guidelines. Tworzę marki, które są rozpoznawalne, spójne i budują zaufanie.",
    tags: ["Logo", "Brand Guidelines", "Kolorystyka", "Typografia"],
    image: BRANDING_IMG,
  },
  {
    icon: Package,
    title: "Etykiety & Opakowania",
    subtitle: "Label & Packaging",
    description: "Projektowanie etykiet i opakowań, które przyciągają uwagę na półce. Elegancja formy połączona z precyzją typograficzną i spójną kolorystyką.",
    tags: ["Etykiety", "Opakowania", "Typografia", "Premium"],
    image: PACKAGING_IMG,
  },
  {
    icon: FileText,
    title: "Materiały Drukowane",
    subtitle: "Print Materials",
    description: "Wizytówki, ulotki, vouchery i katalogi zaprojektowane z dbałością o każdy detal. Materiały, które nie tylko wyglądają dobrze, ale też sprzedają.",
    tags: ["Wizytówki", "Ulotki", "Vouchery", "Katalogi"],
    image: PORTFOLIO_SHOWCASE,
  },
  {
    icon: Megaphone,
    title: "Grafika Reklamowa",
    subtitle: "Advertising Graphics",
    description: "Banery, posty social media i kampanie reklamowe dostosowane do Twojej marki. Grafiki, które budują rozpoznawalność i angażują odbiorców.",
    tags: ["Social Media", "Banery", "Kampanie", "Promocje"],
    image: SERVICES_BG,
  },
  {
    icon: Layers,
    title: "Projektowanie Logo",
    subtitle: "Logo Design",
    description: "Unikalne znaki graficzne, które oddają charakter Twojej firmy. Każde logo to historia — opowiadam ją za pomocą kształtów, kolorów i proporcji.",
    tags: ["Logo", "Sygnet", "Logotyp", "Wersje"],
    image: BRANDING_IMG,
  },
  {
    icon: Pen,
    title: "Doradztwo Wizualne",
    subtitle: "Visual Consulting",
    description: "Nie wiesz od czego zacząć? Pomogę Ci zdefiniować kierunek wizualny Twojej marki i stworzyć strategię komunikacji graficznej.",
    tags: ["Konsultacje", "Strategia", "Audyt", "Rebranding"],
    image: SERVICES_BG,
  },
];

// ─── Portfolio Projects ────────────────────────────────────────────────────────
const projects = [
  {
    client: "Free Premium Beer",
    title: "Nowa Etykieta, Nowa Jakość",
    category: "Label Design",
    description: "Etykieta wyróżniająca się czystością formy, świeżością i nowoczesnym charakterem — idealnie odzwierciedlająca ideę piwa 0% alkoholu.",
    tags: ["#LabelDesign", "#PackagingDesign", "#BeerDesign"],
    reactions: "2 reakcje",
    image: PACKAGING_IMG,
  },
  {
    client: "Bean to Bite",
    title: "Elegancja z Nutą Natury",
    category: "Branding & Print",
    description: "Spójny zestaw materiałów: Giftcards, ulotki i wizytówki. Każdy element oddaje charakter marki — naturalność, ciepło i unikalny klimat czekolady.",
    tags: ["#Branding", "#IdentityDesign", "#BeanToBite"],
    reactions: "4 reakcje",
    image: PORTFOLIO_SHOWCASE,
  },
  {
    client: "Royal Customs",
    title: "Prestiżowy Znak Marki",
    category: "Logo Design",
    description: "Logo w kilku wariantach kolorystycznych — od złota na czerni po monochromatyczne wersje. Symbol siły i ekskluzywności.",
    tags: ["#LogoDesign", "#Branding", "#RoyalCustoms"],
    reactions: "3 reakcje",
    image: BRANDING_IMG,
  },
  {
    client: "ChunkServe.pl",
    title: "Pixel Art Meets Summer",
    category: "Advertising Graphics",
    description: "Grafiki promujące wakacyjne rabaty łączące klimat lata z pixel-artową estetyką Minecraft. Kreatywne i angażujące.",
    tags: ["#GrafikaReklamowa", "#SocialMedia", "#Gaming"],
    reactions: "1 reakcja",
    image: SERVICES_BG,
  },
];

// ─── Reviews ───────────────────────────────────────────────────────────────────
const reviews = [
  {
    name: "Ewelina Konieczna",
    rating: 5,
    text: "Rewelacyjna współpraca! Projekt wizytówek dla Bean to Bite przeszedł moje oczekiwania. Grafiki są spójne, eleganckie i idealnie oddają charakter marki.",
    project: "Bean to Bite — Wizytówki",
    initials: "EK",
  },
  {
    name: "Klient Free Premium Beer",
    rating: 5,
    text: "Etykieta zaprojektowana przez DatiVe Design wyróżnia się na półce. Premium look, świeża kompozycja i spójność — dokładnie to, czego szukałem.",
    project: "Free Premium Beer — Etykieta",
    initials: "FP",
  },
  {
    name: "ChunkServe.pl",
    rating: 5,
    text: "Grafiki reklamowe zawsze na czas, zawsze zgodne z briefem. Polecam każdemu, kto szuka profesjonalnego grafika z kreatywnym podejściem.",
    project: "ChunkServe.pl — Grafika Reklamowa",
    initials: "CS",
  },
  {
    name: "Klient Royal Customs",
    rating: 5,
    text: "Logo, które stworzyłeś dla nas, idealnie oddaje prestiż naszej marki. Kilka wariantów, każdy dopracowany do perfekcji.",
    project: "Royal Customs — Logo",
    initials: "RC",
  },
];

// ─── Stats ─────────────────────────────────────────────────────────────────────
const stats = [
  { value: "100%", label: "Zadowolonych Klientów", sublabel: "12 recenzji" },
  { value: "101+", label: "Obserwujących", sublabel: "Facebook" },
  { value: "5+", label: "Branż Obsłużonych", sublabel: "Różnorodne projekty" },
  { value: "∞", label: "Kreatywność", sublabel: "Zawsze otwarta" },
];

// ─── Marquee Tags ──────────────────────────────────────────────────────────────
const marqueeItems = [
  "BRANDING", "LOGO DESIGN", "ETYKIETY", "WIZYTÓWKI", "ULOTKI",
  "OPAKOWANIA", "SOCIAL MEDIA", "IDENTYFIKACJA WIZUALNA", "GRAFIKA REKLAMOWA",
  "VOUCHERY", "KATALOGI", "REBRANDING",
];

// ─── Main Component ────────────────────────────────────────────────────────────
export default function Home() {
  const [activeService, setActiveService] = useState(0);
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      toast.error("Wypełnij wszystkie pola");
      return;
    }
    setFormSubmitted(true);
    toast.success("Wiadomość wysłana!", { description: "Odezwę się najszybciej jak to możliwe." });
  };

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">

      {/* ── NAVBAR ─────────────────────────────────────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-white/5">
        <div className="container flex items-center justify-between h-16">
          <a href="#hero" className="flex items-center gap-3 group">
  <img 
    src="/logo.png" 
    alt="Dative Design logo" 
    className="h-8 w-auto group-hover:opacity-80 transition-opacity" 
  />
  <div className="leading-none">
    <span className="font-display text-xl font-bold tracking-widest text-white">DATIVE</span>
    <span className="font-display text-xl font-bold tracking-widest text-gold"> DESIGN</span>
  </div>
</a>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {[["#brand-story", "O Nas"], ["#services", "Usługi"], ["#portfolio", "Portfolio"], ["#reviews", "Opinie"], ["#contact", "Kontakt"]].map(([href, label]) => (
              <a key={href} href={href} className="text-sm font-medium text-white/70 hover:text-gold transition-colors tracking-wider uppercase font-display">
                {label}
              </a>
            ))}
          </div>

          <a href="#contact" className="hidden md:inline-flex items-center gap-2 px-5 py-2 bg-gold text-background font-display font-bold text-sm tracking-wider uppercase rounded-sm hover:bg-gold-light transition-colors">
            <Sparkles size={14} />
            Napisz do mnie
          </a>

          {/* Mobile menu button */}
          <button className="md:hidden text-white/70 hover:text-gold" onClick={() => setMenuOpen(!menuOpen)}>
            <div className="w-6 flex flex-col gap-1.5">
              <span className={`block h-0.5 bg-current transition-all ${menuOpen ? "rotate-45 translate-y-2" : ""}`} />
              <span className={`block h-0.5 bg-current transition-all ${menuOpen ? "opacity-0" : ""}`} />
              <span className={`block h-0.5 bg-current transition-all ${menuOpen ? "-rotate-45 -translate-y-2" : ""}`} />
            </div>
          </button>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden bg-card border-t border-white/5 py-4">
            <div className="container flex flex-col gap-4">
              {[["#brand-story", "O Nas"], ["#services", "Usługi"], ["#portfolio", "Portfolio"], ["#reviews", "Opinie"], ["#contact", "Kontakt"]].map(([href, label]) => (
                <a key={href} href={href} onClick={() => setMenuOpen(false)} className="text-sm font-display font-bold tracking-wider uppercase text-white/70 hover:text-gold transition-colors">
                  {label}
                </a>
              ))}
            </div>
          </div>
        )}
      </nav>

      {/* ── HERO SECTION ───────────────────────────────────────────────────── */}
      <section id="hero" className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0">
          <img src={HERO_BG} alt="DatiVe Design hero" className="w-full h-full object-cover opacity-50" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/30 to-background" />
          <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-transparent to-background/40" />
        </div>

        <div className="relative container pt-24 pb-16">
          <div className="max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="section-label mb-6"
            >
              ◆ Projektant Graficzny — Rzeszów / Kolbuszowa
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="font-display text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-black leading-none mb-4"
            >
              <span className="block text-white">Z POMYSŁU</span>
              <span className="block gold-shimmer">DO REALIZACJI</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="text-lg md:text-xl text-white/70 max-w-2xl mb-8 font-light leading-relaxed"
            >
              Profesjonalne usługi graficzne dla Twojej firmy. Tworzę identyfikacje wizualne, 
              etykiety, materiały drukowane i grafiki reklamowe, które wyróżniają Twoją markę.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="flex flex-wrap gap-4 mb-12"
            >
              <a href="#portfolio" className="inline-flex items-center gap-2 px-8 py-3 bg-gold text-background font-display font-bold text-sm tracking-wider uppercase rounded-sm hover:bg-gold-light transition-all hover:shadow-lg hover:shadow-gold/20">
                <Sparkles size={16} />
                Zobacz Portfolio
              </a>
              <a href="#contact" className="inline-flex items-center gap-2 px-8 py-3 border border-white/20 text-white font-display font-bold text-sm tracking-wider uppercase rounded-sm hover:border-gold/50 hover:text-gold transition-all">
                Napisz do mnie
              </a>
            </motion.div>

            {/* Value props */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.7 }}
              className="flex flex-wrap gap-6"
            >
              {["PROFESJONALIZM", "DOŚWIADCZENIE", "INNOWACYJNOŚĆ"].map((val) => (
                <div key={val} className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-gold rounded-full" />
                  <span className="text-xs font-display font-bold tracking-widest text-white/50">{val}</span>
                </div>
              ))}
            </motion.div>
          </div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/30"
        >
          <span className="text-xs tracking-widest uppercase font-display">Scroll</span>
          <motion.div animate={{ y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}>
            <ChevronDown size={20} />
          </motion.div>
        </motion.div>
      </section>

      {/* ── MARQUEE BAND ───────────────────────────────────────────────────── */}
      <div className="py-4 bg-gold/10 border-y border-gold/20 overflow-hidden">
        <div className="flex animate-marquee whitespace-nowrap">
          {[...marqueeItems, ...marqueeItems].map((item, i) => (
            <span key={i} className="inline-flex items-center gap-4 px-6 text-xs font-display font-bold tracking-widest text-gold/70">
              {item}
              <span className="text-gold/30">◆</span>
            </span>
          ))}
        </div>
      </div>

      {/* ── BRAND STORY ────────────────────────────────────────────────────── */}
      <section id="brand-story" className="py-24 md:py-32">
        <div className="container">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            {/* Left: Text */}
            <AnimatedSection>
              <motion.div variants={fadeUp} className="section-label mb-4">◆ Nasza Historia</motion.div>
              <motion.h2 variants={fadeUp} className="font-display text-5xl md:text-6xl font-black text-white mb-6">
                GRAFIK<br />
                <span className="text-gold">KOMPUTEROWY</span><br />
                Z PASJĄ
              </motion.h2>
              <motion.div variants={fadeUp} className="gold-line w-24 mb-8" />
              <motion.p variants={fadeUp} className="text-white/70 leading-relaxed mb-6">
                DatiVe Design to studio graficzne z siedzibą w Rzeszowie i Kolbuszowej. 
                Specjalizuję się w tworzeniu profesjonalnych materiałów graficznych dla firm, 
                które chcą wyróżnić się na rynku i zbudować silną, rozpoznawalną markę.
              </motion.p>
              <motion.p variants={fadeUp} className="text-white/70 leading-relaxed mb-8">
                Każdy projekt traktuję indywidualnie — słucham potrzeb klienta, analizuję rynek 
                i tworzę rozwiązania, które nie tylko dobrze wyglądają, ale przede wszystkim 
                <span className="font-accent text-gold"> działają</span>. Od pomysłu do realizacji.
              </motion.p>
              <motion.div variants={fadeUp} className="flex flex-wrap gap-3">
                {["Zawsze dostępny", "100% rekomendacji", "12 recenzji"].map((tag) => (
                  <span key={tag} className="px-4 py-1.5 border border-gold/30 text-gold text-xs font-display font-bold tracking-wider uppercase rounded-sm">
                    {tag}
                  </span>
                ))}
              </motion.div>
            </AnimatedSection>

            {/* Right: Stats grid */}
            <AnimatedSection className="grid grid-cols-2 gap-4">
              {stats.map((stat, i) => (
                <motion.div
                  key={i}
                  variants={fadeUp}
                  className="p-6 bg-card border border-white/5 rounded-sm card-hover gold-border-hover"
                >
                  <div className="font-display text-4xl font-black text-gold mb-1">{stat.value}</div>
                  <div className="text-sm font-bold text-white mb-1">{stat.label}</div>
                  <div className="text-xs text-white/40 font-display tracking-wider">{stat.sublabel}</div>
                </motion.div>
              ))}
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* ── SERVICES ───────────────────────────────────────────────────────── */}
      <section id="services" className="py-24 md:py-32 relative overflow-hidden">
        <div className="absolute inset-0">
          <img src={SERVICES_BG} alt="" className="w-full h-full object-cover opacity-10" />
          <div className="absolute inset-0 bg-background/90" />
        </div>

        <div className="relative container">
          <AnimatedSection className="text-center mb-16">
            <motion.div variants={fadeUp} className="section-label mb-4">◆ Co Oferuję</motion.div>
            <motion.h2 variants={fadeUp} className="font-display text-5xl md:text-6xl font-black text-white mb-4">
              USŁUGI <span className="text-gold">GRAFICZNE</span>
            </motion.h2>
            <motion.p variants={fadeUp} className="text-white/50 max-w-xl mx-auto">
              Kompleksowe rozwiązania graficzne dostosowane do potrzeb Twojej firmy
            </motion.p>
          </AnimatedSection>

          {/* Service tabs + content */}
          <div className="grid lg:grid-cols-3 gap-6">
            {services.map((service, i) => {
              const Icon = service.icon;
              return (
                <AnimatedSection key={i}>
                  <motion.div
                    variants={fadeUp}
                    className={`group p-6 border rounded-sm cursor-pointer transition-all duration-300 card-hover ${
                      activeService === i
                        ? "border-gold/50 bg-gold/5"
                        : "border-white/5 bg-card gold-border-hover"
                    }`}
                    onClick={() => setActiveService(i)}
                  >
                    <div className={`w-12 h-12 rounded-sm flex items-center justify-center mb-4 transition-colors ${
                      activeService === i ? "bg-gold text-background" : "bg-white/5 text-gold"
                    }`}>
                      <Icon size={22} />
                    </div>
                    <div className="section-label mb-2">{service.subtitle}</div>
                    <h3 className="font-display text-xl font-bold text-white mb-3">{service.title}</h3>
                    <p className="text-sm text-white/60 leading-relaxed mb-4">{service.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {service.tags.map((tag) => (
                        <span key={tag} className="text-xs px-2 py-0.5 bg-white/5 text-white/40 font-display tracking-wider rounded-sm">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </motion.div>
                </AnimatedSection>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── PORTFOLIO ──────────────────────────────────────────────────────── */}
      <section id="portfolio" className="py-24 md:py-32">
        <div className="container">
          <AnimatedSection className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
            <div>
              <motion.div variants={fadeUp} className="section-label mb-4">◆ Realizacje</motion.div>
              <motion.h2 variants={fadeUp} className="font-display text-5xl md:text-6xl font-black text-white">
                WYBRANE<br /><span className="text-gold">PROJEKTY</span>
              </motion.h2>
            </div>
            <motion.p variants={fadeUp} className="text-white/50 max-w-xs text-sm leading-relaxed">
              Każdy projekt to unikalna historia marki opowiedziana przez kształty, kolory i typografię.
            </motion.p>
          </AnimatedSection>

          <div className="grid md:grid-cols-2 gap-6">
            {projects.map((project, i) => (
              <AnimatedSection key={i}>
                <motion.div
                  variants={fadeUp}
                  className="group relative overflow-hidden rounded-sm border border-white/5 gold-border-hover card-hover bg-card"
                >
                  {/* Image */}
                  <div className="aspect-video overflow-hidden">
                    <img
                      src={project.image}
                      alt={project.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-70 group-hover:opacity-90"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
                  </div>

                  {/* Content overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <div className="section-label mb-2">{project.category} — {project.client}</div>
                    <h3 className="font-display text-2xl font-bold text-white mb-2">{project.title}</h3>
                    <p className="text-sm text-white/60 leading-relaxed mb-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      {project.description}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {project.tags.map((tag) => (
                        <span key={tag} className="text-xs text-gold/60 font-display">{tag}</span>
                      ))}
                    </div>
                  </div>

                  {/* Reactions badge */}
                  <div className="absolute top-4 right-4 px-3 py-1 bg-background/80 backdrop-blur-sm border border-white/10 rounded-full text-xs text-white/50 font-display">
                    ♥ {project.reactions}
                  </div>
                </motion.div>
              </AnimatedSection>
            ))}
          </div>

          <AnimatedSection className="mt-12 text-center">
            <motion.a
              variants={fadeUp}
              href="https://www.facebook.com/DativeDesign/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 px-8 py-3 border border-gold/30 text-gold font-display font-bold text-sm tracking-wider uppercase rounded-sm hover:bg-gold/10 transition-all"
            >
              <Facebook size={16} />
              Zobacz więcej na Facebooku
            </motion.a>
          </AnimatedSection>
        </div>
      </section>

      {/* ── SOCIAL PROOF / REVIEWS ─────────────────────────────────────────── */}
      <section id="reviews" className="py-24 md:py-32 bg-card/50">
        <div className="container">
          <AnimatedSection className="text-center mb-16">
            <motion.div variants={fadeUp} className="section-label mb-4">◆ Opinie Klientów</motion.div>
            <motion.h2 variants={fadeUp} className="font-display text-5xl md:text-6xl font-black text-white mb-4">
              100% <span className="text-gold">REKOMENDACJI</span>
            </motion.h2>
            <motion.div variants={fadeUp} className="flex items-center justify-center gap-1 mb-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={20} className="fill-gold text-gold" />
              ))}
              <span className="ml-2 text-white/50 text-sm font-display">12 recenzji</span>
            </motion.div>
          </AnimatedSection>

          <div className="grid md:grid-cols-2 gap-6">
            {reviews.map((review, i) => (
              <AnimatedSection key={i}>
                <motion.div
                  variants={fadeUp}
                  className="p-6 bg-background border border-white/5 rounded-sm gold-border-hover card-hover"
                >
                  {/* Stars */}
                  <div className="flex gap-1 mb-4">
                    {[...Array(review.rating)].map((_, j) => (
                      <Star key={j} size={14} className="fill-gold text-gold" />
                    ))}
                  </div>

                  {/* Quote */}
                  <p className="text-white/70 leading-relaxed mb-6 italic font-light">
                    "{review.text}"
                  </p>

                  {/* Author */}
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gold/20 border border-gold/30 flex items-center justify-center">
                      <span className="text-gold text-xs font-display font-bold">{review.initials}</span>
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white">{review.name}</div>
                      <div className="text-xs text-white/40 font-display tracking-wider">{review.project}</div>
                    </div>
                    <div className="ml-auto">
                      <CheckCircle size={16} className="text-gold/50" />
                    </div>
                  </div>
                </motion.div>
              </AnimatedSection>
            ))}
          </div>

          {/* Trust badges */}
          <AnimatedSection className="mt-12 flex flex-wrap justify-center gap-8">
            {[
              { icon: Award, label: "100% Rekomendacji" },
              { icon: Users, label: "101+ Obserwujących" },
              { icon: Star, label: "5/5 Ocena" },
            ].map(({ icon: Icon, label }) => (
              <motion.div key={label} variants={fadeUp} className="flex items-center gap-3 text-white/40">
                <Icon size={20} className="text-gold/60" />
                <span className="text-sm font-display font-bold tracking-wider">{label}</span>
              </motion.div>
            ))}
          </AnimatedSection>
        </div>
      </section>

      {/* ── CONTACT FORM ───────────────────────────────────────────────────── */}
      <section id="contact" className="py-24 md:py-32">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-16 items-start">
            {/* Left: Info */}
            <AnimatedSection>
              <motion.div variants={fadeUp} className="section-label mb-4">◆ Kontakt</motion.div>
              <motion.h2 variants={fadeUp} className="font-display text-5xl md:text-6xl font-black text-white mb-6">
                NAPISZ<br /><span className="text-gold">DO MNIE</span>
              </motion.h2>
              <motion.div variants={fadeUp} className="gold-line w-24 mb-8" />
              <motion.p variants={fadeUp} className="text-white/60 leading-relaxed mb-10">
                Chcesz wyróżnić swoją markę? Masz projekt do omówienia? 
                Napisz do mnie — razem stworzymy coś wyjątkowego.
              </motion.p>

              <motion.div variants={stagger} className="space-y-5">
                {[
                  { icon: Phone, label: "Telefon", value: "+48 796 106 675", href: "tel:+48796106675" },
                  { icon: Mail, label: "Email", value: "kontakt@dativedesign.com", href: "mailto:kontakt@dativedesign.com" },
                  { icon: MapPin, label: "Lokalizacja", value: "Rzeszów • Kolbuszowa • okolice", href: null },
                  { icon: Instagram, label: "Instagram", value: "@dative_design", href: "https://instagram.com/dative_design" },
                  { icon: Facebook, label: "Facebook", value: "DativeDesign", href: "https://facebook.com/DativeDesign" },
                ].map(({ icon: Icon, label, value, href }) => (
                  <motion.div key={label} variants={fadeUp} className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-gold/10 border border-gold/20 rounded-sm flex items-center justify-center flex-shrink-0">
                      <Icon size={16} className="text-gold" />
                    </div>
                    <div>
                      <div className="text-xs text-white/30 font-display tracking-wider uppercase mb-0.5">{label}</div>
                      {href ? (
                        <a href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer" className="text-sm text-white/80 hover:text-gold transition-colors">
                          {value}
                        </a>
                      ) : (
                        <span className="text-sm text-white/80">{value}</span>
                      )}
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </AnimatedSection>

            {/* Right: Form */}
            <AnimatedSection>
              <motion.div variants={fadeUp} className="p-8 bg-card border border-white/5 rounded-sm">
                {formSubmitted ? (
                  <div className="text-center py-12">
                    <CheckCircle size={48} className="text-gold mx-auto mb-4" />
                    <h3 className="font-display text-2xl font-bold text-white mb-2">WIADOMOŚĆ WYSŁANA!</h3>
                    <p className="text-white/50">Odezwę się najszybciej jak to możliwe.</p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                      <label className="text-xs font-display font-bold tracking-wider uppercase text-white/40 mb-2 block">
                        Imię i Nazwisko *
                      </label>
                      <Input
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Jan Kowalski"
                        className="bg-background border-white/10 text-white placeholder:text-white/20 focus:border-gold/50 rounded-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-display font-bold tracking-wider uppercase text-white/40 mb-2 block">
                        Adres Email *
                      </label>
                      <Input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="jan@firma.pl"
                        className="bg-background border-white/10 text-white placeholder:text-white/20 focus:border-gold/50 rounded-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-display font-bold tracking-wider uppercase text-white/40 mb-2 block">
                        Wiadomość *
                      </label>
                      <Textarea
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        placeholder="Opisz swój projekt lub zapytanie..."
                        rows={5}
                        className="bg-background border-white/10 text-white placeholder:text-white/20 focus:border-gold/50 rounded-sm resize-none"
                      />
                    </div>
                    <Button
                      type="submit"
                      className="w-full bg-gold text-background hover:bg-gold-light font-display font-bold tracking-wider uppercase rounded-sm h-12 flex items-center gap-2"
                    >
                      <Send size={16} />
                      Wyślij Wiadomość
                    </Button>
                    <p className="text-xs text-white/20 text-center font-display">
                      Lub napisz bezpośrednio: kontakt@dativedesign.com
                    </p>
                  </form>
                )}
              </motion.div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* ── FOOTER ─────────────────────────────────────────────────────────── */}
      <footer className="py-12 border-t border-white/5">
        <div className="container">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="Dative Design logo" className="h-8" />
              <div>
                <span className="font-display text-lg font-bold tracking-widest text-white">DATIVE</span>
                <span className="font-display text-lg font-bold tracking-widest text-gold"> DESIGN</span>
              </div>
            </div>

            <p className="text-xs text-white/20 font-display tracking-wider text-center">
              © 2025 DatiVe Design — Profesjonalne Usługi Graficzne dla Twojej firmy
            </p>

            <div className="flex items-center gap-4">
              <a href="https://instagram.com/dative_design" target="_blank" rel="noopener noreferrer" className="text-white/30 hover:text-gold transition-colors">
                <Instagram size={18} />
              </a>
              <a href="https://facebook.com/DativeDesign" target="_blank" rel="noopener noreferrer" className="text-white/30 hover:text-gold transition-colors">
                <Facebook size={18} />
              </a>
              <a href="mailto:kontakt@dativedesign.com" className="text-white/30 hover:text-gold transition-colors">
                <Mail size={18} />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
