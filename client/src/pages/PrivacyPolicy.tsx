import { SectionHeading } from "@/components/site/SectionHeading";
import { SiteLayout } from "@/components/site/SiteLayout";
import { useLocale } from "@/contexts/LocaleContext";
import { usePageMeta } from "@/hooks/usePageMeta";

/*
 * Polityka prywatności (RODO + cookies). Treść jest wzorem przygotowanym na podstawie tego,
 * jak działa strona (formularz Web3Forms, hosting, Google Tag Manager z trybem zgody) –
 * przed publikacją warto, żeby przejrzał ją właściciel / prawnik.
 */

type Section = { heading: string; paragraphs?: string[]; items?: string[] };

const UPDATED = { pl: "21 września 2026 r.", en: "21 September 2026" };

const CONTENT: Record<"pl" | "en", { title: string; intro: string; sections: Section[] }> = {
  pl: {
    title: "Polityka prywatności",
    intro:
      "Poniżej znajdziesz informacje o tym, kto przetwarza Twoje dane osobowe, w jakim celu, jak długo i jakie masz prawa. Dotyczy to strony dativedesign.com, formularza kontaktowego oraz korespondencji e-mail i telefonicznej.",
    sections: [
      {
        heading: "1. Administrator danych",
        paragraphs: [
          "Administratorem Twoich danych osobowych jest DatiVe Design, 36-100 Świerczów, NIP 8141705913, REGON 545711992 (dalej: Administrator).",
          "W sprawach dotyczących danych osobowych napisz na kontakt@dativedesign.com albo zadzwoń: +48 796 106 675.",
        ],
      },
      {
        heading: "2. Jakie dane przetwarzam, w jakim celu i na jakiej podstawie",
        items: [
          "Formularz kontaktowy i korespondencja – imię i nazwisko, adres e-mail, treść wiadomości oraz inne dane, które sam podasz. Cel: odpowiedź na zapytanie, przygotowanie oferty i realizacja współpracy. Podstawa: art. 6 ust. 1 lit. b RODO (działania przed zawarciem umowy i jej wykonanie) oraz art. 6 ust. 1 lit. f RODO (prawnie uzasadniony interes – obsługa korespondencji).",
          "Rozliczenia – dane potrzebne do wystawienia faktury, jeśli dojdzie do współpracy. Podstawa: art. 6 ust. 1 lit. c RODO (obowiązki wynikające z przepisów podatkowych i rachunkowych).",
          "Statystyki i mierzenie skuteczności reklam – dane z plików cookies i podobnych technologii Google (np. identyfikatory urządzenia, przybliżona lokalizacja, sposób korzystania ze strony). Tylko po Twojej zgodzie, art. 6 ust. 1 lit. a RODO.",
          "Ustalenie, dochodzenie lub obrona roszczeń – art. 6 ust. 1 lit. f RODO.",
        ],
      },
      {
        heading: "3. Komu przekazuję dane",
        paragraphs: ["Dane mogą trafić wyłącznie do podmiotów, które pomagają prowadzić stronę i działalność:"],
        items: [
          "Web3Forms – obsługa formularza kontaktowego (przekazuje wiadomość na mój adres e-mail),",
          "dostawca hostingu strony (Railway) oraz dostawca poczty e-mail,",
          "Google Ireland Limited – Google Tag Manager, Google Analytics i Google Ads, tylko po zgodzie na pliki cookies,",
          "biuro rachunkowe oraz organy publiczne, jeśli wymagają tego przepisy.",
        ],
      },
      {
        heading: "4. Przekazywanie danych poza EOG",
        paragraphs: [
          "Niektórzy z tych dostawców mogą przetwarzać dane poza Europejskim Obszarem Gospodarczym, np. w USA. Odbywa się to na podstawie decyzji Komisji Europejskiej stwierdzającej odpowiedni stopień ochrony (EU–US Data Privacy Framework) albo standardowych klauzul umownych zatwierdzonych przez Komisję.",
        ],
      },
      {
        heading: "5. Jak długo przechowuję dane",
        items: [
          "korespondencję – przez czas potrzebny do odpowiedzi i współpracy, a później do upływu terminu przedawnienia ewentualnych roszczeń,",
          "dokumenty rozliczeniowe – przez okres wymagany przepisami podatkowymi,",
          "dane z plików cookies – do wycofania zgody albo wygaśnięcia plików w przeglądarce.",
        ],
      },
      {
        heading: "6. Twoje prawa",
        paragraphs: [
          "Masz prawo dostępu do swoich danych, ich sprostowania, usunięcia, ograniczenia przetwarzania, przenoszenia danych oraz wniesienia sprzeciwu wobec przetwarzania opartego na prawnie uzasadnionym interesie.",
          "Zgodę na pliki cookies możesz wycofać w każdej chwili – nie wpływa to na zgodność z prawem przetwarzania sprzed jej wycofania.",
          "Masz też prawo wnieść skargę do Prezesa Urzędu Ochrony Danych Osobowych (ul. Stawki 2, 00-193 Warszawa).",
        ],
      },
      {
        heading: "7. Pliki cookies",
        items: [
          "Niezbędne – zapamiętanie Twojego wyboru w banerze cookies (pamięć przeglądarki) i prawidłowe działanie strony. Nie wymagają zgody.",
          "Analityczne i marketingowe – Google Analytics i Google Ads uruchamiane przez Google Tag Manager. Zapisują pliki cookies dopiero po kliknięciu „Akceptuję”. Do tego czasu narzędzia Google działają w trybie ograniczonym (tryb zgody Google), bez zapisywania tych plików.",
        ],
        paragraphs: [
          "Swój wybór zmienisz w każdej chwili przez link „Ustawienia cookies” w stopce strony. Pliki cookies możesz też usunąć albo zablokować w ustawieniach przeglądarki.",
        ],
      },
      {
        heading: "8. Czy muszę podać dane",
        paragraphs: [
          "Podanie danych jest dobrowolne, ale bez adresu e-mail albo numeru telefonu nie odpowiem na Twoje zapytanie. Nie podejmuję wobec Ciebie decyzji w sposób zautomatyzowany, w tym w oparciu o profilowanie.",
        ],
      },
      {
        heading: "9. Zmiany polityki",
        paragraphs: ["Aktualna wersja polityki prywatności jest zawsze dostępna na tej stronie."],
      },
    ],
  },
  en: {
    title: "Privacy policy",
    intro:
      "This page explains who processes your personal data, why, for how long and what rights you have. It covers dativedesign.com, the contact form and e-mail or phone correspondence.",
    sections: [
      {
        heading: "1. Data controller",
        paragraphs: [
          "The controller of your personal data is DatiVe Design, 36-100 Świerczów, Poland, NIP (tax ID) 8141705913, REGON 545711992.",
          "For any data protection matters, write to kontakt@dativedesign.com or call +48 796 106 675.",
        ],
      },
      {
        heading: "2. What data, why and on what legal basis",
        items: [
          "Contact form and correspondence – name, e-mail address, message and any other data you provide, to answer your inquiry, prepare an offer and deliver the project (Art. 6(1)(b) and (f) GDPR).",
          "Invoicing – data needed to issue an invoice if we work together (Art. 6(1)(c) GDPR).",
          "Statistics and ad measurement – data from Google cookies and similar technologies, only with your consent (Art. 6(1)(a) GDPR).",
          "Establishing, exercising or defending legal claims (Art. 6(1)(f) GDPR).",
        ],
      },
      {
        heading: "3. Recipients",
        items: [
          "Web3Forms – contact form handling (forwards your message to my e-mail),",
          "the website hosting provider (Railway) and the e-mail provider,",
          "Google Ireland Limited – Google Tag Manager, Google Analytics and Google Ads, only after cookie consent,",
          "an accounting office and public authorities where required by law.",
        ],
      },
      {
        heading: "4. Transfers outside the EEA",
        paragraphs: [
          "Some providers may process data outside the European Economic Area, e.g. in the USA, based on the European Commission adequacy decision (EU–US Data Privacy Framework) or standard contractual clauses.",
        ],
      },
      {
        heading: "5. Retention",
        items: [
          "correspondence – as long as needed to reply and cooperate, then until possible claims become time-barred,",
          "accounting documents – for the period required by tax law,",
          "cookie data – until you withdraw consent or the cookies expire.",
        ],
      },
      {
        heading: "6. Your rights",
        paragraphs: [
          "You have the right to access, rectify and erase your data, restrict processing, data portability and to object to processing based on legitimate interest. You can withdraw cookie consent at any time without affecting prior processing. You may also lodge a complaint with the Polish supervisory authority (Prezes Urzędu Ochrony Danych Osobowych, ul. Stawki 2, 00-193 Warszawa).",
        ],
      },
      {
        heading: "7. Cookies",
        items: [
          "Essential – remembering your choice in the cookie banner (browser storage) and proper site operation. No consent required.",
          "Analytics and marketing – Google Analytics and Google Ads loaded via Google Tag Manager. Their cookies are stored only after you click “Accept”; until then Google tools run in a limited mode (Google Consent Mode) without storing them.",
        ],
        paragraphs: ["You can change your choice any time with the “Cookie settings” link in the footer or clear cookies in your browser."],
      },
      {
        heading: "8. Is providing data required",
        paragraphs: [
          "Providing data is voluntary, but without an e-mail address or phone number I cannot reply to your inquiry. No automated decision-making or profiling with legal effects takes place.",
        ],
      },
    ],
  },
};

