import { ArrowRight, ArrowUpRight, Quote, Sparkles, Star } from "lucide-react";
import { Link } from "wouter";
import { ContactSection } from "@/components/site/ContactSection";
import { Reveal } from "@/components/site/Reveal";
import { SiteLayout } from "@/components/site/SiteLayout";
import { useLocale } from "@/contexts/LocaleContext";
import {
  getBlogPosts,
  getCompanyStats,
  getFaqs,
  getFeaturedServicesLocalized,
  getHomepageProjectsLocalized,
  getTestimonials,
} from "@/data/localizedSiteContent";
import { usePageMeta } from "@/hooks/usePageMeta";
import { isShopOnlyFaq } from "@/lib/faqVisibility";
import { SHOP_ENABLED } from "@/siteConfig";

/** Nadtytuł sekcji z kreską – jeden wzorzec na całej stronie.
 *  `as="h2"` tam, gdzie sekcja nie ma innego nagłówka (semantyka + czytniki). */
function Kicker({
  children,
  className = "",
  as: Tag = "div",
}: {
  children: React.ReactNode;
  className?: string;
  as?: "div" | "h2";
}) {
  return <Tag className={`fx-kicker ${className}`}>{children}</Tag>;
}

/** Numer porządkowy kroku – pełna, wygaszona cyfra (kontur wyglądał
 *  jak rysunek techniczny, nie jak premium). */
function Numeral({ value }: { value: string }) {
  return (
    <span className="block font-display text-5xl font-black leading-none tracking-tight text-white/14 sm:text-6xl">
      {value}
    </span>
  );
}

