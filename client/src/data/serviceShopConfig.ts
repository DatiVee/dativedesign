import type { Locale } from "@/lib/localeRoutes";

export type ServiceConfiguratorChoice = {
  value: string;
  label: string;
  priceDelta: number;
};

export type ServiceConfiguratorField = {
  id: string;
  label: string;
  description?: string;
  type: "select" | "radio";
  choices: ServiceConfiguratorChoice[];
};

const serviceShopConfigPl: Record<string, ServiceConfiguratorField[]> = {
  karykatura: [
    {
      id: "caricature-style",
      label: "Styl karykatury",
      description: "Wybierz kierunek wizualny, od którego mam zacząć pracę.",
      type: "radio",
      choices: [
        { value: "classic", label: "Klasyczna / elegancka", priceDelta: 0 },
        { value: "fun", label: "Bardziej zabawna / przerysowana", priceDelta: 39 },
        { value: "premium", label: "Premium / bardziej dopracowana scena", priceDelta: 89 },
      ],
    },
    {
      id: "caricature-format",
      label: "Zakres plików",
      type: "select",
      choices: [
        { value: "digital", label: "Plik cyfrowy", priceDelta: 0 },
        { value: "digital-print", label: "Cyfrowy + wersja do druku", priceDelta: 49 },
        { value: "gift-pack", label: "Cyfrowy + druk + wersja prezentowa", priceDelta: 99 },
      ],
    },
  ],
  "wektoryzacja-logo": [
    {
      id: "vector-source",
      label: "Jakość materiału wejściowego",
      description: "Im słabszy plik wejściowy, tym więcej ręcznej rekonstrukcji.",
      type: "radio",
      choices: [
        { value: "clear", label: "Czytelny JPG / PNG", priceDelta: 0 },
        { value: "medium", label: "Średnia jakość / screenshot", priceDelta: 49 },
        { value: "poor", label: "Słaby plik / mocna rekonstrukcja", priceDelta: 99 },
      ],
    },
    {
      id: "vector-versions",
      label: "Zakres końcowy",
      type: "select",
      choices: [
        { value: "vector-only", label: "Sama wektoryzacja", priceDelta: 0 },
        { value: "vector-color", label: "Wektor + wersje kolorystyczne", priceDelta: 59 },
        { value: "vector-brand", label: "Wektor + porządek plików i eksportów", priceDelta: 99 },
      ],
    },
  ],
  "przygotowanie-pliku-do-druku": [
    {
      id: "print-file-type",
      label: "Typ materiału",
      type: "radio",
      choices: [
        { value: "standard", label: "Standardowy plik do druku", priceDelta: 0 },
        { value: "folded", label: "Składany / wielostronicowy", priceDelta: 49 },
        { value: "large", label: "Duży format / bardziej techniczny", priceDelta: 89 },
      ],
    },
    {
      id: "print-file-support",
      label: "Dodatkowy zakres",
      type: "select",
      choices: [
        { value: "prepress", label: "Spady i przygotowanie prepress", priceDelta: 0 },
        { value: "prepress-check", label: "Prepress + sprawdzenie pod drukarnię", priceDelta: 39 },
        { value: "full", label: "Prepress + eksporty + konsultacja", priceDelta: 79 },
      ],
    },
  ],
  "projekt-logo": [
    {
      id: "style-direction",
      label: "Kierunek stylistyczny",
      description: "Wybierz klimat, w który ma iść pierwszy kierunek projektu.",
      type: "radio",
      choices: [
        { value: "minimal", label: "Minimal / nowocześnie", priceDelta: 0 },
        { value: "premium", label: "Premium / elegancko", priceDelta: 59 },
        { value: "expressive", label: "Mocniej / bardziej charakterne", priceDelta: 79 },
      ],
    },
    {
      id: "delivery-mode",
      label: "Tryb realizacji",
      description: "Standard jest w cenie. Express podbija priorytet kolejki.",
      type: "select",
      choices: [
        { value: "standard", label: "Standard", priceDelta: 0 },
        { value: "express", label: "Express 72h", priceDelta: 149 },
      ],
    },
  ],
  branding: [
    {
      id: "brand-range",
      label: "Zakres identyfikacji",
      description: "Ile elementów wizualnych ma wejść w pierwszy etap wdrożenia.",
      type: "radio",
      choices: [
        { value: "core", label: "Logo + kolory + typografia", priceDelta: 0 },
        { value: "extended", label: "Rozszerzony zestaw materiałów", priceDelta: 249 },
        { value: "launch", label: "Pakiet launchowy marki", priceDelta: 449 },
      ],
    },
    {
      id: "brandbook-depth",
      label: "Poziom księgi marki",
      type: "select",
      choices: [
        { value: "mini", label: "Brandboard / mini guide", priceDelta: 0 },
        { value: "light", label: "Księga light", priceDelta: 149 },
        { value: "full", label: "Pełny brandbook", priceDelta: 349 },
      ],
    },
  ],
  "projekt-wizytowki": [
    {
      id: "card-sides",
      label: "Układ wizytówki",
      type: "radio",
      choices: [
        { value: "single", label: "Jednostronna", priceDelta: 0 },
        { value: "double", label: "Dwustronna", priceDelta: 39 },
      ],
    },
    {
      id: "card-finish",
      label: "Wykończenie pod druk",
      type: "select",
      choices: [
        { value: "classic", label: "Klasyczne", priceDelta: 0 },
        { value: "soft", label: "Soft touch / premium", priceDelta: 59 },
        { value: "foil", label: "Złocenie / uszlachetnienie", priceDelta: 119 },
      ],
    },
  ],
  "projekt-ulotki": [
    {
      id: "flyer-format",
      label: "Format projektu",
      type: "radio",
      choices: [
        { value: "a6", label: "A6 / DL", priceDelta: 0 },
        { value: "a5", label: "A5", priceDelta: 39 },
        { value: "a4", label: "A4 / składana", priceDelta: 89 },
      ],
    },
    {
      id: "flyer-adaptation",
      label: "Dodatkowe adaptacje",
      type: "select",
      choices: [
        { value: "print", label: "Tylko druk", priceDelta: 0 },
        { value: "print-social", label: "Druk + wersja do social media", priceDelta: 49 },
        { value: "campaign", label: "Mały zestaw kampanijny", priceDelta: 119 },
      ],
    },
  ],
  "projekt-banera": [
    {
      id: "banner-use",
      label: "Typ banera",
      type: "radio",
      choices: [
        { value: "digital", label: "Baner internetowy", priceDelta: 0 },
        { value: "print", label: "Baner do druku", priceDelta: 69 },
        { value: "outdoor", label: "Outdoor / roll-up / billboard", priceDelta: 129 },
      ],
    },
    {
      id: "banner-formats",
      label: "Liczba formatów",
      type: "select",
      choices: [
        { value: "single", label: "1 format", priceDelta: 0 },
        { value: "three", label: "3 formaty", priceDelta: 89 },
        { value: "campaign", label: "Zestaw kampanijny", priceDelta: 149 },
      ],
    },
  ],
  "social-media": [
    {
      id: "social-scope",
      label: "Zakres publikacji",
      type: "radio",
      choices: [
        { value: "posts", label: "Same posty", priceDelta: 0 },
        { value: "posts-stories", label: "Posty + stories", priceDelta: 69 },
        { value: "ads", label: "Posty + stories + reklamy", priceDelta: 149 },
      ],
    },
    {
      id: "social-style",
      label: "Styl komunikacji",
      type: "select",
      choices: [
        { value: "clean", label: "Clean / firmowo", priceDelta: 0 },
        { value: "premium", label: "Premium / editorial", priceDelta: 49 },
        { value: "dynamic", label: "Dynamicznie / sprzedażowo", priceDelta: 69 },
      ],
    },
  ],
  "stopka-email": [
    {
      id: "email-type",
      label: "Typ stopki",
      type: "radio",
      choices: [
        { value: "static", label: "Statyczna grafika", priceDelta: 0 },
        { value: "html", label: "Klikalna stopka HTML", priceDelta: 99 },
      ],
    },
    {
      id: "email-variants",
      label: "Warianty użytkowników",
      type: "select",
      choices: [
        { value: "one", label: "1 osoba", priceDelta: 0 },
        { value: "three", label: "Do 3 osób", priceDelta: 79 },
        { value: "team", label: "Mały zespół", priceDelta: 149 },
      ],
    },
  ],
  "papier-firmowy": [
    {
      id: "letterhead-format",
      label: "Format dokumentu",
      type: "radio",
      choices: [
        { value: "a4", label: "A4 standard", priceDelta: 0 },
        { value: "a4-envelope", label: "A4 + koperta", priceDelta: 59 },
      ],
    },
    {
      id: "letterhead-edit",
      label: "Pliki końcowe",
      type: "select",
      choices: [
        { value: "pdf", label: "PDF do druku", priceDelta: 0 },
        { value: "editable", label: "PDF + edytowalny DOCX", priceDelta: 89 },
      ],
    },
  ],
  "projekt-etykiety": [
    {
      id: "label-type",
      label: "Typ etykiety",
      type: "radio",
      choices: [
        { value: "single", label: "1 etykieta produktowa", priceDelta: 0 },
        { value: "series", label: "Seria 2–3 wariantów", priceDelta: 149 },
        { value: "full-line", label: "Linia produktowa", priceDelta: 299 },
      ],
    },
    {
      id: "label-surface",
      label: "Nośnik / zastosowanie",
      type: "select",
      choices: [
        { value: "bottle", label: "Butelka / słoik", priceDelta: 0 },
        { value: "box", label: "Pudełko / kartonik", priceDelta: 49 },
        { value: "cosmetics", label: "Kosmetyk / premium", priceDelta: 89 },
      ],
    },
  ],
  "projekt-opakowania": [
    {
      id: "packaging-format",
      label: "Typ opakowania",
      type: "radio",
      choices: [
        { value: "box", label: "Pudełko", priceDelta: 0 },
        { value: "pouch", label: "Doypack / saszetka", priceDelta: 79 },
        { value: "set", label: "Zestaw opakowań", priceDelta: 249 },
      ],
    },
    {
      id: "packaging-depth",
      label: "Zakres projektu",
      type: "select",
      choices: [
        { value: "visual", label: "Tylko oprawa wizualna", priceDelta: 0 },
        { value: "layout", label: "Oprawa + layout techniczny", priceDelta: 149 },
        { value: "launch", label: "Opakowanie + materiały launchowe", priceDelta: 299 },
      ],
    },
  ],
  "projekt-vouchera": [
    {
      id: "voucher-format",
      label: "Format vouchera",
      type: "radio",
      choices: [
        { value: "single", label: "Pojedynczy voucher", priceDelta: 0 },
        { value: "set", label: "Zestaw kilku wartości", priceDelta: 69 },
        { value: "gift-pack", label: "Voucher + koperta / karta", priceDelta: 119 },
      ],
    },
    {
      id: "voucher-use",
      label: "Wersja użytkowa",
      type: "select",
      choices: [
        { value: "print", label: "Druk", priceDelta: 0 },
        { value: "digital", label: "Cyfrowa / PDF", priceDelta: 39 },
        { value: "both", label: "Druk + cyfrowa", priceDelta: 69 },
      ],
    },
  ],
  "projekt-menu": [
    {
      id: "menu-type",
      label: "Typ menu",
      type: "radio",
      choices: [
        { value: "one", label: "1 karta menu", priceDelta: 0 },
        { value: "booklet", label: "Menu wielostronicowe", priceDelta: 149 },
        { value: "full-set", label: "Menu + dodatki stołowe", priceDelta: 249 },
      ],
    },
    {
      id: "menu-version",
      label: "Wersja dodatkowa",
      type: "select",
      choices: [
        { value: "print", label: "Tylko druk", priceDelta: 0 },
        { value: "qr", label: "Druk + wersja QR / online", priceDelta: 79 },
        { value: "seasonal", label: "Druk + wkładka sezonowa", priceDelta: 99 },
      ],
    },
  ],
  "oferta-pdf": [
    {
      id: "offer-length",
      label: "Objętość oferty",
      type: "radio",
      choices: [
        { value: "short", label: "Krótka oferta 2–4 strony", priceDelta: 0 },
        { value: "medium", label: "Oferta 5–8 stron", priceDelta: 149 },
        { value: "sales", label: "Rozbudowana oferta sprzedażowa", priceDelta: 299 },
      ],
    },
    {
      id: "offer-edit",
      label: "Plik końcowy",
      type: "select",
      choices: [
        { value: "pdf", label: "PDF finalny", priceDelta: 0 },
        { value: "editable", label: "PDF + edytowalny plik", priceDelta: 129 },
        { value: "presentation", label: "PDF + wersja prezentacyjna", priceDelta: 199 },
      ],
    },
  ],
  "cover-facebook": [
    {
      id: "cover-direction",
      label: "Kierunek coveru",
      type: "radio",
      choices: [
        { value: "clean", label: "Clean / informacyjnie", priceDelta: 0 },
        { value: "promo", label: "Promocyjnie / sprzedażowo", priceDelta: 39 },
        { value: "premium", label: "Premium / wizerunkowo", priceDelta: 59 },
      ],
    },
    {
      id: "cover-variants",
      label: "Warianty dodatkowe",
      type: "select",
      choices: [
        { value: "single", label: "1 cover", priceDelta: 0 },
        { value: "double", label: "2 warianty", priceDelta: 49 },
        { value: "campaign", label: "Mały zestaw kampanijny", priceDelta: 89 },
      ],
    },
  ],
  "highlight-icons": [
    {
      id: "highlight-count",
      label: "Liczba ikon",
      type: "radio",
      choices: [
        { value: "6", label: "Do 6 ikon", priceDelta: 0 },
        { value: "9", label: "Do 9 ikon", priceDelta: 39 },
        { value: "12", label: "Do 12 ikon", priceDelta: 69 },
      ],
    },
    {
      id: "highlight-style",
      label: "Styl zestawu",
      type: "select",
      choices: [
        { value: "line", label: "Liniowy / clean", priceDelta: 0 },
        { value: "filled", label: "Pełne kształty", priceDelta: 29 },
        { value: "premium", label: "Premium / bardziej autorskie", priceDelta: 59 },
      ],
    },
  ],
  "roll-up": [
    {
      id: "rollup-size",
      label: "Format nośnika",
      type: "radio",
      choices: [
        { value: "85x200", label: "85x200 cm", priceDelta: 0 },
        { value: "100x200", label: "100x200 cm", priceDelta: 49 },
        { value: "custom", label: "Inny format pionowy", priceDelta: 79 },
      ],
    },
    {
      id: "rollup-extras",
      label: "Dodatkowe adaptacje",
      type: "select",
      choices: [
        { value: "print", label: "Tylko roll-up", priceDelta: 0 },
        { value: "poster", label: "Roll-up + plakat", priceDelta: 79 },
        { value: "event", label: "Mały zestaw eventowy", priceDelta: 149 },
      ],
    },
  ],
  "teczka-ofertowa": [
    {
      id: "folder-format",
      label: "Typ teczki",
      type: "radio",
      choices: [
        { value: "classic", label: "Klasyczna A4", priceDelta: 0 },
        { value: "pocket", label: "A4 z kieszenią i miejscem na wizytówkę", priceDelta: 49 },
        { value: "premium", label: "Wersja premium / uszlachetniona", priceDelta: 89 },
      ],
    },
    {
      id: "folder-support",
      label: "Dodatki do kompletu",
      type: "select",
      choices: [
        { value: "folder", label: "Sama teczka", priceDelta: 0 },
        { value: "folder-paper", label: "Teczka + papier firmowy", priceDelta: 79 },
        { value: "folder-sales", label: "Teczka + oferta PDF", priceDelta: 129 },
      ],
    },
  ],
};

