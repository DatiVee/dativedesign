import { ArrowRight, Check, ShoppingBag, Sparkles, Star } from "lucide-react";
import { Link } from "wouter";
import { ContactSection } from "@/components/site/ContactSection";
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
          primary: "See portfolio",
          secondary: "Order project",
          values: ["PROFESSIONALISM", "EXPERIENCE", "INNOVATION"],
        }
      : {
          label: "Projektant graficzny - Rzeszów / Kolbuszowa",
          titleTop: "Z POMYSŁU",
          titleBottom: "DO REALIZACJI",
          description:
            "Profesjonalne usługi graficzne dla Twojej firmy. Tworzę identyfikacje wizualne, etykiety, materiały drukowane i grafiki reklamowe, które wyróżniają Twoją markę.",
          primary: "Zobacz portfolio",
          secondary: "Zamów projekt",
          values: ["PROFESJONALIZM", "DOŚWIADCZENIE", "INNOWACYJNOŚĆ"],
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

        <div className="relative container py-16 sm:py-28 lg:py-36">
          <div className="max-w-5xl">
            <div className="section-label mb-4 sm:mb-5">{hero.label}</div>
            <h1 className="max-w-4xl font-display text-[2.7rem] font-black leading-[1.02] text-white sm:text-6xl sm:leading-[0.94] lg:text-8xl">
              <span className="block">{hero.titleTop}</span>
              <span className="block text-gold">{hero.titleBottom}</span>
            </h1>
            <p className="mt-5 max-w-2xl text-sm leading-relaxed text-white/68 sm:mt-6 sm:text-lg">
              {hero.description}
            </p>

            <div className="mt-7 flex flex-col gap-2.5 sm:mt-9 sm:flex-row sm:gap-3">
              <Link
                href={getStaticPath("portfolio")}
                className="gold-button-shimmer inline-flex items-center justify-center gap-2 rounded-sm px-5 py-3 text-xs font-black uppercase tracking-wider text-background sm:px-7 sm:py-4 sm:text-sm"
              >
                <ShoppingBag size={18} />
                {hero.primary}
              </Link>
              <Link
                href={getStaticPath("order")}
                className="inline-flex items-center justify-center gap-2 rounded-sm border border-gold/30 px-5 py-3 text-xs font-black uppercase tracking-wider text-gold transition-colors hover:bg-gold/10 sm:px-7 sm:py-4 sm:text-sm"
              >
                {hero.secondary}
                <ArrowRight size={18} />
              </Link>
            </div>

            <div className="mt-7 flex flex-wrap gap-x-4 gap-y-2 text-xs text-white/55 sm:mt-10 sm:gap-5 sm:text-sm">
              {hero.values.map((item) => (
                <span key={item} className="inline-flex items-center gap-2">
                  <Check size={16} className="text-gold" />
                  {item}
                </span>
              ))}
            </div>
          </div>

          <a
            href="#home-overview"
            className="absolute bottom-10 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 text-xs font-semibold uppercase tracking-[0.28em] text-white/45 transition-colors hover:text-gold md:flex"
          >
            <span>{locale === "en" ? "Scroll" : "Przewiń"}</span>
            <span className="text-gold">↓</span>
          </a>
        </div>

        <div className="relative overflow-hidden border-t border-gold/15 bg-gold/8 py-3 sm:py-5">
          <div className="flex min-w-max animate-marquee gap-8 whitespace-nowrap">
            {[...marqueeItems, ...marqueeItems].map((item, index) => (
              <span
                key={`${item}-${index}`}
                className="font-display text-xs font-bold uppercase tracking-[0.14em] text-gold/90 sm:text-sm sm:tracking-[0.18em]"
              >
                {item}
                <span className="ml-8 text-gold/45">•</span>
              </span>
            ))}
          </div>
        </div>
      </section>

      <section id="home-overview" className="py-20">
        <div className="container grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {companyStats.map((stat) => (
            <div key={stat.label} className="rounded-sm border border-white/5 bg-card p-6">
              <div className="font-display text-4xl font-black text-gold">{stat.value}</div>
              <div className="mt-2 text-sm text-white/65">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="py-20">
        <div className="container grid items-start gap-14 lg:grid-cols-[1fr_1.05fr]">
          <div>
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
                  className="rounded-sm border border-gold/25 px-4 py-2 text-xs font-bold uppercase tracking-wide text-gold"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            {(locale === "en"
              ? [
                  ["100%", "Client recommendations", "based on real feedback"],
                  ["100+", "Active audience", "a growing community around the brand"],
                  ["Multiple", "Industries", "different clients and different visual needs"],
                  ["Direct", "Contact without middlemen", "you speak directly with the person doing the work"],
                ]
              : [
                  ["100%", "Poleceń od klientów", "na podstawie opinii"],
                  ["100+", "Obserwujących", "aktywnie rosnąca społeczność"],
                  ["Różne", "Branże", "Różnorodne projekty"],
                  ["Kontakt", "Bez pośredników", "rozmawiasz bezpośrednio ze mną"],
                ]
            ).map(([value, title, text]) => (
              <article key={`${value}-${title}`} className="rounded-sm border border-white/5 bg-card p-6">
                <div className="font-display text-4xl font-black text-gold">{value}</div>
                <div className="mt-3 text-lg font-black text-white">{title}</div>
                <p className="mt-2 text-sm leading-relaxed text-white/55">{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container">
          <SectionHeading
            eyebrow={locale === "en" ? "Popular services" : "Najpopularniejsze usługi"}
            title={locale === "en" ? "Services ready" : "Usługi gotowe"}
            accent={locale === "en" ? "to order" : "do zamówienia"}
            description={
              locale === "en"
                ? "Each service has its own URL, benefits, portfolio, packages, FAQ and a direct path to the cart."
                : "Każda usługa ma własny URL, opis, korzyści, portfolio, pakiety, FAQ i przejście do koszyka."
            }
          />
          <div className="mt-10 grid gap-6 lg:grid-cols-3">
            {featuredServices.map((service) => (
              <article key={service.slug} className="rounded-sm border border-white/5 bg-card p-6">
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
                <div className="mt-6 flex flex-wrap gap-3">
                  <Link href={getServicePath(service.slug)} className="inline-flex items-center gap-2 text-sm font-bold text-gold">
                    {locale === "en" ? "Service details" : "Szczegóły usługi"}
                    <ArrowRight size={16} />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container">
          <SectionHeading
            eyebrow="Portfolio"
            title={locale === "en" ? "Selected work" : "Wybrane realizacje"}
            description={
              locale === "en"
                ? "This is not a gallery for the sake of a gallery. Each project should show design thinking, quality and real-world application."
                : "To nie jest galeria dla galerii. Każdy projekt ma pokazać sposób myślenia, jakość wykonania i realne zastosowanie w marce."
            }
          />
          <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {homepageProjects.map((project) => (
              <Link
                key={project.slug}
                href={getPortfolioDetailPath(project.slug)}
                className="group overflow-hidden rounded-sm border border-white/5 bg-card"
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
            ))}
          </div>
          <div className="mt-10">
            <Link href={getStaticPath("portfolio")} className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-gold">
              {locale === "en" ? "See full portfolio" : "Zobacz pełne portfolio"}
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container">
          <SectionHeading
            eyebrow={locale === "en" ? "Client reviews" : "Opinie klientów"}
            title={locale === "en" ? "100% recommendation rate" : "100% rekomendacji"}
            description={
              locale === "en"
                ? "Clients should get more than good-looking visuals. They should get a clear process, reliable communication and a predictable result."
                : "Klient ma dostać nie tylko estetykę, ale też dobry proces, komunikację i przewidywalny efekt."
            }
          />
          <div className="mt-8 flex flex-wrap gap-3">
            {(locale === "en"
              ? ["300+ happy clients", "5/5 rating", "Refined projects", "Direct contact"]
              : ["300+ zadowolonych klientów", "5/5 ocena", "Dopracowane projekty", "Kontakt bez pośredników"]
            ).map((item) => (
              <span
                key={item}
                className="rounded-full border border-gold/20 bg-gold/8 px-4 py-2 text-xs font-bold uppercase tracking-wide text-gold"
              >
                {item}
              </span>
            ))}
          </div>
          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            {testimonials.map((review) => (
              <article key={review.id} className="rounded-sm border border-white/5 bg-card p-6">
                <div className="mb-4 flex gap-1">
                  {Array.from({ length: review.rating }).map((_, index) => (
                    <Star key={`${review.id}-${index}`} size={16} className="fill-gold text-gold" />
                  ))}
                </div>
                <p className="text-lg italic leading-relaxed text-white/72">"{review.quote}"</p>
                <div className="mt-5 text-sm text-white/50">
                  <span className="font-bold text-white">{review.name}</span> · {review.company} · {review.service}
                </div>
              </article>
            ))}
          </div>
          <div className="mt-8">
            <Link href={getStaticPath("reviews")} className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-gold">
              {locale === "en" ? "See all reviews" : "Zobacz wszystkie opinie"}
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container">
          <SectionHeading
            eyebrow="FAQ"
            title={locale === "en" ? "Questions that block a purchase" : "Pytania, które blokują zakup"}
            description={
              locale === "en"
                ? "Straight answers, no hidden details about revisions, files, timelines or payments."
                : "Najważniejsze odpowiedzi podane wprost. Bez chowania detali o poprawkach, plikach, terminach czy płatnościach."
            }
          />
          <div className="mt-10 grid gap-5 lg:grid-cols-2">
            {faqs.slice(0, 4).map((faq) => (
              <article key={faq.id} className="rounded-sm border border-white/5 bg-card p-6">
                <h3 className="font-display text-xl font-black text-white">{faq.question}</h3>
                <p className="mt-3 text-sm leading-relaxed text-white/65">{faq.answer}</p>
              </article>
            ))}
          </div>
          <div className="mt-8">
            <Link href={getStaticPath("faq")} className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-gold">
              {locale === "en" ? "See full FAQ" : "Zobacz pełne FAQ"}
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container">
          <div className="rounded-sm border border-gold/20 bg-gradient-to-r from-gold/12 via-card to-card p-8 sm:p-10">
            <div className="grid gap-8 lg:grid-cols-[1.2fr_auto] lg:items-center">
              <div>
                <div className="section-label mb-3">{locale === "en" ? "Shop" : "Sklep"}</div>
                <h2 className="font-display text-4xl font-black text-white sm:text-5xl">
                  {locale === "en"
                    ? "Order a design service online and choose the right package right away"
                    : "Zamów usługę graficzną online i od razu wybierz odpowiedni pakiet"}
                </h2>
                <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/65 sm:text-base">
                  {locale === "en"
                    ? "Compare services, add extras to the cart and move to checkout with a cleaner, more structured buying flow."
                    : "Porównaj usługi, dodaj dodatki do koszyka i przejdź do checkoutu bez chaosu i bez przeciągania całego procesu."}
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
        </div>
      </section>

      <section className="py-20">
        <div className="container">
          <SectionHeading
            eyebrow="Blog"
            title={locale === "en" ? "Latest articles" : "Ostatnie wpisy"}
            description={
              locale === "en"
                ? "The blog supports both SEO and sales. The content should answer questions before the client even sends a message."
                : "Blog ma wspierać SEO i sprzedaż. Artykuły odpowiadają na pytania klientów, zanim ci w ogóle napiszą wiadomość."
            }
          />
          <div className="mt-10 grid gap-6 lg:grid-cols-3">
            {latestPosts.map((post) => (
              <Link
                key={post.slug}
                href={getBlogPostPath(post.slug)}
                className="overflow-hidden rounded-sm border border-white/5 bg-card"
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
            ))}
          </div>
          <div className="mt-8">
            <Link href={getStaticPath("blog")} className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-gold">
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