export default function Home() {
  const { locale, getBlogPostPath, getPortfolioDetailPath, getServicePath, getStaticPath } =
    useLocale();

  const featuredServices = getFeaturedServicesLocalized(locale);
  const homepageProjects = getHomepageProjectsLocalized(locale);
  const companyStats = getCompanyStats(locale);
  const testimonials = getTestimonials(locale);
  /* Wizytówka: pytania o płatności / koszyk / zakup nie mają sensu bez sklepu (ten sam filtr co strona FAQ). */
  const faqs = SHOP_ENABLED ? getFaqs(locale) : getFaqs(locale).filter((faq) => !isShopOnlyFaq(faq));
  const latestPosts = getBlogPosts(locale).slice(0, 3);

  const [leadProject, ...restProjects] = homepageProjects;
  const leadReview = testimonials[0];

  usePageMeta(
    locale === "en"
      ? SHOP_ENABLED
        ? "DatiVe Design | Premium graphic design studio and online service ordering"
        : "DatiVe Design | Graphic design studio – Rzeszów, Kolbuszowa"
      : SHOP_ENABLED
        ? "DatiVe Design | Premium studio graficzne i zamówienia usług online"
        : "DatiVe Design | Studio graficzne – Rzeszów, Kolbuszowa",
    locale === "en"
      ? SHOP_ENABLED
        ? "DatiVe Design combines premium portfolio presentation, a modern creative agency feel and online service sales for logo design, branding, social media, print and advertising materials."
        : "Visual identities, logos, labels, print and advertising design. DatiVe Design – a graphic design studio in Rzeszów and Kolbuszowa, working with companies across Poland."
      : SHOP_ENABLED
        ? "DatiVe Design łączy premium portfolio, nowoczesną agencję kreatywną i sprzedaż usług graficznych online: logo, branding, social media, druk i materiały reklamowe."
        : "Identyfikacje wizualne, logo, etykiety, materiały drukowane i grafika reklamowa. DatiVe Design – studio graficzne z Rzeszowa i Kolbuszowej, dla firm z całej Polski.",
    { locale, path: getStaticPath("home") },
  );

  const t =
    locale === "en"
      ? {
          heroLabel: "Graphic design studio – Rzeszów / Kolbuszowa",
          heroTop: "FROM IDEA",
          heroBottom: "TO EXECUTION",
          heroDesc: SHOP_ENABLED
            ? "Visual identities, labels, print and advertising design for companies that want to look professional."
            : "Visual identities, labels, print and advertising design. Rzeszów, Kolbuszowa and remotely – for companies across Poland.",
          heroPrimary: SHOP_ENABLED ? "Request a quote" : "See portfolio",
          heroSecondary: SHOP_ENABLED ? "See portfolio" : "Get in touch",
          workKicker: "Selected work",
          workTitle: "Projects that",
          workAccent: "did the job",
          workDesc:
            "Labels, branding, business cards and campaign materials. Every project comes with its goal and result.",
          workAll: "See full portfolio",
          servicesKicker: SHOP_ENABLED ? "Services" : "Scope",
          servicesTitle: SHOP_ENABLED ? "What you can" : "What I can",
          servicesAccent: SHOP_ENABLED ? "order" : "do for you",
          servicesDesc: SHOP_ENABLED
            ? "Clear scope, defined packages, transparent starting prices."
            : "Logo, branding, print and advertising design – from concept to final files.",
          servicesAll: "All services",
          processKicker: "How it works",
          processTitle: "Four steps,",
          processAccent: "no guesswork",
          reviewKicker: "Client review",
          reviewsAll: "All reviews",
          ctaKicker: "Start your project",
          ctaTitle: SHOP_ENABLED ? "Pick a package," : "Got a project",
          ctaAccent: SHOP_ENABLED ? "get a free quote" : "in mind?",
          ctaDesc: SHOP_ENABLED
            ? "Add services to the cart and send one free, no-obligation request. The tailored quote lands in your inbox."
            : "Write a few sentences about what you need – I reply within 24 hours on business days.",
          ctaButton: SHOP_ENABLED ? "Request a quote" : "Get in touch",
          faqKicker: SHOP_ENABLED ? "Before you order" : "Good to know",
          faqAll: "Full FAQ",
          blogKicker: "Journal",
          blogAll: "Go to blog",
          openProject: "View project",
          from: "from",
        }
      : {
          heroLabel: "Studio graficzne – Rzeszów / Kolbuszowa",
          heroTop: "Z POMYSŁU",
          heroBottom: "DO REALIZACJI",
          heroDesc: SHOP_ENABLED
            ? "Identyfikacje wizualne, etykiety, materiały drukowane i grafika reklamowa dla firm, które chcą wyglądać profesjonalnie."
            : "Identyfikacje wizualne, etykiety, materiały drukowane i grafika reklamowa. Rzeszów, Kolbuszowa i zdalnie – dla firm z całej Polski.",
          heroPrimary: SHOP_ENABLED ? "Zapytaj o wycenę" : "Zobacz portfolio",
          heroSecondary: SHOP_ENABLED ? "Zobacz portfolio" : "Napisz do nas",
          workKicker: "Wybrane realizacje",
          workTitle: "Projekty, które",
          workAccent: "zrobiły robotę",
          workDesc:
            "Etykiety, branding, wizytówki i materiały reklamowe. Przy każdej realizacji opisany cel i efekt.",
          workAll: "Zobacz pełne portfolio",
          servicesKicker: SHOP_ENABLED ? "Usługi" : "Zakres",
          servicesTitle: SHOP_ENABLED ? "Co możesz" : "Co mogę",
          servicesAccent: SHOP_ENABLED ? "zamówić" : "dla Ciebie zrobić",
          servicesDesc: SHOP_ENABLED
            ? "Jasny zakres, konkretne pakiety, przejrzyste ceny startowe."
            : "Logo, branding, materiały drukowane i grafika reklamowa – od koncepcji po gotowe pliki.",
          servicesAll: "Wszystkie usługi",
          processKicker: "Jak to działa",
          processTitle: "Cztery kroki,",
          processAccent: "zero domysłów",
          reviewKicker: "Opinia klienta",
          reviewsAll: "Wszystkie opinie",
          ctaKicker: "Zacznij projekt",
          ctaTitle: SHOP_ENABLED ? "Wybierz pakiet," : "Masz projekt",
          ctaAccent: SHOP_ENABLED ? "zapytaj o wycenę" : "do zrobienia?",
          ctaDesc: SHOP_ENABLED
            ? "Dodaj usługi do koszyka i wyślij jedno bezpłatne zapytanie. Dopasowana wycena przyjdzie na maila."
            : "Napisz kilka zdań o tym, czego potrzebujesz – odpowiadam do 24h w dni robocze.",
          ctaButton: SHOP_ENABLED ? "Zapytaj o wycenę" : "Napisz do nas",
          faqKicker: SHOP_ENABLED ? "Zanim zamówisz" : "Warto wiedzieć",
          faqAll: "Pełne FAQ",
          blogKicker: "Dziennik",
          blogAll: "Przejdź do bloga",
          openProject: "Zobacz projekt",
          from: "od",
        };

  const marqueeItems =
    locale === "en"
      ? ["PRINT", "ADVERTISING", "REBRANDING", "BRANDING", "LOGO", "LABELS", "BUSINESS CARDS", "PACKAGING", "SOCIAL MEDIA"]
      : ["DRUK", "REKLAMA", "REBRANDING", "BRANDING", "LOGO", "ETYKIETY", "WIZYTÓWKI", "OPAKOWANIA", "SOCIAL MEDIA"];

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

  const priceFrom = (service: (typeof featuredServices)[number]) => {
    const pkg = service.packages[0];
    if (!pkg) return "";
    if (pkg.priceLabel) return pkg.priceLabel;
    return locale === "en" ? `${t.from} ${pkg.price} PLN` : `${t.from} ${pkg.price} zł`;
  };

  return (
    <SiteLayout>
      {/* ---------- HERO ---------- */}
      <section className="fx-grain relative flex min-h-[86vh] items-end overflow-hidden border-b border-white/5">
        <div className="absolute inset-0">
          <img
            src="/hero.jpg"
            alt=""
            className="h-full w-full object-cover object-center"
            fetchPriority="high"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/78 to-background/35" />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/55 to-transparent" />
        </div>

        <div className="relative container pb-14 pt-32 sm:pb-16 sm:pt-40">
          <div className="max-w-4xl">
            <Kicker className="animate-fade-up">{t.heroLabel}</Kicker>
            <h1 className="mt-6 font-display text-[2.7rem] font-black leading-[0.95] tracking-[-0.03em] text-white sm:text-7xl lg:text-[5.75rem] animate-fade-up">
              <span className="block">{t.heroTop}</span>
              <span className="block text-gold">{t.heroBottom}</span>
            </h1>
            <p className="mt-7 max-w-lg text-base leading-relaxed text-white/70 sm:text-lg animate-fade-up-delay-1">
              {t.heroDesc}
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center animate-fade-up-delay-2">
              {SHOP_ENABLED ? (
                <>
                  <Link
                    href={getStaticPath("order")}
                    className="gold-button-shimmer inline-flex items-center justify-center gap-2 rounded-sm px-8 py-4 text-sm font-black uppercase tracking-wider text-background"
                  >
                    <Sparkles size={17} />
                    {t.heroPrimary}
                  </Link>
                  <Link
                    href={getStaticPath("portfolio")}
                    className="fx-underline inline-flex items-center justify-center gap-2 px-2 py-4 text-sm font-bold uppercase tracking-wider text-white/80"
                  >
                    {t.heroSecondary}
                    <ArrowRight size={16} />
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href={getStaticPath("portfolio")}
                    className="gold-button-shimmer inline-flex items-center justify-center gap-2 rounded-sm px-8 py-4 text-sm font-black uppercase tracking-wider text-background"
                  >
                    {t.heroPrimary}
                    <ArrowRight size={17} />
                  </Link>
                  <a
                    href="#kontakt"
                    className="fx-underline inline-flex items-center justify-center gap-2 px-2 py-4 text-sm font-bold uppercase tracking-wider text-white/80"
                  >
                    {t.heroSecondary}
                    <ArrowRight size={16} />
                  </a>
                </>
              )}
            </div>
          </div>

          {/* pasek dowodów – wbudowany w hero zamiast osobnej sekcji */}
          <div className="mt-14 grid grid-cols-2 gap-x-8 gap-y-7 border-t border-white/10 pt-8 sm:mt-16 lg:grid-cols-4 animate-fade-up-delay-3">
            {companyStats.map((stat) => (
              <div key={stat.label}>
                <div className="font-display text-2xl font-extrabold tracking-tight text-gold sm:text-3xl">
                  {stat.value}
                </div>
                <div className="mt-1.5 text-[13px] leading-snug text-white/55">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="relative overflow-hidden border-b border-white/5 bg-gold/[0.07] py-4">
        <div className="fx-edge-fade-r flex min-w-max animate-marquee gap-10 whitespace-nowrap">
          {[...marqueeItems, ...marqueeItems].map((item, index) => (
            <span
              key={`${item}-${index}`}
              className="font-display text-xs font-bold uppercase tracking-[0.28em] text-gold/85"
            >
              {item}
            </span>
          ))}
        </div>
      </div>

      {/* ---------- PORTFOLIO ---------- */}
      <section id="home-work" className="py-24 sm:py-32">
        <div className="container">
          <Reveal>
            <div className="flex flex-wrap items-end justify-between gap-6">
              <div>
                <Kicker>{t.workKicker}</Kicker>
                <h2 className="mt-5 font-display text-[2rem] font-extrabold leading-[1.15] text-white sm:text-[3.1rem]">
                  {t.workTitle}
                  <span className="block text-gold">{t.workAccent}</span>
                </h2>
              </div>
              <p className="max-w-sm text-sm leading-relaxed text-white/58 sm:text-base">{t.workDesc}</p>
            </div>
          </Reveal>

          {leadProject ? (
            <Reveal className="mt-12">
              <Link
                href={getPortfolioDetailPath(leadProject.slug)}
                className="fx-media gold-border-hover group relative block overflow-hidden rounded-sm"
              >
                <div className="aspect-[16/10] lg:aspect-[21/9]">
                  <img
                    src={leadProject.image}
                    alt={leadProject.title}
                    loading="lazy"
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="absolute inset-x-0 bottom-0 p-6 sm:p-10">
                  <div className="flex flex-wrap items-end justify-between gap-5">
                    <div className="max-w-2xl">
                      <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-gold">
                        {leadProject.category}
                      </div>
                      <h3 className="mt-3 font-display text-2xl font-extrabold text-white sm:text-4xl">
                        {leadProject.title}
                      </h3>
                      <p className="mt-2 max-w-xl text-sm leading-relaxed text-white/70">
                        {leadProject.summary}
                      </p>
                    </div>
                    <span className="inline-flex shrink-0 items-center gap-2 text-sm font-bold uppercase tracking-wider text-gold">
                      {t.openProject}
                      <ArrowUpRight size={17} />
                    </span>
                  </div>
                </div>
              </Link>
            </Reveal>
          ) : null}

          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {restProjects.slice(0, 3).map((project, index) => (
              <Reveal key={project.slug} delay={index * 90}>
                <Link
                  href={getPortfolioDetailPath(project.slug)}
                  className="gold-border-hover group block h-full overflow-hidden rounded-sm bg-card"
                >
                  <div className="fx-media aspect-[4/3]">
                    <img
                      src={project.image}
                      alt={project.title}
                      loading="lazy"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="flex items-start justify-between gap-4 p-5">
                    <div className="min-w-0">
                      <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/45">
                        {project.category}
                      </div>
                      <h3 className="mt-2 font-display text-lg font-bold text-white">{project.title}</h3>
                    </div>
                    <ArrowUpRight
                      size={18}
                      className="mt-1 shrink-0 text-white/30 transition-colors group-hover:text-gold"
                    />
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>

          <Reveal className="mt-10">
            <Link
              href={getStaticPath("portfolio")}
              className="fx-underline inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-gold"
            >
              {t.workAll}
              <ArrowRight size={16} />
            </Link>
          </Reveal>
        </div>
      </section>

      {/* ---------- USŁUGI (sklep) / CO ROBIĘ (wizytówka) – lista edytorialna ---------- */}
      <section className="fx-glow-gold fx-glow-gold--tr relative border-y border-white/5 bg-white/[0.02] py-24 sm:py-32">
        <div className="container relative">
          <Reveal>
            <div className="flex flex-wrap items-end justify-between gap-6">
              <div>
                <Kicker>{t.servicesKicker}</Kicker>
                <h2 className="mt-5 font-display text-[2rem] font-extrabold leading-[1.15] text-white sm:text-[3.1rem]">
                  {t.servicesTitle}
                  <span className="block text-gold">{t.servicesAccent}</span>
                </h2>
              </div>
              <p className="max-w-sm text-sm leading-relaxed text-white/58 sm:text-base">
                {t.servicesDesc}
              </p>
            </div>
          </Reveal>

          <div className="mt-12 border-t border-white/10">
            {featuredServices.map((service, index) => (
              <Reveal key={service.slug} delay={index * 70}>
                {SHOP_ENABLED ? (
                  <Link
                    href={getServicePath(service.slug)}
                    className="group flex flex-wrap items-center gap-x-8 gap-y-3 border-b border-white/10 py-7 transition-colors hover:bg-white/[0.03] sm:flex-nowrap sm:py-8"
                  >
                    <span className="w-9 shrink-0 font-display text-sm font-bold text-white/25">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-display text-xl font-bold text-white transition-colors group-hover:text-gold sm:text-2xl">
                        {service.name}
                      </span>
                      <span className="mt-1.5 block text-sm leading-relaxed text-white/55">
                        {service.tagline}
                      </span>
                    </span>
                    <span className="shrink-0 whitespace-nowrap font-display text-base font-bold text-gold sm:text-lg">
                      {priceFrom(service)}
                    </span>
                    <ArrowUpRight
                      size={20}
                      className="hidden shrink-0 text-white/25 transition-colors group-hover:text-gold sm:block"
                    />
                  </Link>
                ) : (
                  /* Wizytówka: wiersz informacyjny – bez ceny, linku i hovera. */
                  <div className="flex flex-wrap items-center gap-x-8 gap-y-3 border-b border-white/10 py-7 sm:flex-nowrap sm:py-8">
                    <span className="w-9 shrink-0 font-display text-sm font-bold text-white/25">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-display text-xl font-bold text-white sm:text-2xl">
                        {service.name}
                      </span>
                      <span className="mt-1.5 block text-sm leading-relaxed text-white/55">
                        {service.tagline}
                      </span>
                    </span>
                  </div>
                )}
              </Reveal>
            ))}
          </div>

          {SHOP_ENABLED ? (
            <Reveal className="mt-10">
              <Link
                href={getStaticPath("services")}
                className="fx-underline inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-gold"
              >
                {t.servicesAll}
                <ArrowRight size={16} />
              </Link>
            </Reveal>
          ) : null}
        </div>
      </section>

      {/* ---------- PROCES ---------- */}
      <section className="py-24 sm:py-32">
        <div className="container">
          <Reveal>
            <Kicker>{t.processKicker}</Kicker>
            <h2 className="mt-5 max-w-2xl font-display text-[2rem] font-extrabold leading-[1.15] text-white sm:text-[3.1rem]">
              {t.processTitle}
              <span className="text-gold"> {t.processAccent}</span>
            </h2>
          </Reveal>

          <div className="mt-14 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map(([title, text], index) => (
              <Reveal key={title} delay={index * 80}>
                <Numeral value={String(index + 1).padStart(2, "0")} />
                <div className="fx-hairline my-5" />
                <h3 className="font-display text-lg font-bold text-white">{title}</h3>
                <p className="mt-2.5 text-sm leading-relaxed text-white/58">{text}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- OPINIA ---------- */}
      {leadReview ? (
        <section className="border-y border-white/5 bg-white/[0.02] py-24 sm:py-32">
          <div className="container">
            <Reveal>
              <div className="mx-auto max-w-4xl text-center">
                <h2 className="sr-only">{t.reviewKicker}</h2>
                <Quote size={34} className="mx-auto text-gold/50" aria-hidden="true" />
                <div className="mt-6 flex justify-center gap-1">
                  {Array.from({ length: leadReview.rating }).map((_, index) => (
                    <Star key={index} size={15} className="fill-gold text-gold" />
                  ))}
                </div>
                <blockquote className="mt-7 font-display text-xl font-medium italic leading-[1.45] text-white/90 sm:text-[1.75rem]">
                  „{leadReview.quote}"
                </blockquote>
                <div className="mt-8 text-sm text-white/50">
                  <span className="font-bold text-white">{leadReview.name}</span>
                  <span className="mx-2 text-white/25">/</span>
                  {leadReview.company}
                </div>
                <Link
                  href={getStaticPath("reviews")}
                  className="fx-underline mt-8 inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-gold"
                >
                  {t.reviewsAll}
                  <ArrowRight size={16} />
                </Link>
              </div>
            </Reveal>
          </div>
        </section>
      ) : null}

      {/* ---------- CTA ---------- */}
      <section className="py-24 sm:py-28">
        <div className="container">
          <Reveal>
            <div className="fx-panel fx-panel--gold fx-glow-gold fx-glow-gold--bl relative overflow-hidden rounded-sm px-7 py-16 sm:px-14 sm:py-24">
              <div className="relative mx-auto flex max-w-2xl flex-col items-center text-center">
                <Kicker>{t.ctaKicker}</Kicker>
                <h2 className="mt-6 font-display text-[1.9rem] font-extrabold leading-[1.15] text-white sm:text-[3rem]">
                  {t.ctaTitle}
                  <span className="block text-gold">{t.ctaAccent}</span>
                </h2>
                <p className="mt-5 max-w-lg text-sm leading-relaxed text-white/62 sm:text-base">
                  {t.ctaDesc}
                </p>
                {SHOP_ENABLED ? (
                  <Link
                    href={getStaticPath("order")}
                    className="gold-button-shimmer mt-9 inline-flex items-center justify-center gap-2 rounded-sm px-10 py-5 text-sm font-black uppercase tracking-wider text-background"
                  >
                    <Sparkles size={17} />
                    {t.ctaButton}
                  </Link>
                ) : (
                  <a
                    href="#kontakt"
                    className="gold-button-shimmer mt-9 inline-flex items-center justify-center gap-2 rounded-sm px-10 py-5 text-sm font-black uppercase tracking-wider text-background"
                  >
                    {t.ctaButton}
                    <ArrowRight size={17} />
                  </a>
                )}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ---------- FAQ + BLOG ---------- */}
      <section className="border-t border-white/5 py-24 sm:py-28">
        <div className="container grid gap-16 lg:grid-cols-2 lg:gap-20">
          <Reveal>
            <Kicker as="h2">{t.faqKicker}</Kicker>
            <div className="mt-7 border-t border-white/10">
              {faqs.slice(0, 4).map((faq) => (
                <details key={faq.id} className="group border-b border-white/10 py-5">
                  <summary className="flex cursor-pointer list-none items-start justify-between gap-5 font-display text-base font-bold text-white transition-colors hover:text-gold">
                    {faq.question}
                    <span className="mt-1 shrink-0 text-gold transition-transform duration-300 group-open:rotate-45">
                      +
                    </span>
                  </summary>
                  <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/58">{faq.answer}</p>
                </details>
              ))}
            </div>
            <Link
              href={getStaticPath("faq")}
              className="fx-underline mt-7 inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-gold"
            >
              {t.faqAll}
              <ArrowRight size={16} />
            </Link>
          </Reveal>

          <Reveal delay={100}>
            <Kicker as="h2">{t.blogKicker}</Kicker>
            {/* Wszystkie wpisy dzielą jedną grafikę, więc lista jest czysto
                typograficzna – trzy identyczne miniatury wyglądałyby źle. */}
            <div className="mt-7 border-t border-white/10">
              {latestPosts.map((post) => (
                <Link
                  key={post.slug}
                  href={getBlogPostPath(post.slug)}
                  className="group block border-b border-white/10 py-5 transition-colors hover:bg-white/[0.03]"
                >
                  <div className="flex items-baseline gap-3 text-[11px] font-bold uppercase tracking-[0.2em] text-white/40">
                    <span className="text-gold/80">{post.category}</span>
                    <span className="h-px flex-1 bg-white/10" aria-hidden="true" />
                    <span>{post.readTime}</span>
                  </div>
                  <h3 className="mt-2.5 font-display text-lg font-bold leading-snug text-white transition-colors group-hover:text-gold">
                    {post.title}
                  </h3>
                  <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-white/55">
                    {post.excerpt}
                  </p>
                </Link>
              ))}
            </div>
            <Link
              href={getStaticPath("blog")}
              className="fx-underline mt-7 inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-gold"
            >
              {t.blogAll}
              <ArrowRight size={16} />
            </Link>
          </Reveal>
        </div>
      </section>

      <ContactSection />
    </SiteLayout>
  );
}
