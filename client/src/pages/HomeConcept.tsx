import { useCallback, useState, type CSSProperties, type MouseEvent as ReactMouseEvent, type ReactNode } from "react";
import { ArrowRight, Phone, Star } from "lucide-react";
import { Link } from "wouter";
import { CommandPalette } from "@/components/concept/CommandPalette";
import { ConceptCursor } from "@/components/concept/ConceptCursor";
import { ConceptDock } from "@/components/concept/ConceptDock";
import { CopyEmail } from "@/components/concept/CopyEmail";
import { IntroCurtain } from "@/components/concept/IntroCurtain";
import { KineticHeadline } from "@/components/concept/KineticHeadline";
import { ReviewDeck } from "@/components/concept/ReviewDeck";
import { ServiceBento } from "@/components/concept/ServiceBento";
import { ShaderBackdrop } from "@/components/concept/ShaderBackdrop";
import { StatementReveal } from "@/components/concept/StatementReveal";
import { VelocityMarquee } from "@/components/concept/VelocityMarquee";
import { WorkShowcase } from "@/components/concept/WorkShowcase";
import { prefersReducedMotion, scrollToSection, useFinePointer, useReducedMotion } from "@/components/concept/fx";
import { ContactSection } from "@/components/site/ContactSection";
import { SiteLayout } from "@/components/site/SiteLayout";
import { useLocale } from "@/contexts/LocaleContext";
import {
  getBlogPosts,
  getCompanyStats,
  getFaqs,
  getHomepageProjectsLocalized,
  getProjects,
  getServices,
  getTestimonials,
} from "@/data/localizedSiteContent";
import { usePageMeta } from "@/hooks/usePageMeta";
import { isShopOnlyFaq } from "@/lib/faqVisibility";
import "@/styles/concept.css";
import "@/styles/concept-fx.css";

/**
 * KONCEPT 2026 (v2) – alternatywny wariant strony głównej (trasa /koncept, noindex).
 * Obecna strona główna bez zmian. Te same dane, nagłówek, stopka i formularz.
 * Interakcje: client/src/components/concept/*, style: concept.css + concept-fx.css.
 */

const BENTO_SLUGS = ["projekt-logo", "branding", "projekt-etykiety", "projekt-opakowania", "projekt-wizytowki", "projekt-banera"];
const INTRO_KEY = "dative-concept-intro";
const EMAIL = "kontakt@dativedesign.com";

const cssVars = (vars: Record<string, string | number>) => vars as CSSProperties;

function shouldPlayIntro() {
  if (prefersReducedMotion() || window.location.hash) return false;
  try {
    return window.sessionStorage.getItem(INTRO_KEY) !== "seen";
  } catch {
    return false;
  }
}

function Label({ n, children }: { n?: string; children: ReactNode }) {
  return (
    <div className="c-label">
      {n ? <span className="c-label__n">({n})</span> : null}
      {children}
    </div>
  );
}

/** "300+" → licznik w czystym CSS (@property), sufiks złoty. */
function Stat({ value, label }: { value: string; label: string }) {
  const match = value.match(/^(\d+)\s*(.*)$/);
  return (
    <div className="c-stat">
      {match ? (
        <div className="c-num" style={cssVars({ "--c-n": Number(match[1]) })} aria-label={value}>
          {match[2] ? <span className="c-num__suffix">{match[2]}</span> : null}
        </div>
      ) : (
        <div className="c-num">{value}</div>
      )}
      <div className="c-stat__label">{label}</div>
    </div>
  );
}

