import { ArrowRight, Check, Sparkles, Star } from "lucide-react";
import { Link } from "wouter";
import { ContactSection } from "@/components/site/ContactSection";
import { Reveal } from "@/components/site/Reveal";
import { SectionHeading } from "@/components/site/SectionHeading";
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

export default function Home() {
  const { locale, getBlogPostPath, getPortfolioDetailPath, getServicePath, getStaticPath } =
    useLocale();

  const featuredServices = getFeaturedServicesLocalized(locale);
  const homepageProjects = getHomepageProjectsLocalized(locale);
  const companyStats = getCompanyStats(locale);
  const testimonials = getTestimonials(locale);
  const faqs = getFaqs(locale);
  const latestPosts = getBlogPosts(locale).slice(0, 3);

  const [leadProject, ...restProjects] = homepageProjects;
  const [leadReview, ...restReviews] = testimonials;

  usePageMeta(
    locale === "en"
      ? "DatiVe Design | Premium graphic design studio and online service ordering"
      : "DatiVe Design | Premium studio graficzne i zamówienia usług online",
    locale === "en"
      ? "DatiVe Design combines premium portfolio presentation, a modern creative agency feel and online service sales for logo design, branding, social media, print and advertising materials."
      : "DatiVe Design łączy premium portfolio, nowoczesną agencję kreatywną i sprzedaż usług graficznych online: logo, branding, social media, druk i materiały reklamowe.",
    { locale, path: getStaticPath("home") },
  );

  const hero =
    locale === "en"
      ? {
          label: "Graphic Designer - Rzeszów / Kolbuszowa / International",
          titleTop: "FROM IDEA",
          titleBottom: "TO EXECUTION",
          description:
            "Professional graphic design services for your business. I create visual identities, labels, print materials and promotional graphics that help your brand stand out.",
          primary: "Order project",
          secondary: "See portfolio",
        }
      : {
          label: "Projektant graficzny - Rzeszów / Kolbuszowa",
          titleTop: "Z POMYSŁU",
          titleBottom: "DO REALIZACJI",
          description:
            "Profesjonalne usługi graficzne dla Twojej firmy. Tworzę identyfikacje wizualne, etykiety, materiały drukowane i grafiki reklamowe, które wyróżniają Twoją markę.",
          primary: "Zamów projekt",
          secondary: "Zobacz portfolio",
        };

  const marqueeItems =
    locale === "en"
      ? [
          "PRINT MATERIALS",
          "ADVERTISING GRAPHICS",
          "REBRANDING",
          "BRANDING",
          "LOGO",
          "LABELS",
          "BUSINESS CARDS",
          "PACKAGING",
          "SOCIAL MEDIA",
        ]
      : [
          "MATERIAŁY DRUKOWANE",
          "GRAFIKA REKLAMOWA",
          "REBRANDING",
          "BRANDING",
          "LOGO",
          "ETYKIETY",
          "WIZYTÓWKI",
          "OPAKOWANIA",
          "SOCIAL MEDIA",
        ];

  const formatPackagePrice = (price: number, priceLabel?: string) =>
    priceLabel ?? (locale === "en" ? `${price} PLN` : `${price} zł`);

  return (
    <SiteLayout>
      {/* HERO */}
      <section className="relative overflow-hidden border-b border-white/5">
        <div className="absolute inset-0">
          <img
            src="/hero.jpg"
            alt=""
            className="h-full w-full object-cover object-center opacity-65"
            fetchPriority="high"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/28 via-background/22 to-background/82" />
          <div className="absolute inset-0 bg-gradient-to-r from-background/72 via-background/38 to-background/8" />
          <div className="ambient-orb ambient-orb-gold left-[7%] top-16 h-44 w-44" />
          <div className="ambient-orb ambient-orb-soft bottom-10 right-[12%] h-52 w-52" />
        </div>

        <div className="relative container py-24 sm:py-28 lg:py-36">
          <div className="max-w-5xl">
            <div className="section-label mb-5 animate-fade-up">{hero.label}</div>
            <h1 className="max-w-4xl font-display text-4xl font-black leading-[0.94] text-white sm:text-6xl lg:text-8xl animate-fade-up">
              <span className="block">{hero.titleTop}</span>
              <span className="block text-gold">{hero.titleBottom}</span>
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-white/68 sm:text-lg animate-fade-up-delay-1">
              {hero.description}
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row animate-fade-up-delay-2">
              <Link
                href={getStaticPath("order")}
                className="gold-button-shimmer inline-flex items-center justify-center gap-2 rounded-sm px-7 py-4 text-sm font-black uppercase tracking-wider text-background"
              >
                <Sparkles size={18} />
                {hero.primary}
              </Link>
              <Link
                href={getStaticPath("portfolio")}
                className="inline-flex items-center justify-center gap-2 rounded-sm border border-gold/30 px-7 py-4 text-sm font-black uppercase tracking-wider text-gold transition-colors hover:bg-gold/10"
              >
                {hero.secondary}
                <ArrowRight size={18} />
              </Link>
            </div>

            <div className="mt-10 flex flex-wrap gap-x-7 gap-y-3 text-sm text-white/60 animate-fade-up-delay-3">
              {companyStats.slice(0, 3).map((stat) => (
                <span key={stat.label} className="inline-flex items-center gap-2">
                  <Check size={16} className="text-gold" />
                  <span className="font-bold text-white">{stat.value}</span>
                  {stat.label}
                </span>
              ))}
            </div>
          </div>

          <a
            href="#home-work"
            className="absolute bottom-10 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 text-xs font-semibold uppercase tracking-[0.28em] text-white/45 transition-colors hover:text-gold md:flex"
          >
            <span>{locale === "en" ? "Scroll" : "Przewiń"}</span>
            <span className="text-gold">↓</span>
          </a>
        </div>

        <div className="relative overflow-hidden border-t border-gold/15 bg-gold/8 py-5">
          <div className="flex min-w-max animate-marquee gap-8 whitespace-nowrap">
            {[...marqueeItems, ...marqueeItems].map((item, index) => (
              <span
                key={`${item}-${index}`}
                className="font-display text-sm font-bold uppercase tracking-[0.18em] text-gold/90"
              >
                {item}
                <span className="ml-8 text-gold/45">•</span>
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* PROOF BAR (jeden, scalony zestaw statystyk) */}
      <section className="border-b border-white/5 bg-white/[0.02] py-10 sm:py-12">
        <div className="container grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {companyStats.map((stat, index) => (
            <Reveal
              key={stat.label}
              delay={index * 80}
              className="rounded-sm border border-white/5 bg-card px-6 py-5"
            >
              <div className="font-display text-3xl font-black text-gold sm:text-4xl">{stat.value}</div>
              <div className="mt-2 text-sm text-white/65">{stat.label}</div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* PORTFOLIO - przeniesione wyżej, z dużym kafelkiem wiodącym */}
      <section id="home-work" className="py-20 sm:py-24">
        <div className="container">
          <Reveal>
            <SectionHeading
              eyebrow="Portfolio"
              title={locale === "en" ? "Selected" : "Wybrane"}
              accent={locale === "en" ? "work" : "realizacje"}
              description={
                locale === "en"
                  ? "A selection of projects where design solved a real problem for the brand - not just looked good."
                  : "Wybór projektów, w których design rozwiązał realny problem marki - a nie tylko ładnie wyglądał."
              }
            />
          </Reveal>

          <div className="mt-10 grid gap-6 lg:grid-cols-3">
            {leadProject ? (
              <Reveal className="lg:col-span-2" as="div">
                <Link
                  href={getPortfolioDetailPath(leadProject.slug)}
                  className="group block h-full overflow-hidden rounded-sm border border-white/5 bg-card gold-border-hover"
                >
                  <div className="relative aspect-[16/10] overflow-hidden lg:aspect-[16/9]">
                    <img
                      src={leadProject.image}
                      alt={leadProject.title}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="portfolio-sheen absolute inset-0" />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/85 via-background/10 to-transparent" />
                    <div className="absolute bottom-0 left-0 p-6 sm:p-8">
                      <div className="section-label mb-2">{leadProject.category}</div>
                      <h3 className="font-display text-2xl font-black text-white sm:text-4xl">
                        {leadProject.title}
                      </h3>
                      <p className="mt-2 max-w-xl text-sm leading-relaxed text-white/65">
                        {leadProject.summary}
                      </p>
                      <span className="mt-4 inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-gold">
                        {locale === "en" ? "View project" : "Zobacz projekt"}
                        <ArrowRight size={16} />
                      </span>
                    </div>
                  </div>
                </Link>
              </Reveal>
            ) : null}

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-1">
              {restProjects.slice(0, 2).map((project, index) => (
                <Reveal key={project.slug} delay={index * 100}>
                  <Link
                    href={getPortfolioDetailPath(project.slug)}
                    className="group block overflow-hidden rounded-sm border border-white/5 bg-card gold-border-hover"
                  >
                    <div className="relative aspect-[16/10] overflow-hidden">
                      <img
                        src={project.image}
                        alt={project.title}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="portfolio-sheen absolute inset-0" />
                    </div>
                    <div className="p-5">
                      <div className="section-label mb-1.5">{project.category}</div>
                      <h3 className="font-display text-lg font-black text-white">{project.title}</h3>
                    </div>
                  </Link>
                </Reveal>
              ))}
            </div>
          </div>

          {restProjects.length > 2 ? (
            <div className="mt-6 grid gap-6 md:grid-cols-3">
              {restProjects.slice(2).map((project, index) => (
                <Reveal key={project.slug} delay={index * 100}>
                  <Link
                    href={getPortfolioDetailPath(project.slug)}
                    className="group block overflow-hidden rounded-sm border border-white/5 bg-card gold-border-hover"
                  >
                    <div className="relative aspect-square overflow-hidden">
                      <img
                        src={project.image}
                        alt={project.title}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="portfolio-sheen absolute inset-0" />
                    </div>
                    <div className="p-6">
                      <div className="section-label mb-2">{project.category}</div>
                      <h3 className="font-display text-xl font-black text-white">{project.title}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-white/60">{project.summary}</p>
                    </div>
                  </Link>
                </Reveal>
              ))}
            </div>
          ) : null}

          <div className="mt-10">
            <Link
              href={getStaticPath("portfolio")}
              className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-gold"
            >
              {locale === "en" ? "See full portfolio" : "Zobacz pełne portfolio"}
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* O MNIE */}
      <section className="border-y border-white/5 bg-white/[0.02] py-20 sm:py-24">
        <div className="container grid items-start gap-14 lg:grid-cols-[1fr_0.9fr]">
          <Reveal>
            <SectionHeading
              eyebrow={locale === "en" ? "Our story" : "Nasza historia"}
              title={locale === "en" ? "Graphic designer" : "Grafik komputerowy"}
              accent={locale === "en" ? "with passion" : "z pasją"}
              description={
                locale === "en"
                  ? "DatiVe Design is a graphic design studio based in Rzeszów and Kolbuszowa. I create professional visual materials for brands that want to stand out, look consistent and build a stronger market presence."
                  : "DatiVe Design to studio graficzne z siedzibą w Rzeszowie i Kolbuszowej. Specjalizuję się w tworzeniu profesjonalnych materiałów graficznych dla firm, które chcą wyróżnić się na rynku i zbudować silną, rozpoznawalną markę."
              }
            />
            <p className="mt-6 max-w-2xl text-sm leading-relaxed text-white/68 sm:text-base">
              {locale === "en"
                ? "Every project is treated individually. I listen to the client, analyze the market and build solutions that are not only visually strong, but above all useful in real business communication."
                : "Każdy projekt traktuję indywidualnie - słucham potrzeb klienta, analizuję rynek i tworzę rozwiązania, które nie tylko dobrze wyglądają, ale przede wszystkim działają. Od pomysłu do realizacji."}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              {(locale === "en"
                ? ["Always available", "100% recommendations", "Growing portfolio"]
                : ["Zawsze dostępny", "100% rekomendacji", "Stale rozwijane portfolio"]
              ).map((item) => (
                <span
                  key={item}
                  className="inline-flex items-center gap-2 rounded-sm border border-gold/25 px-4 py-2 text-xs font-bold uppercase tracking-wide text-gold"
                >
                  <Check size={14} />
                  {item}
                </span>
              ))}
            </div>
          </Reveal>

          <Reveal delay={120}>
            <div className="rounded-sm border border-gold/20 bg-gradient-to-br from-gold/12 via-card to-card p-7 sm:p-9">
              <div className="section-label mb-4">{locale === "en" ? "How I work" : "Jak pracuję"}</div>
              <div className="grid gap-6">
                {(locale === "en"
                  ? [
                      ["Direct contact", "You talk to the person doing the work - no middlemen, no telephone game."],
                      ["Clear process", "Scope, price and timeline are agreed before anything starts."],
                      ["Files you own", "You receive ready-to-use files in the right formats for web and print."],
                    ]
                  : [
                      ["Kontakt bez pośredników", "Rozmawiasz z osobą, która realnie robi projekt - bez głuchego telefonu."],
                      ["Przejrzysty proces", "Zakres, cenę i termin ustalamy, zanim cokolwiek ruszy."],
                      ["Pliki na własność", "Dostajesz gotowe pliki w odpowiednich formatach pod web i druk."],
                    ]
                ).map(([title, text]) => (
                  <div key={title} className="flex gap-4">
                    <ArrowRight size={18} className="mt-1 shrink-0 text-gold" />
                    <div>
                      <div className="font-black text-white">{title}</div>
                      <p className="mt-1 text-sm leading-relaxed text-white/60">{text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* USŁUGI */}
      <section className="py-20 sm:py-24">
        <div className="container">
          <Reveal>
            <SectionHeading
              eyebrow={locale === "en" ? "Popular services" : "Najpopularniejsze usługi"}
              title={locale === "en" ? "Services ready" : "Usługi gotowe"}
              accent={locale === "en" ? "to order" : "do zamówienia"}
              description={
                locale === "en"
                  ? "Clear scope, examples and packages with pricing - pick what fits and order online in a few clicks."
                  : "Jasny zakres, przykłady i pakiety z cenami - wybierz to, co pasuje, i zamów online w kilka kliknięć."
              }
            />
          </Reveal>
          <div className="mt-10 grid gap-6 lg:grid-cols-3">
            {featuredServices.map((service, index) => (
              <Reveal key={service.slug} delay={index * 100}>
                <article className="flex h-full flex-col rounded-sm border border-white/5 bg-card p-6 gold-border-hover">
                  <div className="section-label mb-3">{service.category}</div>
                  <h3 className="font-display text-2xl font-black text-white">{service.name}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-white/65">{service.shortDescription}</p>
                  <div className="mt-5 flex flex-wrap gap-2">
                    {service.packages.slice(0, 3).map((item) => (
                      <span key={item.slug} className="rounded-full bg-white/5 px-3 py-1 text-xs text-white/50">
                        {item.name} ·{" "}
                        {item.priceLabel
                          ? formatPackagePrice(item.price, item.priceLabel)
                          : `${locale === "en" ? "from" : "od"} ${formatPackagePrice(item.price)}`}
                      </span>
                    ))}
                  </div>
                  <div className="mt-auto pt-6">
                    <Link
                      href={getServicePath(service.slug)}
                      className="inline-flex items-center gap-2 text-sm font-bold text-gold"
                    >
                      {locale === "en" ? "Service details" : "Szczegóły usługi"}
                      <ArrowRight size={16} />
                    </Link>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* OPINIE - jedna duża + mniejsze */}
      <section className="border-y border-white/5 bg-white/[0.02] py-20 sm:py-24">
        <div className="container">
          <Reveal>
            <SectionHeading
              eyebrow={locale === "en" ? "Client reviews" : "Opinie klientów"}
              title={locale === "en" ? "100% recommendation rate" : "100% rekomendacji"}
              description={
                locale === "en"
                  ? "Beyond good-looking visuals you get a clear process, straightforward communication and a result you can count on."
                  : "Poza dobrą estetyką dostajesz przejrzysty proces, prostą komunikację i efekt, na którym możesz polegać."
              }
            />
          </Reveal>

          {leadReview ? (
            <Reveal className="mt-10">
              <article className="rounded-sm border border-gold/20 bg-gradient-to-br from-gold/12 via-card to-card p-7 sm:p-10">
                <div className="mb-5 flex gap-1">
                  {Array.from({ length: leadReview.rating }).map((_, index) => (
                    <Star key={`${leadReview.id}-${index}`} size={18} className="fill-gold text-gold" />
                  ))}
                </div>
                <p className="font-display text-xl italic leading-relaxed text-white/85 sm:text-2xl">
                  "{leadReview.quote}"
                </p>
                <div className="mt-6 text-sm text-white/55">
                  <span className="font-bold text-white">{leadReview.name}</span> · {leadReview.company} ·{" "}
                  {leadReview.service}
                </div>
              </article>
            </Reveal>
          ) : null}

          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            {restReviews.map((review, index) => (
              <Reveal key={review.id} delay={index * 100}>
                <article className="h-full rounded-sm border border-white/5 bg-card p-6">
                  <div className="mb-4 flex gap-1">
                    {Array.from({ length: review.rating }).map((_, starIndex) => (
                      <Star key={`${review.id}-${starIndex}`} size={16} className="fill-gold text-gold" />
                    ))}
                  </div>
                  <p className="text-lg italic leading-relaxed text-white/72">"{review.quote}"</p>
                  <div className="mt-5 text-sm text-white/50">
                    <span className="font-bold text-white">{review.name}</span> · {review.company} · {review.service}
                  </div>
                </article>
              </Reveal>
            ))}
          </div>

          <div className="mt-8">
            <Link
              href={getStaticPath("reviews")}
              className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-gold"
            >
              {locale === "en" ? "See all reviews" : "Zobacz wszystkie opinie"}
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 sm:py-24">
        <div className="container">
          <Reveal>
            <SectionHeading
              eyebrow="FAQ"
              title={locale === "en" ? "Before you order" : "Zanim zamówisz"}
              description={
                locale === "en"
                  ? "Straight answers about revisions, files, timelines and payments - no fine print."
                  : "Konkretne odpowiedzi o poprawkach, plikach, terminach i płatnościach - bez drobnego druku."
              }
            />
          </Reveal>
          <div className="mt-10 grid gap-5 lg:grid-cols-2">
            {faqs.slice(0, 4).map((faq, index) => (
              <Reveal key={faq.id} delay={index * 80}>
                <article className="h-full rounded-sm border border-white/5 bg-card p-6">
                  <h3 className="font-display text-xl font-black text-white">{faq.question}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-white/65">{faq.answer}</p>
                </article>
              </Reveal>
            ))}
          </div>
          <div className="mt-8">
            <Link
              href={getStaticPath("faq")}
              className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-gold"
            >
              {locale === "en" ? "See full FAQ" : "Zobacz pełne FAQ"}
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* GŁÓWNE CTA */}
      <section className="py-20 sm:py-24">
        <div className="container">
          <Reveal>
            <div className="relative overflow-hidden rounded-sm border border-gold/25 bg-gradient-to-r from-gold/14 via-card to-card p-8 sm:p-12">
              <div className="ambient-orb ambient-orb-gold -right-10 -top-10 h-48 w-48" />
              <div className="relative grid gap-8 lg:grid-cols-[1.3fr_auto] lg:items-center">
                <div>
                  <div className="section-label mb-3">{locale === "en" ? "Start your project" : "Zacznij projekt"}</div>
                  <h2 className="font-display text-4xl font-black text-white sm:text-5xl">
                    {locale === "en"
                      ? "Order a design service online and pick the right package right away"
                      : "Zamów usługę graficzną online i od razu wybierz odpowiedni pakiet"}
                  </h2>
                  <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/65 sm:text-base">
                    {locale === "en"
                      ? "Compare services, add extras to the cart and move to checkout - a clean, structured buying flow from start to finish."
                      : "Porównaj usługi, dodaj dodatki do koszyka i przejdź do checkoutu - prosty, uporządkowany proces od początku do końca."}
                  </p>
                </div>
                <Link
                  href={getStaticPath("order")}
                  className="gold-button-shimmer inline-flex items-center justify-center gap-2 rounded-sm px-8 py-4 text-sm font-black uppercase tracking-wider text-background"
                >
                  <Sparkles size={16} />
                  {locale === "en" ? "Order project" : "Zamów projekt"}
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* BLOG */}
      <section className="border-y border-white/5 bg-white/[0.02] py-20 sm:py-24">
        <div className="container">
          <Reveal>
            <SectionHeading
              eyebrow="Blog"
              title={locale === "en" ? "Latest articles" : "Ostatnie wpisy"}
              description={
                locale === "en"
                  ? "Practical articles about branding, design and getting the most out of your visual identity."
                  : "Praktyczne artykuły o brandingu, projektowaniu i tym, jak wycisnąć więcej z identyfikacji wizualnej."
              }
            />
          </Reveal>
          <div className="mt-10 grid gap-6 lg:grid-cols-3">
            {latestPosts.map((post, index) => (
              <Reveal key={post.slug} delay={index * 100}>
                <Link
                  href={getBlogPostPath(post.slug)}
                  className="block h-full overflow-hidden rounded-sm border border-white/5 bg-card gold-border-hover"
                >
                  <div className="aspect-[16/10] overflow-hidden">
                    <img src={post.image} alt={post.title} loading="lazy" className="h-full w-full object-cover" />
                  </div>
                  <div className="p-6">
                    <div className="section-label mb-2">{post.category}</div>
                    <h3 className="font-display text-2xl font-black text-white">{post.title}</h3>
                    <p className="mt-3 text-sm leading-relaxed text-white/60">{post.excerpt}</p>
                    <div className="mt-4 text-xs uppercase tracking-wider text-white/35">
                      {post.readTime} · {post.publishedAt}
                    </div>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
          <div className="mt-8">
            <Link
              href={getStaticPath("blog")}
              className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-gold"
            >
              {locale === "en" ? "Go to blog" : "Przejdź do bloga"}
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      <ContactSection />
    </SiteLayout>
  );
}
