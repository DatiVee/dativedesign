import { ArrowDown, ArrowRight, Check } from "lucide-react";
import { Link } from "wouter";
import { ContactSection } from "@/components/site/ContactSection";
import { Reveal } from "@/components/site/Reveal";
import { SectionHeading } from "@/components/site/SectionHeading";
import { SiteLayout } from "@/components/site/SiteLayout";
import { useLocale } from "@/contexts/LocaleContext";
import {
  getCompanyStats,
  getFaqs,
  getRelatedProjectsLocalized,
  getServiceBySlugLocalized,
} from "@/data/localizedSiteContent";
import { usePageMeta } from "@/hooks/usePageMeta";
import { track } from "@/lib/analytics";
import { isShopOnlyFaq } from "@/lib/faqVisibility";

/**
 * Strona usługi w trybie wizytówki (SHOP_ENABLED = false): bez cen, pakietów i koszyka.
 * Strona docelowa reklam Google Ads i wyników wyszukiwania dla fraz typu "projekt logo".
 * "Zapytaj o wycenę" wpisuje nazwę usługi do formularza kontaktowego na dole strony.
 * Przy włączonym sklepie te same adresy obsługuje pełna strona ServiceDetail.
 */

const SITE_URL = "https://dativedesign.com";

function prefersReducedMotion() {
  try {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  } catch {
    return false;
  }
}

