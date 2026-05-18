import { startTransition, useDeferredValue, useMemo, useState } from "react";
import { ArrowRight, Star } from "lucide-react";
import { Link } from "wouter";
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
      <section className="container py-20 sm:py-24">
        <SectionHeading
          eyebrow={locale === "en" ? "Shop" : "Sklep"}
          title={locale === "en" ? "Graphic design store" : "Sklep z usługami graficznymi"}
          description={
            locale === "en"
              ? "Browse products, open the product card, choose a package and order online."
              : "Przeglądaj produkty, otwieraj kartę produktu, wybieraj pakiet i zamawiaj online."
          }
        />

        <div className="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-sm border border-white/5 bg-card/50 px-5 py-4">
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
              <h2 className="font-display text-3xl font-black text-white sm:text-4xl">
                {locale === "en" ? "Most-chosen products" : "Najczęściej wybierane produkty"}
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/62 sm:text-base">
                {locale === "en"
                  ? "The fastest way into the store. These are the products clients open and order most often."
                  : "Najprostsze wejście do sklepu. To produkty, które klienci najczęściej otwierają i zamawiają."}
              </p>
            </div>
            <Link
              href={getStaticPath("cart")}
              className="hidden rounded-sm border border-gold/30 px-4 py-3 text-xs font-black uppercase tracking-wider text-gold lg:inline-flex"
            >
              {locale === "en" ? "Go to cart" : "Przejdź do koszyka"}
            </Link>
          </div>

          <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {bestSellers.map((service) => {
              const lowestPackage = service.packages[0];

              return (
                <article
                  key={`bestseller-${service.slug}`}
                  className="group flex h-full flex-col overflow-hidden rounded-sm border border-gold/15 bg-card transition-colors hover:border-gold/30"
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

                  <div className="flex flex-1 flex-col p-5">
                    <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-white/35">
                      {service.category}
                    </div>
                    <h3 className="mt-3 min-h-[5.25rem] font-display text-2xl font-black text-white">
                      {service.name}
                    </h3>
                    <p className="mt-2 min-h-[3.5rem] text-sm text-gold">{service.tagline}</p>

                    <div className="mt-5 min-h-[4.5rem]">
                      <div className="flex items-end justify-between gap-4">
                        <div>
                          <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/35">
                            {locale === "en" ? "Starting price" : "Cena startowa"}
                          </div>
                          <div className="mt-1 font-display text-2xl font-black text-gold">
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
                        className="gold-button-shimmer inline-flex w-full items-center justify-center gap-2 rounded-sm px-4 py-3 text-sm font-black uppercase tracking-wider text-background"
                      >
                        {locale === "en" ? "Open product" : "Otwórz produkt"}
                        <ArrowRight size={16} />
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
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
                className={`rounded-full px-4 py-2 text-xs font-black uppercase tracking-wider transition-colors ${
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

        <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filteredServices.map((service) => {
            const lowestPackage = service.packages[0];

            return (
              <article
                key={service.slug}
                className="content-auto-card group flex h-full flex-col overflow-hidden rounded-sm border border-white/5 bg-card transition-colors hover:border-gold/25"
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

                <div className="flex flex-1 flex-col p-5">
                  <div className="text-xs font-bold uppercase tracking-[0.22em] text-white/35">
                    {locale === "en" ? "Product" : "Produkt"}
                  </div>
                  <h2 className="mt-3 min-h-[4.5rem] font-display text-3xl font-black text-white">
                    {service.name}
                  </h2>
                  <p className="mt-2 min-h-[2.8rem] text-base text-gold">{service.tagline}</p>
                  <p className="mt-4 min-h-[3.5rem] text-sm leading-relaxed text-white/65">
                    {service.shortDescription}
                  </p>

                  <div className="mt-5 min-h-[4rem]">
                    <div className="flex items-end justify-between gap-4">
                      <div>
                        <div className="text-xs font-bold uppercase tracking-wider text-white/35">
                          {locale === "en" ? "Starting price" : "Cena startowa"}
                        </div>
                        <div className="mt-1 font-display text-3xl font-black text-gold">
                          {formatListingPrice(locale, lowestPackage.price, lowestPackage.priceLabel)}
                        </div>
                      </div>
                      <div className="text-right text-xs leading-relaxed text-white/45">
                        <div>{locale === "en" ? "Gallery inside" : "Galeria w środku"}</div>
                        <div>{locale === "en" ? "Configurator inside" : "Konfigurator w środku"}</div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 min-h-[3.5rem]">
                    <div className="flex flex-wrap gap-2">
                      {service.deliverables.slice(0, 2).map((item) => (
                        <span key={item} className="rounded-full bg-white/5 px-3 py-1 text-xs text-white/50">
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mt-auto pt-5">
                    <div className="flex flex-wrap gap-3">
                      <Link
                        href={getServicePath(service.slug)}
                        className="gold-button-shimmer inline-flex items-center justify-center gap-2 rounded-sm px-5 py-2.5 text-sm font-black uppercase tracking-wider text-background"
                      >
                        {locale === "en" ? "Open product" : "Otwórz produkt"}
                        <ArrowRight size={16} />
                      </Link>
                      <Link
                        href={getStaticPath("cart")}
                        className="inline-flex items-center justify-center rounded-sm border border-gold/30 px-5 py-2.5 text-sm font-black uppercase tracking-wider text-gold"
                      >
                        {locale === "en" ? "Go to cart" : "Przejdź do koszyka"}
                      </Link>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </SiteLayout>
  );
}