const serviceShopConfigEn: Record<string, ServiceConfiguratorField[]> = {
  karykatura: [
    {
      id: "caricature-style",
      label: "Caricature style",
      description: "Choose the visual direction for the first version.",
      type: "radio",
      choices: [
        { value: "classic", label: "Classic / elegant", priceDelta: 0 },
        { value: "fun", label: "Fun / more exaggerated", priceDelta: 39 },
        { value: "premium", label: "Premium / more polished scene", priceDelta: 89 },
      ],
    },
    {
      id: "caricature-format",
      label: "File scope",
      type: "select",
      choices: [
        { value: "digital", label: "Digital file only", priceDelta: 0 },
        { value: "digital-print", label: "Digital + print version", priceDelta: 49 },
        { value: "gift-pack", label: "Digital + print + gift-ready version", priceDelta: 99 },
      ],
    },
  ],
  "wektoryzacja-logo": [
    {
      id: "vector-source",
      label: "Source quality",
      description: "Lower-quality files usually mean more manual reconstruction.",
      type: "radio",
      choices: [
        { value: "clear", label: "Clean JPG / PNG", priceDelta: 0 },
        { value: "medium", label: "Average quality / screenshot", priceDelta: 49 },
        { value: "poor", label: "Poor file / heavy reconstruction", priceDelta: 99 },
      ],
    },
    {
      id: "vector-versions",
      label: "Final scope",
      type: "select",
      choices: [
        { value: "vector-only", label: "Vectorization only", priceDelta: 0 },
        { value: "vector-color", label: "Vector + color variations", priceDelta: 59 },
        { value: "vector-brand", label: "Vector + organized exports", priceDelta: 99 },
      ],
    },
  ],
  "przygotowanie-pliku-do-druku": [
    {
      id: "print-file-type",
      label: "Material type",
      type: "radio",
      choices: [
        { value: "standard", label: "Standard print file", priceDelta: 0 },
        { value: "folded", label: "Folded / multi-page", priceDelta: 49 },
        { value: "large", label: "Large format / technical", priceDelta: 89 },
      ],
    },
    {
      id: "print-file-support",
      label: "Extra scope",
      type: "select",
      choices: [
        { value: "prepress", label: "Bleeds and prepress prep", priceDelta: 0 },
        { value: "prepress-check", label: "Prepress + printer check", priceDelta: 39 },
        { value: "full", label: "Prepress + exports + consultation", priceDelta: 79 },
      ],
    },
  ],
  "projekt-logo": [
    {
      id: "style-direction",
      label: "Style direction",
      description: "Choose the visual tone for the first creative direction.",
      type: "radio",
      choices: [
        { value: "minimal", label: "Minimal / modern", priceDelta: 0 },
        { value: "premium", label: "Premium / elegant", priceDelta: 59 },
        { value: "expressive", label: "More expressive / bolder", priceDelta: 79 },
      ],
    },
    {
      id: "delivery-mode",
      label: "Delivery mode",
      description: "Standard is included. Express bumps the project up the queue.",
      type: "select",
      choices: [
        { value: "standard", label: "Standard", priceDelta: 0 },
        { value: "express", label: "Express 72h", priceDelta: 149 },
      ],
    },
  ],
  branding: [
    {
      id: "brand-range",
      label: "Identity scope",
      description: "How much of the visual system should be included in stage one.",
      type: "radio",
      choices: [
        { value: "core", label: "Logo + colors + typography", priceDelta: 0 },
        { value: "extended", label: "Extended brand materials", priceDelta: 249 },
        { value: "launch", label: "Brand launch package", priceDelta: 449 },
      ],
    },
    {
      id: "brandbook-depth",
      label: "Brand guide depth",
      type: "select",
      choices: [
        { value: "mini", label: "Brandboard / mini guide", priceDelta: 0 },
        { value: "light", label: "Light brand guide", priceDelta: 149 },
        { value: "full", label: "Full brandbook", priceDelta: 349 },
      ],
    },
  ],
  "projekt-wizytowki": [
    {
      id: "card-sides",
      label: "Business card layout",
      type: "radio",
      choices: [
        { value: "single", label: "Single-sided", priceDelta: 0 },
        { value: "double", label: "Double-sided", priceDelta: 39 },
      ],
    },
    {
      id: "card-finish",
      label: "Print finish",
      type: "select",
      choices: [
        { value: "classic", label: "Classic", priceDelta: 0 },
        { value: "soft", label: "Soft touch / premium", priceDelta: 59 },
        { value: "foil", label: "Foil / luxury finish", priceDelta: 119 },
      ],
    },
  ],
  "projekt-ulotki": [
    {
      id: "flyer-format",
      label: "Flyer format",
      type: "radio",
      choices: [
        { value: "a6", label: "A6 / DL", priceDelta: 0 },
        { value: "a5", label: "A5", priceDelta: 39 },
        { value: "a4", label: "A4 / folded", priceDelta: 89 },
      ],
    },
    {
      id: "flyer-adaptation",
      label: "Additional adaptations",
      type: "select",
      choices: [
        { value: "print", label: "Print only", priceDelta: 0 },
        { value: "print-social", label: "Print + social media version", priceDelta: 49 },
        { value: "campaign", label: "Mini campaign set", priceDelta: 119 },
      ],
    },
  ],
  "projekt-banera": [
    {
      id: "banner-use",
      label: "Banner type",
      type: "radio",
      choices: [
        { value: "digital", label: "Digital banner", priceDelta: 0 },
        { value: "print", label: "Print banner", priceDelta: 69 },
        { value: "outdoor", label: "Outdoor / roll-up / billboard", priceDelta: 129 },
      ],
    },
    {
      id: "banner-formats",
      label: "Number of formats",
      type: "select",
      choices: [
        { value: "single", label: "1 format", priceDelta: 0 },
        { value: "three", label: "3 formats", priceDelta: 89 },
        { value: "campaign", label: "Campaign set", priceDelta: 149 },
      ],
    },
  ],
  "social-media": [
    {
      id: "social-scope",
      label: "Content scope",
      type: "radio",
      choices: [
        { value: "posts", label: "Posts only", priceDelta: 0 },
        { value: "posts-stories", label: "Posts + stories", priceDelta: 69 },
        { value: "ads", label: "Posts + stories + ads", priceDelta: 149 },
      ],
    },
    {
      id: "social-style",
      label: "Visual tone",
      type: "select",
      choices: [
        { value: "clean", label: "Clean / corporate", priceDelta: 0 },
        { value: "premium", label: "Premium / editorial", priceDelta: 49 },
        { value: "dynamic", label: "Dynamic / sales-focused", priceDelta: 69 },
      ],
    },
  ],
  "stopka-email": [
    {
      id: "email-type",
      label: "Signature type",
      type: "radio",
      choices: [
        { value: "static", label: "Static graphic", priceDelta: 0 },
        { value: "html", label: "Clickable HTML signature", priceDelta: 99 },
      ],
    },
    {
      id: "email-variants",
      label: "Team variants",
      type: "select",
      choices: [
        { value: "one", label: "1 person", priceDelta: 0 },
        { value: "three", label: "Up to 3 people", priceDelta: 79 },
        { value: "team", label: "Small team", priceDelta: 149 },
      ],
    },
  ],
  "papier-firmowy": [
    {
      id: "letterhead-format",
      label: "Document format",
      type: "radio",
      choices: [
        { value: "a4", label: "A4 standard", priceDelta: 0 },
        { value: "a4-envelope", label: "A4 + envelope", priceDelta: 59 },
      ],
    },
    {
      id: "letterhead-edit",
      label: "Final files",
      type: "select",
      choices: [
        { value: "pdf", label: "Print PDF", priceDelta: 0 },
        { value: "editable", label: "PDF + editable DOCX", priceDelta: 89 },
      ],
    },
  ],
  "projekt-etykiety": [
    {
      id: "label-type",
      label: "Label type",
      type: "radio",
      choices: [
        { value: "single", label: "Single product label", priceDelta: 0 },
        { value: "series", label: "Series of 2–3 variants", priceDelta: 149 },
        { value: "full-line", label: "Full product line", priceDelta: 299 },
      ],
    },
    {
      id: "label-surface",
      label: "Product surface",
      type: "select",
      choices: [
        { value: "bottle", label: "Bottle / jar", priceDelta: 0 },
        { value: "box", label: "Box / carton", priceDelta: 49 },
        { value: "cosmetics", label: "Cosmetics / premium", priceDelta: 89 },
      ],
    },
  ],
  "projekt-opakowania": [
    {
      id: "packaging-format",
      label: "Packaging type",
      type: "radio",
      choices: [
        { value: "box", label: "Box", priceDelta: 0 },
        { value: "pouch", label: "Pouch / sachet", priceDelta: 79 },
        { value: "set", label: "Packaging set", priceDelta: 249 },
      ],
    },
    {
      id: "packaging-depth",
      label: "Project scope",
      type: "select",
      choices: [
        { value: "visual", label: "Visual layer only", priceDelta: 0 },
        { value: "layout", label: "Visual + technical layout", priceDelta: 149 },
        { value: "launch", label: "Packaging + launch materials", priceDelta: 299 },
      ],
    },
  ],
  "projekt-vouchera": [
    {
      id: "voucher-format",
      label: "Voucher format",
      type: "radio",
      choices: [
        { value: "single", label: "Single voucher", priceDelta: 0 },
        { value: "set", label: "Set of multiple values", priceDelta: 69 },
        { value: "gift-pack", label: "Voucher + envelope / gift card", priceDelta: 119 },
      ],
    },
    {
      id: "voucher-use",
      label: "Delivery version",
      type: "select",
      choices: [
        { value: "print", label: "Print", priceDelta: 0 },
        { value: "digital", label: "Digital / PDF", priceDelta: 39 },
        { value: "both", label: "Print + digital", priceDelta: 69 },
      ],
    },
  ],
  "projekt-menu": [
    {
      id: "menu-type",
      label: "Menu type",
      type: "radio",
      choices: [
        { value: "one", label: "Single menu card", priceDelta: 0 },
        { value: "booklet", label: "Multi-page menu", priceDelta: 149 },
        { value: "full-set", label: "Menu + table extras", priceDelta: 249 },
      ],
    },
    {
      id: "menu-version",
      label: "Additional version",
      type: "select",
      choices: [
        { value: "print", label: "Print only", priceDelta: 0 },
        { value: "qr", label: "Print + QR / online", priceDelta: 79 },
        { value: "seasonal", label: "Print + seasonal insert", priceDelta: 99 },
      ],
    },
  ],
  "oferta-pdf": [
    {
      id: "offer-length",
      label: "Offer length",
      type: "radio",
      choices: [
        { value: "short", label: "Short offer 2–4 pages", priceDelta: 0 },
        { value: "medium", label: "Offer 5–8 pages", priceDelta: 149 },
        { value: "sales", label: "Expanded sales deck", priceDelta: 299 },
      ],
    },
    {
      id: "offer-edit",
      label: "Final file type",
      type: "select",
      choices: [
        { value: "pdf", label: "Final PDF", priceDelta: 0 },
        { value: "editable", label: "PDF + editable file", priceDelta: 129 },
        { value: "presentation", label: "PDF + presentation version", priceDelta: 199 },
      ],
    },
  ],
  "cover-facebook": [
    {
      id: "cover-direction",
      label: "Cover direction",
      type: "radio",
      choices: [
        { value: "clean", label: "Clean / informative", priceDelta: 0 },
        { value: "promo", label: "Promo / sales-focused", priceDelta: 39 },
        { value: "premium", label: "Premium / brand-first", priceDelta: 59 },
      ],
    },
    {
      id: "cover-variants",
      label: "Additional variants",
      type: "select",
      choices: [
        { value: "single", label: "1 cover", priceDelta: 0 },
        { value: "double", label: "2 variants", priceDelta: 49 },
        { value: "campaign", label: "Small campaign set", priceDelta: 89 },
      ],
    },
  ],
  "highlight-icons": [
    {
      id: "highlight-count",
      label: "Number of icons",
      type: "radio",
      choices: [
        { value: "6", label: "Up to 6 icons", priceDelta: 0 },
        { value: "9", label: "Up to 9 icons", priceDelta: 39 },
        { value: "12", label: "Up to 12 icons", priceDelta: 69 },
      ],
    },
    {
      id: "highlight-style",
      label: "Visual style",
      type: "select",
      choices: [
        { value: "line", label: "Line / clean", priceDelta: 0 },
        { value: "filled", label: "Filled shapes", priceDelta: 29 },
        { value: "premium", label: "Premium / more custom", priceDelta: 59 },
      ],
    },
  ],
  "roll-up": [
    {
      id: "rollup-size",
      label: "Display format",
      type: "radio",
      choices: [
        { value: "85x200", label: "85x200 cm", priceDelta: 0 },
        { value: "100x200", label: "100x200 cm", priceDelta: 49 },
        { value: "custom", label: "Custom vertical format", priceDelta: 79 },
      ],
    },
    {
      id: "rollup-extras",
      label: "Extra adaptations",
      type: "select",
      choices: [
        { value: "print", label: "Roll-up only", priceDelta: 0 },
        { value: "poster", label: "Roll-up + poster", priceDelta: 79 },
        { value: "event", label: "Small event set", priceDelta: 149 },
      ],
    },
  ],
  "teczka-ofertowa": [
    {
      id: "folder-format",
      label: "Folder type",
      type: "radio",
      choices: [
        { value: "classic", label: "Classic A4", priceDelta: 0 },
        { value: "pocket", label: "A4 with pocket and business card slot", priceDelta: 49 },
        { value: "premium", label: "Premium / finished version", priceDelta: 89 },
      ],
    },
    {
      id: "folder-support",
      label: "Extra bundle",
      type: "select",
      choices: [
        { value: "folder", label: "Folder only", priceDelta: 0 },
        { value: "folder-paper", label: "Folder + letterhead", priceDelta: 79 },
        { value: "folder-sales", label: "Folder + sales PDF", priceDelta: 129 },
      ],
    },
  ],
};

export function getServiceShopConfig(locale: Locale, slug: string) {
  const source = locale === "en" ? serviceShopConfigEn : serviceShopConfigPl;
  return source[slug] ?? [];
}
