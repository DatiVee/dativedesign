import { useEffect, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent, type ReactNode } from "react";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  CreditCard,
  FileText,
  Layers,
  Megaphone,
  Package,
  PenTool,
  Phone,
  Share2,
  Sparkles,
  Star,
  Tag,
  type LucideIcon,
} from "lucide-react";
import { Link } from "wouter";
import { ContactSection } from "@/components/site/ContactSection";
import { SiteLayout } from "@/components/site/SiteLayout";
import { useLocale } from "@/contexts/LocaleContext";
import {
  getBlogPosts,
  getCompanyStats,
  getFaqs,
  getHomepageProjectsLocalized,
  getServices,
  getTestimonials,
} from "@/data/localizedSiteContent";
import { usePageMeta } from "@/hooks/usePageMeta";
import { isShopOnlyFaq } from "@/lib/faqVisibility";
import "@/styles/concept.css";

/**
 * KONCEPT 2026 – alternatywny wariant strony głównej (trasa /koncept, noindex).
 * Nie dotyka obecnej strony głównej. Korzysta z tych samych danych (siteContent),
 * nagłówka, stopki i formularza kontaktowego, więc można go 1:1 porównać z obecnym.
 * Style: client/src/styles/concept.css (opis użytych nowości CSS w nagłówku pliku).
 */

/* Usługi w siatce bento – kolejność = układ (1. i 6. kafelek są duże). */
const BENTO_SLUGS = [
  "projekt-logo",
  "branding",
  "projekt-etykiety",
  "projekt-opakowania",
  "projekt-wizytowki",
  "projekt-banera",
];

const SERVICE_ICONS: Record<string, LucideIcon> = {
  "projekt-logo": PenTool,
  branding: Layers,
  "projekt-etykiety": Tag,
  "projekt-opakowania": Package,
  "projekt-wizytowki": CreditCard,
  "projekt-banera": Megaphone,
  "social-media": Share2,
  "projekt-ulotki": FileText,
};

/** Zmienne CSS w atrybucie style (TS nie zna własnych właściwości). */
const cssVars = (vars: Record<string, string | number>) => vars as CSSProperties;

/** Czas lokalny studia (Europe/Warsaw), odświeżany co 15 s. */
function useLocalTime(locale: "pl" | "en") {
  const [time, setTime] = useState("");
  useEffect(() => {
    const format = new Intl.DateTimeFormat(locale === "en" ? "en-GB" : "pl-PL", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Europe/Warsaw",
    });
    const tick = () => setTime(format.format(new Date()));
    tick();
    const id = window.setInterval(tick, 15_000);
    return () => window.clearInterval(id);
  }, [locale]);
  return time;
}

function Label({ n, children }: { n?: string; children: ReactNode }) {
  return (
    <div className="c-label">
      {n ? <span className="c-label__n">({n})</span> : null}
      {children}
    </div>
  );
}

/** Liczba z licznikiem w czystym CSS: "300+" → cyfry animuje @property, sufiks jest złoty. */
function Stat({ value, label }: { value: string; label: string }) {
  const match = value.match(/^(\d+)\s*(.*)$/);
  return (
    <div className="c-stat">
      {match ? (
        <div className="c-num" style={cssVars({ "--c-n": Number(match[1]) })} aria-label={value}>
          {match[2] ? <span className="c-num__suffix">{match[2]}</span> : null}
        </div>
      ) : (
        <div className="c-num" style={cssVars({ "--c-n": 0 })}>
          {value}
        </div>
      )}
      <div className="c-stat__label">{label}</div>
    </div>
  );
}

function Stars({ count }: { count: number }) {
  return (
    <span className="c-stars" aria-hidden="true">
      {Array.from({ length: count }).map((_, index) => (
        <Star key={index} size={13} className="fill-current" />
      ))}
    </span>
  );
}

