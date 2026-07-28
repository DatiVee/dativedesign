import type { Locale } from "@/lib/localeRoutes";

export type BriefPrompt = {
  title: string;
  description: string;
  goalPlaceholder: string;
  audiencePlaceholder: string;
  visualPlaceholder: string;
  referencesPlaceholder: string;
  contentPlaceholder: string;
  deadlinePlaceholder: string;
  notesPlaceholder: string;
};

const briefPromptsPl: Record<string, BriefPrompt> = {
  "projekt-logo": {
    title: "Brief pod logo",
    description: "Zostaw konkrety o swojej marce, rynku i kierunku wizualnym.",
    goalPlaceholder: "Co logo ma osiągnąć? Np. wejście na rynek, odświeżenie marki, premium odbiór.",
    audiencePlaceholder: "Kto ma zobaczyć markę? Branża, typ klienta, grupa docelowa.",
    visualPlaceholder: "Jaki klimat ma mieć projekt? Minimal, premium, technicznie, odważnie.",
    referencesPlaceholder: "Linki do inspiracji, konkurencji albo rzeczy, których unikać.",
    contentPlaceholder: "Gdzie logo będzie używane? WWW, druk, opakowania, social media itd.",
    deadlinePlaceholder: "Czy jest konkretny termin wdrożenia lub premiery?",
    notesPlaceholder: "Dodatkowe uwagi, skojarzenia, kolory, symbole, zakazy.",
  },
  branding: {
    title: "Brief pod branding",
    description: "Potrzebne są informacje o marce, pozycjonowaniu i materiałach, które mają wejść do pierwszego etapu.",
    goalPlaceholder: "Co branding ma poprawić albo uporządkować w marce?",
    audiencePlaceholder: "Do kogo marka mówi i jak ma być odbierana?",
    visualPlaceholder: "Jakiego klimatu szukasz? Premium, nowocześnie, lifestyle, bardziej korporacyjnie.",
    referencesPlaceholder: "Linki do inspiracji, konkurencji albo marek z dobrym feelingiem.",
    contentPlaceholder: "Jakie materiały mają zostać objęte brandingiem w pierwszym etapie?",
    deadlinePlaceholder: "Czy branding jest potrzebny pod launch, kampanię albo konkretny termin?",
    notesPlaceholder: "Wszystko, co pomoże lepiej zrozumieć markę przed startem.",
  },
  "social-media": {
    title: "Brief pod social media",
    description: "Najważniejsze są styl komunikacji, typ publikacji i główny cel zestawu grafik.",
    goalPlaceholder: "Po co powstają te grafiki? Sprzedaż, regularna komunikacja, kampania, launch.",
    audiencePlaceholder: "Do jakich odbiorców mówisz w social media?",
    visualPlaceholder: "Jak ma wyglądać feed? Clean, premium, dynamicznie, bardziej sprzedażowo.",
    referencesPlaceholder: "Linki do profili, inspiracji, moodboardów albo konkurencji.",
    contentPlaceholder: "Jakie formaty i ile publikacji ma wejść w pakiet?",
    deadlinePlaceholder: "Kiedy grafiki są potrzebne do publikacji?",
    notesPlaceholder: "CTA, hasła, kolory, ograniczenia, dodatkowe info.",
  },
};

const fallbackPl: BriefPrompt = {
  title: "Brief projektowy",
  description: "Doprecyzuj zakres, styl i wszystko, co ma znaczenie przed startem projektu.",
  goalPlaceholder: "Jaki jest główny cel projektu?",
  audiencePlaceholder: "Do kogo ma trafiać projekt?",
  visualPlaceholder: "Jaki klimat wizualny ma mieć realizacja?",
  referencesPlaceholder: "Linki do inspiracji, przykładów albo konkurencji.",
  contentPlaceholder: "Format, treści, wymiary, liczba wersji lub inne parametry.",
  deadlinePlaceholder: "Czy jest konkretny termin realizacji?",
  notesPlaceholder: "Dodatkowe uwagi, ograniczenia albo ważne informacje.",
};

const briefPromptsEn: Record<string, BriefPrompt> = {
  "projekt-logo": {
    title: "Logo brief",
    description: "Leave concrete input about your brand, market and visual direction.",
    goalPlaceholder: "What should the logo achieve? Launch, refresh, premium perception, stronger recall.",
    audiencePlaceholder: "Who should notice the brand? Industry, client type, target audience.",
    visualPlaceholder: "What kind of tone should the logo have? Minimal, premium, technical, bold.",
    referencesPlaceholder: "Links to inspiration, competitors or things that should be avoided.",
    contentPlaceholder: "Where will the logo be used? Web, print, packaging, social media, signage.",
    deadlinePlaceholder: "Is there a launch date or a specific deadline?",
    notesPlaceholder: "Extra notes, colors, symbols, no-go directions or anything else that matters.",
  },
  branding: {
    title: "Branding brief",
    description: "The key inputs are positioning, market context and which assets should be covered in phase one.",
    goalPlaceholder: "What should the new branding fix, improve or clarify?",
    audiencePlaceholder: "Who is the brand speaking to and how should it feel to them?",
    visualPlaceholder: "What kind of tone are you after? Premium, modern, lifestyle, corporate.",
    referencesPlaceholder: "Share links to inspiration, competitor brands or visual references.",
    contentPlaceholder: "Which materials should be included in the first branding phase?",
    deadlinePlaceholder: "Is the branding needed for a launch, campaign or fixed date?",
    notesPlaceholder: "Anything else that will help shape the direction before the work starts.",
  },
  "social-media": {
    title: "Social media brief",
    description: "The most important inputs are tone of communication, content formats and the campaign goal.",
    goalPlaceholder: "What is this content for? Sales, regular communication, a launch, a campaign.",
    audiencePlaceholder: "Who are you talking to on social media?",
    visualPlaceholder: "What should the feed feel like? Clean, premium, dynamic, sales-focused.",
    referencesPlaceholder: "Drop links to profiles, moodboards, inspiration or competitors.",
    contentPlaceholder: "Which formats and how many pieces should be included?",
    deadlinePlaceholder: "When do these graphics need to go live?",
    notesPlaceholder: "CTA ideas, wording, colors, limitations or extra context.",
  },
};

const fallbackEn: BriefPrompt = {
  title: "Project brief",
  description: "Define the scope, tone and all practical details before production starts.",
  goalPlaceholder: "What is the main goal of the project?",
  audiencePlaceholder: "Who should the design speak to?",
  visualPlaceholder: "What kind of visual tone should the project have?",
  referencesPlaceholder: "Links to inspiration, examples or competitor references.",
  contentPlaceholder: "Formats, copy, dimensions, quantity or other production parameters.",
  deadlinePlaceholder: "Is there a specific delivery date?",
  notesPlaceholder: "Extra notes, restrictions or anything important for the execution.",
};

export function getBriefPrompt(locale: Locale, slug: string) {
  if (locale === "en") {
    return briefPromptsEn[slug] ?? fallbackEn;
  }

  return briefPromptsPl[slug] ?? fallbackPl;
}