export default function HomeConcept() {
  const { locale, getBlogPostPath, getPortfolioDetailPath, getStaticPath } = useLocale();
  const finePointer = useFinePointer();
  const reducedMotion = useReducedMotion();
  const [playIntro] = useState(shouldPlayIntro);
  const [introState, setIntroState] = useState<"pending" | "done">(playIntro ? "pending" : "done");
  const [paletteOpen, setPaletteOpen] = useState(false);

  const homepageProjects = getHomepageProjectsLocalized(locale);
  const allProjects = getProjects(locale);
  const services = getServices(locale);
  const bento = BENTO_SLUGS.map((slug) => services.find((service) => service.slug === slug)).filter(
    (service): service is NonNullable<typeof service> => Boolean(service),
  );
  const stats = getCompanyStats(locale);
  const testimonials = getTestimonials(locale);
  const faqs = getFaqs(locale)
    .filter((faq) => !isShopOnlyFaq(faq))
    .slice(0, 5);
  const posts = getBlogPosts(locale).slice(0, 3);

  const onReveal = useCallback(() => {
    try {
      window.sessionStorage.setItem(INTRO_KEY, "seen");
    } catch {
      /* prywatne okno / zablokowane dane witryny – intro po prostu zagra ponownie */
    }
    setIntroState("done");
  }, []);

  const openPalette = useCallback(() => setPaletteOpen(true), []);

  const goTo = (id: string) => (event: ReactMouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    scrollToSection(id);
  };

  usePageMeta(
    locale === "en" ? "Concept 2026 | DatiVe Design" : "Koncept 2026 | DatiVe Design",
    locale === "en" ? "Design concept of the new DatiVe Design homepage." : "Koncepcja nowej strony głównej DatiVe Design.",
    { locale, path: getStaticPath("concept"), robots: "noindex, follow" },
  );

  const t =
    locale === "en"
      ? {
          introTag: "Graphic design studio · Rzeszów / Kolbuszowa",
          status: "Taking on new projects",
          h1a: "A brand people",
          h1b: "notice.",
          lede: "Visual identities, labels, print and advertising design. For companies in Rzeszów, Kolbuszowa and across Poland – from the first sketch to print-ready files.",
          primary: "See portfolio",
          secondary: "Get in touch",
          scroll: "Scroll",
          meta: [
            ["Studio", "Rzeszów · Kolbuszowa"],
            ["Reply", "within 24h, business days"],
            ["Collaboration", "direct, no middlemen"],
          ],
          marquee: ["Logo", "Branding", "Labels", "Packaging", "Business cards", "Print", "Advertising", "Social media"],
          work: {
            kicker: "Selected work",
            title: "Every project",
            accent: "has an outcome.",
            desc: "Labels, branding, business cards and promotional materials. For each case I note what had to work – and what did.",
            hint: "Keep scrolling – the work slides sideways",
            all: "Full portfolio",
            open: "View",
            prev: "Previous project",
            next: "Next project",
            count: "projects",
            endTitle: "See all projects",
          },
          statementKicker: "In short",
          statement:
            "I design *visual identities,* labels and print materials for companies in Rzeszów, Kolbuszowa and across Poland. You work *directly with me* – from the brief to *print-ready files.*",
          services: {
            kicker: "Scope",
            title: "What I can",
            accent: "do for you.",
            desc: "From logo and identity to labels, print and ad graphics. Open a card to see what you get.",
            more: "Details",
            benefits: "What you gain",
            deliverables: "What you get",
            related: "Example projects",
            open: "View",
            ask: "Ask about this project",
            call: "Call",
            close: "Close",
            prefill: (name: string) => `Hello, I'm interested in: ${name}.\n\n`,
          },
          numbersKicker: "In numbers",
          processKicker: "Process",
          processTitle: "From brief",
          processAccent: "to files.",
          processDesc: "Four stages, each with a concrete result. You know where things stand before you have to ask.",
          resultLabel: "Result",
          reviewsKicker: "Reviews",
          reviewsTitle: "What clients",
          reviewsAccent: "say.",
          reviewsPill: "100% recommendations · 5/5",
          reviewsHint: "Drag a card or use the arrows",
          reviewsAll: "All reviews",
          deck: { prev: "Previous review", next: "Next review", drag: "Drag" },
          ctaKicker: "Got a project?",
          ctaTitle: "Let’s talk about",
          ctaAccent: "your brand.",
          ctaDesc: "A few sentences about what you need is enough to start. I reply within 24 hours on business days.",
          email: { copy: "Copy", copied: "Copied", hint: "Click the address to copy it", open: "Open in mail app" },
          ctaForm: "Contact form",
          faqKicker: "Good to know",
          faqTitle: "Before",
          faqAccent: "we start.",
          faqAll: "Full FAQ",
          blogKicker: "From the blog",
          blogAll: "Go to blog",
          dock: { nav: "Page navigation", top: "Back to top", palette: "Open command palette", cta: "Contact" },
          sections: ["Work", "Scope", "Numbers", "Process", "Reviews", "Contact"],
        }
      : {
          introTag: "Studio graficzne · Rzeszów / Kolbuszowa",
          status: "Przyjmuję nowe projekty",
          h1a: "Marka, którą",
          h1b: "widać.",
          lede: "Identyfikacje wizualne, etykiety, materiały drukowane i grafika reklamowa. Dla firm z Rzeszowa, Kolbuszowej i całej Polski – od pierwszego szkicu po pliki gotowe do druku.",
          primary: "Zobacz portfolio",
          secondary: "Napisz do nas",
          scroll: "Przewiń",
          meta: [
            ["Studio", "Rzeszów · Kolbuszowa"],
            ["Odpowiedź", "do 24h w dni robocze"],
            ["Współpraca", "bezpośrednio, bez pośredników"],
          ],
          marquee: ["Logo", "Branding", "Etykiety", "Opakowania", "Wizytówki", "Druk", "Reklama", "Social media"],
          work: {
            kicker: "Wybrane realizacje",
            title: "Każdy projekt",
            accent: "ma swój efekt.",
            desc: "Etykiety, branding, wizytówki i materiały reklamowe. Przy każdej realizacji zapisuję, co miało zadziałać – i co zadziałało.",
            hint: "Przewijaj – realizacje przesuną się w bok",
            all: "Pełne portfolio",
            open: "Zobacz",
            prev: "Poprzedni projekt",
            next: "Następny projekt",
            count: "realizacji",
            endTitle: "Zobacz wszystkie realizacje",
          },
          statementKicker: "W skrócie",
          statement:
            "Projektuję *identyfikacje wizualne,* etykiety i materiały drukowane dla firm z Rzeszowa, Kolbuszowej i całej Polski. Pracujesz *bezpośrednio ze mną* – od briefu po pliki *gotowe do druku.*",
          services: {
            kicker: "Zakres",
            title: "Co mogę dla Ciebie",
            accent: "zrobić.",
            desc: "Od logo i identyfikacji po etykiety, druk i grafikę reklamową. Otwórz kartę, żeby zobaczyć, co dostajesz.",
            more: "Szczegóły",
            benefits: "Co zyskujesz",
            deliverables: "Co dostajesz",
            related: "Przykładowe realizacje",
            open: "Zobacz",
            ask: "Zapytaj o ten projekt",
            call: "Zadzwoń",
            close: "Zamknij",
            prefill: (name: string) => `Dzień dobry, interesuje mnie: ${name}.\n\n`,
          },
          numbersKicker: "W liczbach",
          processKicker: "Proces",
          processTitle: "Od briefu",
          processAccent: "do plików.",
          processDesc: "Cztery etapy, każdy z konkretnym wynikiem. Wiesz, na czym stoimy, zanim zapytasz.",
          resultLabel: "Wynik etapu",
          reviewsKicker: "Opinie",
          reviewsTitle: "Co mówią",
          reviewsAccent: "klienci.",
          reviewsPill: "100% rekomendacji · ocena 5/5",
          reviewsHint: "Przeciągnij kartę albo użyj strzałek",
          reviewsAll: "Wszystkie opinie",
          deck: { prev: "Poprzednia opinia", next: "Następna opinia", drag: "Przeciągnij" },
          ctaKicker: "Masz projekt?",
          ctaTitle: "Porozmawiajmy",
          ctaAccent: "o Twojej marce.",
          ctaDesc: "Kilka zdań o tym, czego potrzebujesz, wystarczy na start. Odpowiadam do 24 godzin w dni robocze.",
          email: { copy: "Kopiuj", copied: "Skopiowano", hint: "Kliknij adres, żeby go skopiować", open: "Otwórz w poczcie" },
          ctaForm: "Formularz kontaktowy",
          faqKicker: "Warto wiedzieć",
          faqTitle: "Zanim",
          faqAccent: "zaczniemy.",
          faqAll: "Pełne FAQ",
          blogKicker: "Z bloga",
          blogAll: "Przejdź do bloga",
          dock: { nav: "Nawigacja po stronie", top: "Wróć na górę", palette: "Otwórz paletę poleceń", cta: "Napisz" },
          sections: ["Realizacje", "Zakres", "Liczby", "Proces", "Opinie", "Kontakt"],
        };

  const sectionIds = ["realizacje", "zakres", "liczby", "proces", "opinie", "kontakt"];
  const sections = sectionIds.map((id, index) => ({ id, label: t.sections[index] }));

  const steps: [string, string, string][] =
    locale === "en"
      ? [
          ["Brief", "We define the goal, scope and deadline – in plain words.", "Clear scope, deadline and price in one message."],
          ["Direction", "You get a visual concept matched to your brand and audience.", "A concept to approve before refinement starts."],
          ["Refinement", "We polish it based on feedback that moves the project forward.", "Revisions within the agreed rounds – no surprises."],
          ["Handoff", "You receive ready-to-use files for web, print and rollout.", "Production files for print and screen (PDF, SVG, PNG, JPG)."],
        ]
      : [
          ["Brief", "Ustalamy cel, zakres i termin – prostym językiem.", "Jasny zakres, termin i wycena w jednej wiadomości."],
          ["Kierunek", "Dostajesz koncepcję wizualną dopasowaną do marki i odbiorcy.", "Koncepcja do akceptacji, zanim ruszy dopracowanie."],
          ["Dopracowanie", "Szlifujemy projekt na bazie uwag, które realnie go rozwijają.", "Poprawki w ustalonych rundach – bez niespodzianek."],
          ["Przekazanie", "Odbierasz gotowe pliki pod web, druk i wdrożenie.", "Pliki produkcyjne do druku i na ekran (PDF, SVG, PNG, JPG)."],
        ];

  return (
    <SiteLayout>
      <div className="c-root" data-intro={introState}>
        {playIntro ? <IntroCurtain brand="DatiVe" accent="Design" tagline={t.introTag} onReveal={onReveal} /> : null}
        {finePointer && !reducedMotion ? <ConceptCursor /> : null}

        {/* ---------- HERO ---------- */}
        <section className="c-hero fx-grain" id="start">
          <div className="c-hero__bg" aria-hidden="true">
            <ShaderBackdrop />
          </div>
          <div className="c-hero__grid" aria-hidden="true" />
          <div className="c-hero__inner container">
            <div className="c-hero__copy">
              <div className="c-status c-in" style={cssVars({ "--i": 0 })}>
                <span className="c-dot" aria-hidden="true" />
                {t.status}
              </div>
              <KineticHeadline
                className="c-h c-h--hero"
                interactive={finePointer && !reducedMotion}
                lines={[{ text: t.h1a }, { text: t.h1b, accent: true }]}
              />
              <p className="c-lede c-in" style={cssVars({ "--i": 2 })}>
                {t.lede}
              </p>
              <div className="c-hero__actions c-in" style={cssVars({ "--i": 3 })}>
                <Link href={getStaticPath("portfolio")} className="c-btn c-btn--gold gold-button-shimmer" data-magnetic="0.3">
                  {t.primary}
                  <ArrowRight size={15} />
                </Link>
                <a href="#kontakt" className="c-btn c-btn--glass" data-magnetic="0.3" onClick={goTo("kontakt")}>
                  {t.secondary}
                </a>
              </div>
            </div>

            <aside className="c-glass c-ring c-meta c-in" style={cssVars({ "--i": 4 })}>
              {t.meta.map(([key, value]) => (
                <div key={key} className="c-meta__row">
                  <span className="c-meta__k">{key}</span>
                  <span className="c-meta__v">{value}</span>
                </div>
              ))}
              <div className="c-meta__coords">50.04° N · 22.00° E</div>
            </aside>
          </div>
          <div className="c-hero__foot container">
            <div className="c-scrollhint c-in" style={cssVars({ "--i": 5 })}>
              {t.scroll}
            </div>
          </div>
        </section>

        <div className="c-sheet">
          <VelocityMarquee items={t.marquee} />

          <WorkShowcase
            projects={homepageProjects}
            labels={t.work}
            portfolioPath={getStaticPath("portfolio")}
            getProjectPath={getPortfolioDetailPath}
          />

          <StatementReveal kicker={t.statementKicker} text={t.statement} />

          <ServiceBento services={bento} projects={allProjects} labels={t.services} getProjectPath={getPortfolioDetailPath} />

          {/* ---------- (03) LICZBY ---------- */}
          <section className="c-section--tight" id="liczby">
            <div className="container c-reveal">
              <Label n="03">{t.numbersKicker}</Label>
              <div className="c-stats">
                {stats.map((stat) => (
                  <Stat key={stat.label} value={stat.value} label={stat.label} />
                ))}
              </div>
            </div>
          </section>

          {/* ---------- (04) PROCES ---------- */}
          <section className="c-section" id="proces">
            <div className="container">
              <div className="c-head c-reveal">
                <div>
                  <Label n="04">{t.processKicker}</Label>
                  <h2 className="c-h c-h--section">
                    <span className="block">{t.processTitle}</span>
                    <span className="block">
                      <span className="c-accent">{t.processAccent}</span>
                    </span>
                  </h2>
                </div>
                <div className="c-head__side">
                  <p className="c-dim">{t.processDesc}</p>
                </div>
              </div>
              <div className="c-steps">
                {steps.map(([title, text, result], index) => (
                  <article key={title} className="c-step c-glass" style={cssVars({ "--i": index })}>
                    <div>
                      <div className="c-step__num">{String(index + 1).padStart(2, "0")}</div>
                      <h3 className="c-h c-h--sub">{title}</h3>
                    </div>
                    <div className="c-step__body">
                      <p className="c-lede">{text}</p>
                      <div className="c-step__result">
                        <span className="c-label">
                          <span className="c-label__n">→</span>
                          {t.resultLabel}
                        </span>
                        <span>{result}</span>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>

          {/* ---------- (05) OPINIE: talia kart ---------- */}
          {testimonials.length ? (
            <section className="c-section" id="opinie">
              <div className="container c-reviews2">
                <div className="c-reveal">
                  <Label n="05">{t.reviewsKicker}</Label>
                  <h2 className="c-h c-h--section">
                    <span className="block">{t.reviewsTitle}</span>
                    <span className="block">
                      <span className="c-accent">{t.reviewsAccent}</span>
                    </span>
                  </h2>
                  <div className="c-pill">
                    <span className="c-stars" aria-hidden="true">
                      {Array.from({ length: 5 }).map((_, index) => (
                        <Star key={index} size={13} className="fill-current" />
                      ))}
                    </span>
                    {t.reviewsPill}
                  </div>
                  <p className="c-reviews2__hint">
                    <span className="c-work__hint-line" aria-hidden="true" />
                    {t.reviewsHint}
                  </p>
                  <div>
                    <Link href={getStaticPath("reviews")} className="c-link">
                      {t.reviewsAll}
                      <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
                <ReviewDeck reviews={testimonials} labels={t.deck} />
              </div>
            </section>
          ) : null}

          {/* ---------- CTA ---------- */}
          <section className="c-section c-cta">
            <div className="container">
              <div className="c-cta__inner c-reveal">
                <Label>{t.ctaKicker}</Label>
                <h2 className="c-h c-h--section">
                  <span className="block">{t.ctaTitle}</span>
                  <span className="block">
                    <span className="c-accent">{t.ctaAccent}</span>
                  </span>
                </h2>
                <p className="c-lede">{t.ctaDesc}</p>
                <CopyEmail email={EMAIL} labels={t.email} />
                <div className="c-hero__actions">
                  <a href="#kontakt" className="c-btn c-btn--gold gold-button-shimmer" data-magnetic="0.3" onClick={goTo("kontakt")}>
                    {t.ctaForm}
                    <ArrowRight size={15} />
                  </a>
                  <a href="tel:+48796106675" className="c-btn c-btn--glass" data-magnetic="0.3">
                    <Phone size={15} />
                    +48 796 106 675
                  </a>
                </div>
              </div>
            </div>
          </section>

          {/* ---------- (06) FAQ + BLOG ---------- */}
          <section className="c-section">
            <div className="container c-faqblog">
              <div className="c-reveal">
                <Label n="06">{t.faqKicker}</Label>
                <h2 className="c-h c-h--section mt-5">
                  {t.faqTitle} <span className="c-accent">{t.faqAccent}</span>
                </h2>
                <div className="c-faq">
                  {faqs.map((faq) => (
                    <details key={faq.id} name="c-faq">
                      <summary>{faq.question}</summary>
                      <p>{faq.answer}</p>
                    </details>
                  ))}
                </div>
                <Link href={getStaticPath("faq")} className="c-link">
                  {t.faqAll}
                  <ArrowRight size={14} />
                </Link>
              </div>

              <div className="c-reveal">
                <Label>{t.blogKicker}</Label>
                <div className="c-posts">
                  {posts.map((post) => (
                    <Link key={post.slug} href={getBlogPostPath(post.slug)} className="c-post c-glass c-glow">
                      <div className="c-post__meta">
                        <b>{post.category}</b>
                        <i aria-hidden="true" />
                        <span>{post.readTime}</span>
                      </div>
                      <h3>{post.title}</h3>
                    </Link>
                  ))}
                </div>
                <Link href={getStaticPath("blog")} className="c-link">
                  {t.blogAll}
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          </section>

          <ContactSection />

          <div className="c-wordmark" aria-hidden="true">
            DatiVe
          </div>
        </div>

        <ConceptDock sections={sections} labels={t.dock} onOpenPalette={openPalette} />
        <CommandPalette open={paletteOpen} setOpen={setPaletteOpen} sections={sections} projects={allProjects} />
      </div>
    </SiteLayout>
  );
}