export default function HomeConcept() {
  const { locale, getBlogPostPath, getPortfolioDetailPath, getStaticPath } = useLocale();
  const projects = getHomepageProjectsLocalized(locale);
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
  const time = useLocalTime(locale);
  const trackRef = useRef<HTMLDivElement>(null);

  usePageMeta(
    locale === "en" ? "Concept 2026 | DatiVe Design" : "Koncept 2026 | DatiVe Design",
    locale === "en"
      ? "Design concept of the new DatiVe Design homepage."
      : "Koncepcja nowej strony głównej DatiVe Design.",
    { locale, path: getStaticPath("concept"), robots: "noindex, follow" },
  );

  const t =
    locale === "en"
      ? {
          status: "Taking on new projects",
          h1a: "A brand people",
          h1b: "notice.",
          lede:
            "Visual identities, labels, print and advertising design. For companies in Rzeszów, Kolbuszowa and across Poland – from the first sketch to print-ready files.",
          primary: "See portfolio",
          secondary: "Get in touch",
          scroll: "Scroll",
          meta: [
            ["Studio", "Rzeszów · Kolbuszowa"],
            ["Local time", time],
            ["Reply", "within 24h, business days"],
            ["Collaboration", "direct, no middlemen"],
          ],
          workKicker: "Selected work",
          workTitle: "Every project",
          workAccent: "has an outcome.",
          workDesc:
            "Labels, branding, business cards and promotional materials. For each case I note what had to work – and what did.",
          workAll: "Full portfolio",
          workCount: "projects",
          open: "View project",
          prev: "Previous project",
          next: "Next project",
          servicesKicker: "Scope",
          servicesTitle: "What I can",
          servicesAccent: "do for you.",
          servicesDesc:
            "From logo and identity to labels, print and ad graphics. One designer, one consistent style – no hand-offs between departments.",
          numbersKicker: "In numbers",
          processKicker: "Process",
          processTitle: "From brief",
          processAccent: "to files.",
          processDesc: "Four stages, each with a concrete result. You know where things stand before you have to ask.",
          resultLabel: "Result",
          reviewsKicker: "Reviews",
          reviewsPill: "100% recommendations · 5/5",
          reviewsAll: "All reviews",
          ctaKicker: "Got a project?",
          ctaTitle: "Let’s talk about",
          ctaAccent: "your brand.",
          ctaDesc: "A few sentences about what you need is enough to start. I reply within 24 hours on business days.",
          ctaForm: "Contact form",
          faqKicker: "Good to know",
          faqTitle: "Before",
          faqAccent: "we start.",
          faqAll: "Full FAQ",
          blogKicker: "From the blog",
          blogAll: "Go to blog",
        }
      : {
          status: "Przyjmuję nowe projekty",
          h1a: "Marka, którą",
          h1b: "widać.",
          lede:
            "Identyfikacje wizualne, etykiety, materiały drukowane i grafika reklamowa. Dla firm z Rzeszowa, Kolbuszowej i całej Polski – od pierwszego szkicu po pliki gotowe do druku.",
          primary: "Zobacz portfolio",
          secondary: "Napisz do nas",
          scroll: "Przewiń",
          meta: [
            ["Studio", "Rzeszów · Kolbuszowa"],
            ["Czas lokalny", time],
            ["Odpowiedź", "do 24h w dni robocze"],
            ["Współpraca", "bezpośrednio, bez pośredników"],
          ],
          workKicker: "Wybrane realizacje",
          workTitle: "Każdy projekt",
          workAccent: "ma swój efekt.",
          workDesc:
            "Etykiety, branding, wizytówki i materiały reklamowe. Przy każdej realizacji zapisuję, co miało zadziałać – i co zadziałało.",
          workAll: "Pełne portfolio",
          workCount: "projektów",
          open: "Zobacz projekt",
          prev: "Poprzedni projekt",
          next: "Następny projekt",
          servicesKicker: "Zakres",
          servicesTitle: "Co mogę dla Ciebie",
          servicesAccent: "zrobić.",
          servicesDesc:
            "Od logo i identyfikacji po etykiety, druk i grafikę reklamową. Jeden projektant, jeden spójny styl – bez przekazywania projektu między działami.",
          numbersKicker: "W liczbach",
          processKicker: "Proces",
          processTitle: "Od briefu",
          processAccent: "do plików.",
          processDesc: "Cztery etapy, każdy z konkretnym wynikiem. Wiesz, na czym stoimy, zanim zapytasz.",
          resultLabel: "Wynik etapu",
          reviewsKicker: "Opinie",
          reviewsPill: "100% rekomendacji · ocena 5/5",
          reviewsAll: "Wszystkie opinie",
          ctaKicker: "Masz projekt?",
          ctaTitle: "Porozmawiajmy",
          ctaAccent: "o Twojej marce.",
          ctaDesc: "Kilka zdań o tym, czego potrzebujesz, wystarczy na start. Odpowiadam do 24 godzin w dni robocze.",
          ctaForm: "Formularz kontaktowy",
          faqKicker: "Warto wiedzieć",
          faqTitle: "Zanim",
          faqAccent: "zaczniemy.",
          faqAll: "Pełne FAQ",
          blogKicker: "Z bloga",
          blogAll: "Przejdź do bloga",
        };

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

  const scrollTrack = (direction: 1 | -1) => {
    const track = trackRef.current;
    if (!track) return;
    const card = track.firstElementChild as HTMLElement | null;
    const step = card ? card.offsetWidth + 14 : track.clientWidth * 0.8;
    track.scrollBy({ left: direction * step, behavior: "smooth" });
  };

  /* Reflektor pod kursorem na kafelkach bento – tylko dla myszy. */
  const spotlight = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== "mouse") return;
    const tile = (event.target as HTMLElement).closest<HTMLElement>(".c-tile");
    if (!tile) return;
    const rect = tile.getBoundingClientRect();
    tile.style.setProperty("--mx", `${event.clientX - rect.left}px`);
    tile.style.setProperty("--my", `${event.clientY - rect.top}px`);
  };

  const [leadReview, ...moreReviews] = testimonials;

  return (
    <SiteLayout>
      <div className="c-thread" aria-hidden="true" />
      <div className="c-root">
        {/* ---------- HERO: sama typografia, przyklejone; treść wjeżdża na nie jak kartka ---------- */}
        <section className="c-hero fx-grain">
          <div className="c-hero__bg" aria-hidden="true" />
          <div className="c-hero__grid" aria-hidden="true" />
          <div className="c-hero__inner container">
            <div className="c-hero__copy">
              <div className="c-status c-in" style={cssVars({ "--i": 0 })}>
                <span className="c-dot" aria-hidden="true" />
                {t.status}
              </div>
              <h1 className="c-h c-h--hero c-in" style={cssVars({ "--i": 1 })}>
                <span className="block">{t.h1a}</span>
                <span className="block">
                  <span className="c-accent">{t.h1b}</span>
                </span>
              </h1>
              <p className="c-lede c-in" style={cssVars({ "--i": 2 })}>
                {t.lede}
              </p>
              <div className="c-hero__actions c-in" style={cssVars({ "--i": 3 })}>
                <Link href={getStaticPath("portfolio")} className="c-btn c-btn--gold gold-button-shimmer">
                  {t.primary}
                  <ArrowRight size={15} />
                </Link>
                <a href="#kontakt" className="c-btn c-btn--glass">
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
          {/* ---------- (01) REALIZACJE: karuzela CSS ---------- */}
          <section className="c-work c-section" id="realizacje">
            <div className="container">
              <div className="c-head c-reveal">
                <div>
                  <Label n="01">{t.workKicker}</Label>
                  <h2 className="c-h c-h--section">
                    <span className="block">{t.workTitle}</span>
                    <span className="block">
                      <span className="c-accent">{t.workAccent}</span>
                    </span>
                  </h2>
                </div>
                <div className="c-head__side">
                  <p className="c-dim">{t.workDesc}</p>
                  <div className="c-arrows">
                    <button type="button" className="c-arrow" onClick={() => scrollTrack(-1)} aria-label={t.prev}>
                      <ArrowLeft size={18} />
                    </button>
                    <button type="button" className="c-arrow" onClick={() => scrollTrack(1)} aria-label={t.next}>
                      <ArrowRight size={18} />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="c-track" ref={trackRef}>
              {projects.map((project, index) => (
                <Link
                  key={project.slug}
                  href={getPortfolioDetailPath(project.slug)}
                  className="c-card c-glow"
                  aria-label={`${t.open}: ${project.title}`}
                >
                  <img src={project.image} alt="" loading={index < 2 ? "eager" : "lazy"} />
                  <div className="c-card__body">
                    <div className="c-label">
                      <span className="c-label__n">{String(index + 1).padStart(2, "0")}</span>
                      {project.category}
                    </div>
                    <h3 className="c-card__title">{project.title}</h3>
                    <p className="c-card__summary">{project.summary}</p>
                    <span className="c-card__cta">
                      {t.open}
                      <ArrowUpRight size={14} />
                    </span>
                  </div>
                </Link>
              ))}
            </div>

            <div className="container">
              <div className="c-progress" aria-hidden="true" />
              <div className="c-work__foot">
                <Link href={getStaticPath("portfolio")} className="c-link">
                  {t.workAll}
                  <ArrowRight size={14} />
                </Link>
                <span className="c-label">
                  <span className="c-label__n">{String(projects.length).padStart(2, "0")}</span>
                  {t.workCount}
                </span>
              </div>
            </div>
          </section>

          {/* ---------- (02) ZAKRES: bento + reflektor pod kursorem ---------- */}
          <section className="c-section">
            <div className="container">
              <div className="c-head c-reveal">
                <div>
                  <Label n="02">{t.servicesKicker}</Label>
                  <h2 className="c-h c-h--section">
                    <span className="block">{t.servicesTitle}</span>
                    <span className="block">
                      <span className="c-accent">{t.servicesAccent}</span>
                    </span>
                  </h2>
                </div>
                <div className="c-head__side">
                  <p className="c-dim">{t.servicesDesc}</p>
                </div>
              </div>

              <div className="c-bento c-reveal" onPointerMove={spotlight}>
                {bento.map((service, index) => {
                  const Icon = SERVICE_ICONS[service.slug] ?? Sparkles;
                  const big = index === 0 || index === 5;
                  return (
                    <article key={service.slug} className={`c-tile c-glass c-glow${big ? " c-tile--big" : ""}`}>
                      <div className="flex items-start justify-between gap-4">
                        <span className="c-tile__icon">
                          <Icon size={18} />
                        </span>
                        <span className="c-tile__cat">{service.category}</span>
                      </div>
                      <div>
                        <h3 className="c-tile__name">{service.name}</h3>
                        <p className="c-tile__tag">{service.tagline}</p>
                      </div>
                      {big ? <img className="c-tile__art" src={service.coverImage} alt="" loading="lazy" /> : null}
                    </article>
                  );
                })}
              </div>
            </div>
          </section>

          {/* ---------- (03) LICZBY: licznik w CSS ---------- */}
          <section className="c-section--tight">
            <div className="container c-reveal">
              <Label n="03">{t.numbersKicker}</Label>
              <div className="c-stats">
                {stats.map((stat) => (
                  <Stat key={stat.label} value={stat.value} label={stat.label} />
                ))}
              </div>
            </div>
          </section>

          {/* ---------- (04) PROCES: karty przyklejone, układane w stos ---------- */}
          <section className="c-section">
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

          {/* ---------- (05) OPINIE ---------- */}
          {leadReview ? (
            <section className="c-section">
              <div className="container c-reviews__grid">
                <div className="c-reveal">
                  <Label n="05">{t.reviewsKicker}</Label>
                  <div className="c-quote-mark" aria-hidden="true">
                    „
                  </div>
                  <blockquote className="c-quote">{leadReview.quote}</blockquote>
                  <div className="c-quote__who">
                    <b>{leadReview.name}</b> · {leadReview.company}
                  </div>
                  <div className="c-pill">
                    <Stars count={leadReview.rating} />
                    {t.reviewsPill}
                  </div>
                  <div>
                    <Link href={getStaticPath("reviews")} className="c-link">
                      {t.reviewsAll}
                      <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
                <div className="c-reviews__side c-reveal">
                  {moreReviews.slice(0, 2).map((review) => (
                    <article key={review.id} className="c-glass c-glow c-mini">
                      <Stars count={review.rating} />
                      <p className="c-mini__quote">„{review.quote}”</p>
                      <div className="c-mini__who">
                        <b>{review.name}</b> · {review.company}
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            </section>
          ) : null}

          {/* ---------- CTA: wielki adres e-mail ---------- */}
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
                <a href="mailto:kontakt@dativedesign.com" className="c-mail">
                  kontakt@dativedesign.com
                </a>
                <div className="c-hero__actions">
                  <a href="#kontakt" className="c-btn c-btn--gold gold-button-shimmer">
                    {t.ctaForm}
                    <ArrowRight size={15} />
                  </a>
                  <a href="tel:+48796106675" className="c-btn c-btn--glass">
                    <Phone size={15} />
                    +48 796 106 675
                  </a>
                </div>
              </div>
            </div>
          </section>

          {/* ---------- (06) FAQ (natywny akordeon) + BLOG ---------- */}
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
      </div>
    </SiteLayout>
  );
}