export default function PrivacyPolicy() {
  const { locale, getStaticPath } = useLocale();
  const content = CONTENT[locale];

  usePageMeta(
    `${content.title} | DatiVe Design`,
    locale === "en"
      ? "How DatiVe Design processes personal data and uses cookies: controller, purposes, recipients, retention and your rights."
      : "Jak DatiVe Design przetwarza dane osobowe i używa plików cookies: administrator, cele, odbiorcy, okres przechowywania i Twoje prawa.",
    { locale, path: getStaticPath("privacy") },
  );

  return (
    <SiteLayout>
      <section className="container py-20 sm:py-24">
        <div className="max-w-3xl">
          <SectionHeading
            as="h1"
            eyebrow={locale === "en" ? "Privacy" : "RODO"}
            title={content.title}
            description={content.intro}
          />
          <p className="mt-4 text-xs uppercase tracking-[0.18em] text-white/40">
            {locale === "en" ? "Last updated: " : "Ostatnia aktualizacja: "}
            {UPDATED[locale]}
          </p>

          <div className="mt-12 grid gap-10">
            {content.sections.map((section) => (
              <section key={section.heading} className="border-t border-white/10 pt-8">
                <h2 className="font-display text-xl font-bold normal-case leading-[1.25] tracking-normal text-white">
                  {section.heading}
                </h2>
                {section.items ? (
                  <ul className="mt-4 grid gap-3">
                    {section.items.map((item) => (
                      <li key={item} className="relative pl-5 text-[15px] leading-relaxed text-white/68">
                        <span className="absolute left-0 top-[0.7em] h-1.5 w-1.5 rounded-full bg-gold/70" aria-hidden="true" />
                        {item}
                      </li>
                    ))}
                  </ul>
                ) : null}
                {section.paragraphs?.map((paragraph) => (
                  <p key={paragraph} className="mt-4 text-[15px] leading-relaxed text-white/68">
                    {paragraph}
                  </p>
                ))}
              </section>
            ))}
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