export default function ServiceLanding({ slug }: { slug: string }) {
  const { locale, getStaticPath, getPortfolioDetailPath, getServicePath } = useLocale();
  const service = getServiceBySlugLocalized(locale, slug);
  const stats = getCompanyStats(locale);
  const trust = [stats[0], stats[1], stats[3]].filter(Boolean);
  const projects = service ? getRelatedProjectsLocalized(locale, service.portfolioSlugs) : [];
  const faqs = getFaqs(locale)
    .filter((faq) => !isShopOnlyFaq(faq))
    .slice(0, 4);

  const t =
    locale === "en"
      ? {
          kicker: "Graphic design studio · Rzeszów / Kolbuszowa",
          local: "Rzeszów, Kolbuszowa and remotely – for companies across Poland.",
          ask: "Ask for a quote",
          work: "See examples",
          gainKicker: "Benefits",
          gainTitle: "What you gain",
          filesKicker: "Deliverables",
          filesTitle: "What you get",
          workKicker: "Portfolio",
          workTitle: "Related projects",
          workDesc: "Real projects from this area – each case study describes the goal and the result.",
          processKicker: "Process",
          processTitle: "How we work",
          moreKicker: "Details",
          moreTitle: "More about this service",
          faqTitle: "Good to know",
          prefill: (name: string) => `Hello, I'm interested in: ${name}.\n\n`,
          notFound: "Service not found",
          back: "Back to home",
          titleSuffix: "graphic design studio",
        }
      : {
          kicker: "Studio graficzne · Rzeszów / Kolbuszowa",
          local: "Rzeszów, Kolbuszowa i zdalnie – dla firm z całej Polski.",
          ask: "Zapytaj o wycenę",
          work: "Zobacz realizacje",
          gainKicker: "Korzyści",
          gainTitle: "Co zyskujesz",
          filesKicker: "Pliki końcowe",
          filesTitle: "Co dostajesz",
          workKicker: "Portfolio",
          workTitle: "Powiązane realizacje",
          workDesc: "Prawdziwe projekty z tego zakresu – przy każdej realizacji opisany cel i efekt.",
          processKicker: "Proces",
          processTitle: "Jak wygląda współpraca",
          moreKicker: "Szczegóły",
          moreTitle: "Więcej o tej usłudze",
          faqTitle: "Warto wiedzieć",
          prefill: (name: string) => `Dzień dobry, interesuje mnie: ${name}.\n\n`,
          notFound: "Nie znaleziono usługi",
          back: "Wróć na stronę główną",
          titleSuffix: "Rzeszów, Kolbuszowa i cała Polska",
        };

  const steps =
    locale === "en"
      ? [
          ["Brief", "We define the goal, scope and deadline – in plain words."],
          ["Direction", "You get a visual concept matched to your brand and audience."],
          ["Refinement", "We polish it based on feedback that moves the project forward."],
          ["Handoff", "You receive ready-to-use files for web, print and rollout."],
        ]
      : [
          ["Brief", "Ustalamy cel, zakres i termin – prostym językiem."],
          ["Kierunek", "Dostajesz koncepcję wizualną dopasowaną do marki i odbiorcy."],
          ["Dopracowanie", "Szlifujemy projekt na bazie uwag, które realnie go rozwijają."],
          ["Przekazanie", "Odbierasz gotowe pliki pod web, druk i wdrożenie."],
        ];

  usePageMeta(
    service ? `${service.name} – ${t.titleSuffix} | DatiVe Design` : `${t.notFound} | DatiVe Design`,
    service?.shortDescription ?? t.notFound,
    { locale, path: service ? getServicePath(service.slug) : getStaticPath("home") },
  );

  if (!service) {
    return (
      <SiteLayout>
        <section className="container py-24">
          <SectionHeading as="h1" eyebrow="404" title={t.notFound} />
          <Link href={getStaticPath("home")} className="mt-8 inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-gold">
            {t.back}
            <ArrowRight size={16} />
          </Link>
        </section>
      </SiteLayout>
    );
  }

  const askForQuote = () => {
    window.dispatchEvent(new CustomEvent("dative:contact-prefill", { detail: { message: t.prefill(service.name) } }));
    document.getElementById("kontakt")?.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth", block: "start" });
    window.setTimeout(() => document.getElementById("contact-message")?.focus({ preventScroll: true }), 700);
    track("cta_click", { cta: "ask_quote", service: service.slug });
  };

  const schema = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: service.name,
    description: service.shortDescription,
    serviceType: service.category,
    url: `${SITE_URL}${getServicePath(service.slug)}`,
    areaServed: ["Rzeszów", "Kolbuszowa", "Polska"],
    provider: {
      "@type": "ProfessionalService",
      name: "DatiVe Design",
      url: `${SITE_URL}/`,
      telephone: "+48796106675",
      email: "kontakt@dativedesign.com",
    },
  };

  return (
    <SiteLayout>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />

      {/* ---------- HERO ---------- */}
      <section className="container py-14 sm:py-20">
        <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14">
          <div>
            <div className="section-label mb-4">{t.kicker}</div>
            <h1 className="font-display text-[2.2rem] font-black leading-[1.15] text-white sm:text-5xl lg:text-[3.6rem]">
              {service.name}
            </h1>
            <p className="mt-4 text-lg leading-relaxed text-gold sm:text-xl">{service.tagline}</p>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-white/68">{service.heroDescription}</p>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/50">{t.local}</p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <button
                type="button"
                onClick={askForQuote}
                className="gold-button-shimmer inline-flex items-center justify-center gap-2 rounded-sm px-8 py-4 text-sm font-black uppercase tracking-wider text-background"
              >
                {t.ask}
                <ArrowRight size={17} />
              </button>
              {projects.length ? (
                <a
                  href="#realizacje"
                  className="inline-flex items-center justify-center gap-2 px-2 py-4 text-sm font-bold uppercase tracking-wider text-white/80 transition-colors hover:text-gold"
                >
                  {t.work}
                  <ArrowDown size={16} />
                </a>
              ) : null}
            </div>

            <div className="mt-10 grid grid-cols-3 gap-4 border-t border-white/10 pt-6">
              {trust.map((stat) => (
                <div key={stat.label}>
                  <div className="font-display text-2xl font-extrabold tracking-tight text-gold sm:text-3xl">{stat.value}</div>
                  <div className="mt-1 text-[13px] leading-snug text-white/55">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="overflow-hidden rounded-sm border border-gold/15 bg-card">
            <div className="aspect-[4/3]">
              <img
                src={service.coverImage}
                alt={service.name}
                fetchPriority="high"
                decoding="async"
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ---------- KORZYŚCI + PLIKI ---------- */}
      <section className="container py-10 sm:py-14">
        <div className="grid gap-6 lg:grid-cols-2">
          <Reveal as="article" className="gold-border-hover rounded-sm border border-white/5 bg-card p-6 sm:p-8">
            <div className="section-label mb-3">{t.gainKicker}</div>
            <h2 className="font-display text-2xl font-black leading-[1.15] text-white">{t.gainTitle}</h2>
            <ul className="mt-6 grid gap-3.5">
              {service.benefits.map((item) => (
                <li key={item} className="grid grid-cols-[auto_1fr] items-start gap-3 text-sm leading-relaxed text-white/72">
                  <Check size={16} className="mt-0.5 text-gold" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
          </Reveal>
          <Reveal as="article" delay={90} className="gold-border-hover rounded-sm border border-white/5 bg-card p-6 sm:p-8">
            <div className="section-label mb-3">{t.filesKicker}</div>
            <h2 className="font-display text-2xl font-black leading-[1.15] text-white">{t.filesTitle}</h2>
            <ul className="mt-6 grid gap-3.5">
              {service.deliverables.map((item) => (
                <li key={item} className="grid grid-cols-[auto_1fr] items-start gap-3 text-sm leading-relaxed text-white/72">
                  <Check size={16} className="mt-0.5 text-gold" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      {/* ---------- REALIZACJE ---------- */}
      {projects.length ? (
        <section id="realizacje" className="container scroll-mt-24 py-14 sm:py-20">
          <Reveal>
            <SectionHeading eyebrow={t.workKicker} title={t.workTitle} description={t.workDesc} />
          </Reveal>
          <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {projects.map((project, index) => (
              <Reveal key={project.slug} delay={(index % 3) * 80}>
                <Link
                  href={getPortfolioDetailPath(project.slug)}
                  className="gold-border-hover group block h-full overflow-hidden rounded-sm bg-card"
                >
                  <div className="aspect-[4/3] overflow-hidden">
                    <img
                      src={project.image}
                      alt={project.title}
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-6">
                    <div className="section-label mb-2">{project.category}</div>
                    <h3 className="font-display text-xl font-bold text-white">{project.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-white/60">{project.summary}</p>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </section>
      ) : null}

      {/* ---------- PROCES ---------- */}
      <section className="container py-14 sm:py-20">
        <Reveal>
          <SectionHeading eyebrow={t.processKicker} title={t.processTitle} size="compact" />
        </Reveal>
        <div className="mt-10 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map(([title, text], index) => (
            <Reveal key={title} delay={index * 70}>
              <div className="font-display text-4xl font-black leading-none text-white/14">
                {String(index + 1).padStart(2, "0")}
              </div>
              <div className="my-4 h-px bg-gradient-to-r from-gold/50 to-transparent" />
              <h3 className="font-display text-lg font-bold text-white">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-white/58">{text}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ---------- WIĘCEJ O USŁUDZE + FAQ ---------- */}
      <section className="container py-14 sm:py-20">
        <div className="grid gap-14 lg:grid-cols-[1.1fr_0.9fr] lg:gap-20">
          <Reveal>
            <SectionHeading eyebrow={t.moreKicker} title={t.moreTitle} size="compact" />
            <div className="mt-8 grid max-w-2xl gap-5 text-[15px] leading-relaxed text-white/68">
              {service.seoText.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </Reveal>
          <Reveal delay={90}>
            <div className="section-label mb-5">{t.faqTitle}</div>
            <div className="border-t border-white/10">
              {faqs.map((faq) => (
                <details key={faq.id} className="group border-b border-white/10 py-5">
                  <summary className="flex cursor-pointer list-none items-start justify-between gap-5 font-display text-base font-bold text-white transition-colors hover:text-gold">
                    {faq.question}
                    <span className="mt-1 shrink-0 text-gold transition-transform duration-300 group-open:rotate-45">+</span>
                  </summary>
                  <p className="mt-3 text-sm leading-relaxed text-white/58">{faq.answer}</p>
                </details>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      <ContactSection />
    </SiteLayout>
  );
}
