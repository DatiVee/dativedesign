import { startTransition, useDeferredValue, useMemo, useState } from "react";
import { ArrowRight, Star } from "lucide-react";
import { Link } from "wouter";
import { Reveal } from "@/components/site/Reveal";
import { SectionHeading } from "@/components/site/SectionHeading";
import { SiteLayout } from "@/components/site/SiteLayout";
import { useLocale } from "@/contexts/LocaleContext";
import { getServices } from "@/data/localizedSiteContent";
import type { Service } from "@/data/siteContent";
import { usePageMeta } from "@/hooks/usePageMeta";

function formatListingPrice(locale: "pl" | "en", price: number, priceLabel?: string) {
  if (priceLabel) return priceLabel;
  return locale === "en" ? `from ${price} PLN` : `od ${price} zł`;
}

export default function OrderPage() {
  const { locale, getServicePath, getStaticPath } = useLocale();
  const services = getServices(locale);
  const allLabel = locale === "en" ? "All" : "Wszystkie";
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const deferredCategory = useDeferredValue(activeCategory);

  const categories = useMemo(
    () => [allLabel, ...Array.from(new Set(services.map((service) => service.category)))],
    [allLabel, services],
  );

  const filteredServices = useMemo(() => {
    if (deferredCategory === "all" || deferredCategory === allLabel) {
      return services;
    }

    return services.filter((service) => service.category === deferredCategory);
  }, [allLabel, deferredCategory, services]);

  const bestSellerSlugs = ["projekt-logo", "karykatura", "projekt-wizytowki", "wektoryzacja-logo"];
  const bestSellers = useMemo(
    () =>
      bestSellerSlugs
        .map((slug) => services.find((service) => service.slug === slug))
        .filter((service): service is Service => Boolean(service)),
    [services],
  );

  usePageMeta(
    locale === "en" ? "Shop | DatiVe Design" : "Sklep | DatiVe Design",
    locale === "en"
      ? "Browse graphic design services in a product feed, open a product page, compare packages, use the configurator and order online."
      : "Przeglądaj usługi graficzne w formie sklepu, otwieraj karty produktów, porównuj pakiety, konfiguruj zakres i zamawiaj online.",
    { locale, path: getStaticPath("order") },
  );

  return (
    <SiteLayout>
      <section className="container py-14 sm:py-24">
        <Reveal>
          <SectionHeading
            eyebrow={locale === "en" ? "Shop" : "Sklep"}
            title={locale === "en" ? "Graphic design store" : "Sklep z usługami graficznymi"}
            description={
              locale === "en"
                ? "Browse products, open the product card, choose a package and order online."
                : "Przeglądaj produkty, otwieraj kartę produktu, wybieraj pakiet i zamawiaj online."
            }
          />
        </Reveal>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-sm border border-white/5 bg-card/50 px-4 py-3 sm:mt-8 sm:px-5 sm:py-4">
          <div className="text-sm text-white/62">
            {locale === "en"
              ? `${services.length} products available. Open a card to see the gallery, packages and configuration.`
              : `${services.length} produktów w ofercie. Otwórz kartę, żeby zobaczyć galerię, pakiety i konfigurację.`}
          </div>
          <div className="text-xs font-bold uppercase tracking-[0.2em] text-gold">
            {locale === "en" ? "From 149 PLN" : "Od 149 zł"}
          </div>
        </div>

        <div className="mt-10">
          <div className="flex items-end justify-between gap-4">
            <div>
              <div className="section-label mb-3 inline-flex items-center gap-2">
                <Star size={14} />
                {locale === "en" ? "Bestsellers" : "Bestsellery"}
              </div>
              <h2 className="font-display text-2xl font-black text-white sm:text-4xl">
                {locale === "en" ? "Most-chosen products" : "Najczęściej wybierane produkty"}
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/62 sm:text-base">
                {locale === "en"
                  ? "The products clients choose most often."
                  : "Produkty, które klienci wybierają najczęściej."}
              </p>
            </div>
            <Link
              href={getStaticPath("cart")}
              className="hidden rounded-sm border border-gold/30 px-4 py-3 text-xs font-black uppercase tracking-wider text-gold lg:inline-flex"
            >
              {locale === "en" ? "Go to cart" : "Przejdź do koszyka"}
            </Link>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {bestSellers.map((service, index) => {
              const lowestPackage = service.packages[0];

              return (
                <Reveal
                  key={`bestseller-${service.slug}`}
                  delay={index * 80}
                  as="article"
                  className="group flex h-full flex-col overflow-hidden rounded-sm border border-gold/15 bg-card gold-border-hover"
                >
                  <Link href={getServicePath(service.slug)} className="block">
                    <div className="relative aspect-[4/3] overflow-hidden bg-background">
                      <img
                        src={service.coverImage ?? "/blog-cover.svg"}
                        alt={service.name}
                        loading="lazy"
                        decoding="async"
                        sizes="(max-width: 767px) 100vw, (max-width: 1279px) 50vw, 25vw"
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/10 to-transparent" />
                      <div className="absolute left-4 top-4 rounded-full border border-gold/30 bg-background/75 px-3 py-1 text-[11px] font-black uppercase tracking-wider text-gold backdrop-blur">
                        Bestseller
                      </div>
                    </div>
                  </Link>

                  <div className="flex flex-1 flex-col p-4 sm:p-5">
                    <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-white/35">
                      {service.category}
                    </div>
                    <h3 className="mt-2 font-display text-xl font-black text-white sm:mt-3 sm:text-2xl">
                      {service.name}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-gold">{service.tagline}</p>

                    <div className="mt-4 sm:mt-5">
                      <div className="flex items-end justify-between gap-4">
                        <div>
                          <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/35">
                            {locale === "en" ? "Starting price" : "Cena startowa"}
                          </div>
                          <div className="mt-1 font-display text-xl font-black text-gold sm:text-2xl">
                            {formatListingPrice(locale, lowestPackage.price, lowestPackage.priceLabel)}
                          </div>
                        </div>
                        <div className="text-right text-[11px] leading-relaxed text-white/45">
                          <div>
                            {service.packages.length} {locale === "en" ? "packages" : "pakiety"}
                          </div>
                          <div>{locale === "en" ? "Open product" : "Otwórz produkt"}</div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-auto pt-5">
                      <Link
                        href={getServicePath(service.slug)}
                        className="gold-button-shimmer inline-flex w-full items-center justify-center gap-2 rounded-sm px-4 py-3 text-xs font-black uppercase tracking-wider text-background sm:text-sm"
                      >
                        {locale === "en" ? "Open product" : "Otwórz produkt"}
                        <ArrowRight size={16} />
                      </Link>
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>

        <div className="mt-7 flex gap-2 overflow-x-auto pb-2 sm:flex-wrap sm:gap-3 sm:overflow-visible sm:pb-0">
          {categories.map((category) => {
            const nextValue = category === allLabel ? "all" : category;
            const isActive = activeCategory === nextValue;

            return (
              <button
                key={category}
                type="button"
                onClick={() => {
                  startTransition(() => {
                    setActiveCategory(nextValue);
                  });
                }}
                className={`shrink-0 rounded-full px-3 py-2 text-[11px] font-black uppercase tracking-wider transition-colors sm:px-4 sm:text-xs ${
                  isActive
                    ? "bg-gold text-background"
                    : "border border-white/10 bg-card text-white/55 hover:border-gold/30 hover:text-gold"
                }`}
              >
                {category}
              </button>
            );
          })}
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filteredServices.map((service, index) => {
            const lowestPackage = service.packages[0];

            return (
              <Reveal
                key={service.slug}
                delay={(index % 3) * 80}
                as="article"
                className="content-auto-card group flex h-full flex-col overflow-hidden rounded-sm border border-white/5 bg-card gold-border-hover"
              >
                <Link href={getServicePath(service.slug)} className="block">
                  <div className="relative aspect-[16/10] overflow-hidden bg-background">
                    <img
                      src={service.coverImage ?? "/blog-cover.svg"}
                      alt={service.name}
                      loading="lazy"
                      decoding="async"
                      sizes="(max-width: 767px) 100vw, (max-width: 1279px) 50vw, 33vw"
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/70 via-background/10 to-transparent" />
                    <div className="absolute bottom-4 left-4 flex flex-wrap gap-2">
                      <span className="rounded-full border border-gold/30 bg-background/70 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-gold backdrop-blur">
                        {service.category}
                      </span>
                      <span className="rounded-full border border-white/10 bg-background/60 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white/70 backdrop-blur">
                        {service.packages.length} {locale === "en" ? "packages" : "pakiety"}
                      </span>
                    </div>
                  </div>
                </Link>

                <div className="flex flex-1 flex-col p-4 sm:p-5">
                  <div className="text-xs font-bold uppercase tracking-[0.22em] text-white/35">
                    {locale === "en" ? "Product" : "Produkt"}
                  </div>
                  <h2 className="mt-2 font-display text-xl font-black text-white sm:mt-3 sm:text-3xl">
                    {service.name}
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-gold sm:text-base">{service.tagline}</p>
                  <p className="mt-3 text-sm leading-relaxed text-white/65 sm:mt-4">
                    {service.shortDescription}
                  </p>

                  <div className="mt-4 sm:mt-5">
                    <div className="flex items-end justify-between gap-3">
                      <div>
                        <div className="text-xs font-bold uppercase tracking-wider text-white/35">
                          {locale === "en" ? "Starting price" : "Cena startowa"}
                        </div>
                        <div className="mt-1 font-display text-2xl font-black text-gold sm:text-3xl">
                          {formatListingPrice(locale, lowestPackage.price, lowestPackage.priceLabel)}
                        </div>
                      </div>
                      <div className="text-right text-xs leading-relaxed text-white/45">
                        <div>{locale === "en" ? "Gallery inside" : "Galeria w środku"}</div>
                        <div>{locale === "en" ? "Configurator inside" : "Konfigurator w środku"}</div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 sm:mt-5">
                    <div className="flex flex-wrap gap-2">
                      {service.deliverables.slice(0, 2).map((item) => (
                        <span key={item} className="rounded-full bg-white/5 px-3 py-1 text-xs text-white/50">
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mt-auto pt-5">
                    <div className="grid gap-2 sm:flex sm:flex-wrap sm:gap-3">
                      <Link
                        href={getServicePath(service.slug)}
                        className="gold-button-shimmer inline-flex items-center justify-center gap-2 rounded-sm px-4 py-2.5 text-xs font-black uppercase tracking-wider text-background sm:px-5 sm:text-sm"
                      >
                        {locale === "en" ? "Open product" : "Otwórz produkt"}
                        <ArrowRight size={16} />
                      </Link>
                      <Link
                        href={getStaticPath("cart")}
                        className="inline-flex items-center justify-center rounded-sm border border-gold/30 px-4 py-2.5 text-xs font-black uppercase tracking-wider text-gold sm:px-5 sm:text-sm"
                      >
                        {locale === "en" ? "Go to cart" : "Przejdź do koszyka"}
                      </Link>
                    </div>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </section>
    </SiteLayout>
  );
}
