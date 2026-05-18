import { ArrowUpRight, Check, Clock3, Layers3, Package2, ShoppingBag, Sparkles } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Link, useRoute } from "wouter";
import { SectionHeading } from "@/components/site/SectionHeading";
import { SiteLayout } from "@/components/site/SiteLayout";
import { useCart } from "@/contexts/CartContext";
import { useLocale } from "@/contexts/LocaleContext";
import {
  getFaqs,
  getRelatedProjectsLocalized,
  getServiceBySlugLocalized,
} from "@/data/localizedSiteContent";
import { getServiceShopConfig } from "@/data/serviceShopConfig";
import { usePageMeta } from "@/hooks/usePageMeta";

type ServiceDetailProps = {
  forcedSlug?: string;
};

export default function ServiceDetail({ forcedSlug }: ServiceDetailProps) {
  const { locale, getPortfolioDetailPath, getStaticPath } = useLocale();
  const [, plParams] = useRoute("/uslugi/:slug");
  const [, enParams] = useRoute("/en/services/:slug");
  const slug = forcedSlug || plParams?.slug || enParams?.slug || "";
  const service = slug ? getServiceBySlugLocalized(locale, slug) : undefined;
  const faqs = getFaqs(locale);
  const { addItem } = useCart();

  const [selectedPackageSlug, setSelectedPackageSlug] = useState("");
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
  const [selectedImage, setSelectedImage] = useState("");
  const [brandName, setBrandName] = useState("");
  const [scopeDetails, setScopeDetails] = useState("");
  const [notes, setNotes] = useState("");
  const [configSelections, setConfigSelections] = useState<Record<string, string>>({});

  const selectedPackage = useMemo(() => {
    if (!service) return undefined;
    return service.packages.find((item) => item.slug === selectedPackageSlug) ?? service.packages[0];
  }, [selectedPackageSlug, service]);

  const relatedProjects = useMemo(
    () => (service ? getRelatedProjectsLocalized(locale, service.portfolioSlugs) : []),
    [locale, service],
  );

  const shopConfig = useMemo(
    () => (service ? getServiceShopConfig(locale, service.slug) : []),
    [locale, service],
  );

  const galleryImages = useMemo(() => {
    if (!service) return [];

    const images = [service.coverImage, ...relatedProjects.map((project) => project.image)].filter(
      Boolean,
    ) as string[];

    return Array.from(new Set(images));
  }, [relatedProjects, service]);

  const configurationSummary = useMemo(
    () =>
      shopConfig
        .map((field) => {
          const selectedValue = configSelections[field.id] ?? field.choices[0]?.value;
          const selectedChoice = field.choices.find((choice) => choice.value === selectedValue);

          if (!selectedChoice) return null;

          return {
            label: field.label,
            value: selectedChoice.label,
            priceDelta: selectedChoice.priceDelta,
          };
        })
        .filter((item): item is NonNullable<typeof item> => item !== null),
    [configSelections, shopConfig],
  );

  const formatPackagePrice = (price: number, priceLabel?: string) =>
    priceLabel ?? (locale === "en" ? `${price} PLN` : `${price} zł`);

  const selectedAddonsList = useMemo(() => {
    if (!selectedPackage) return [];
    return selectedPackage.addons.filter((addon) => selectedAddons.includes(addon.name));
  }, [selectedAddons, selectedPackage]);

  const configurationTotal = configurationSummary.reduce((sum, item) => sum + item.priceDelta, 0);
  const addonsTotal = selectedAddonsList.reduce((sum, addon) => sum + addon.price, 0);
  const orderTotal = (selectedPackage?.price ?? 0) + configurationTotal + addonsTotal;

  useEffect(() => {
    if (!service) return;

    setSelectedPackageSlug(service.packages[0]?.slug ?? "");
    setSelectedAddons([]);
    setBrandName("");
    setScopeDetails("");
    setNotes("");
    setSelectedImage(service.coverImage ?? "");
    setConfigSelections(
      Object.fromEntries(
        getServiceShopConfig(locale, service.slug).map((field) => [
          field.id,
          field.choices[0]?.value ?? "",
        ]),
      ),
    );
  }, [locale, service]);

  useEffect(() => {
    if (!galleryImages.length) return;
    setSelectedImage((current) => (current && galleryImages.includes(current) ? current : galleryImages[0]));
  }, [galleryImages]);

  usePageMeta(
    service
      ? `${service.name} | DatiVe Design`
      : locale === "en"
        ? "Service | DatiVe Design"
        : "Usługa | DatiVe Design",
    service?.heroDescription ??
      (locale === "en"
        ? "DatiVe Design service page with offer details, packages, portfolio, FAQ and online ordering."
        : "Podstrona usługi DatiVe Design z opisem, pakietami, portfolio, FAQ i wejściem do zamówienia online."),
    {
      locale,
      path:
        locale === "en" && slug
          ? `/en/services/${slug}`
          : slug
            ? `/${slug}`
            : getStaticPath("services"),
    },
  );

  if (!service || !selectedPackage) {
    return (
      <SiteLayout>
        <section className="container py-24">
          <SectionHeading
            eyebrow={locale === "en" ? "Service" : "Usługa"}
            title={locale === "en" ? "This service was not found" : "Nie znaleziono takiej usługi"}
            description={
              locale === "en"
                ? "Check the full offer and choose the service that matches what you want to order."
                : "Sprawdź pełną ofertę i wybierz usługę, która pasuje do tego, co chcesz zamówić."
            }
          />
          <div className="mt-8">
            <Link
              href={getStaticPath("services")}
              className="text-sm font-bold uppercase tracking-wider text-gold"
            >
              {locale === "en" ? "Back to services" : "Wróć do usług"}
            </Link>
          </div>
        </section>
      </SiteLayout>
    );
  }

  const toggleAddon = (addonName: string) => {
    setSelectedAddons((current) =>
      current.includes(addonName)
        ? current.filter((item) => item !== addonName)
        : [...current, addonName],
    );
  };

  const handlePackageChange = (nextSlug: string) => {
    setSelectedPackageSlug(nextSlug);
    setSelectedAddons([]);
  };

  const handleConfigChange = (fieldId: string, nextValue: string) => {
    setConfigSelections((current) => ({
      ...current,
      [fieldId]: nextValue,
    }));
  };

  const handleAddToCart = () => {
    addItem({
      id: crypto.randomUUID(),
      serviceSlug: service.slug,
      serviceName: service.name,
      packageSlug: selectedPackage.slug,
      packageName: selectedPackage.name,
      price: selectedPackage.price + configurationTotal,
      turnaround: selectedPackage.turnaround,
      revisions: selectedPackage.revisions,
      addons: selectedAddonsList,
      configuration: configurationSummary,
      brandName,
      scopeDetails,
      notes,
    });

    toast.success(locale === "en" ? "Product added to cart." : "Produkt dodany do koszyka.");
  };

  return (
    <SiteLayout>
      <section className="container py-14 sm:py-24">
        <div className="grid gap-8 xl:grid-cols-[1.05fr_0.95fr] xl:gap-14">
          <div className="grid gap-8 sm:gap-16">
            <div>
              <div className="section-label mb-3 sm:mb-4">{service.category}</div>
              <h1 className="font-display text-[2.25rem] font-black leading-[1.04] text-white sm:text-5xl lg:text-6xl">
                {service.name}
              </h1>
              <p className="mt-3 text-base leading-relaxed text-gold sm:mt-4 sm:text-xl">{service.tagline}</p>
              <p className="mt-4 max-w-3xl text-sm leading-relaxed text-white/68 sm:mt-6 sm:text-lg">
                {service.heroDescription}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
              <div className="rounded-sm border border-white/8 bg-card p-3 sm:p-4">
                <div className="text-xs font-bold uppercase tracking-[0.2em] text-white/35">
                  {locale === "en" ? "Starting from" : "Start od"}
                </div>
                <div className="mt-2 font-display text-xl font-black text-gold sm:mt-3 sm:text-2xl">
                  {formatPackagePrice(selectedPackage.price, selectedPackage.priceLabel)}
                </div>
              </div>
              <div className="rounded-sm border border-white/8 bg-card p-3 sm:p-4">
                <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-white/35">
                  <Clock3 size={14} className="text-gold" />
                  {locale === "en" ? "Turnaround" : "Termin"}
                </div>
                <div className="mt-3 text-sm font-semibold text-white/78">{selectedPackage.turnaround}</div>
              </div>
              <div className="rounded-sm border border-white/8 bg-card p-3 sm:p-4">
                <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-white/35">
                  <Layers3 size={14} className="text-gold" />
                  {locale === "en" ? "Packages" : "Pakiety"}
                </div>
                <div className="mt-3 text-sm font-semibold text-white/78">
                  {service.packages.length} {locale === "en" ? "options inside" : "opcje do wyboru"}
                </div>
              </div>
              <div className="rounded-sm border border-white/8 bg-card p-3 sm:p-4">
                <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-white/35">
                  <Package2 size={14} className="text-gold" />
                  {locale === "en" ? "Files" : "Pliki"}
                </div>
                <div className="mt-3 text-sm font-semibold text-white/78">
                  {service.deliverables.length} {locale === "en" ? "deliverables listed" : "pozycji w pakiecie"}
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {service.benefits.map((benefit) => (
                <div key={benefit} className="inline-flex items-start gap-3 text-sm text-white/68">
                  <Check size={16} className="mt-0.5 shrink-0 text-gold" />
                  <span>{benefit}</span>
                </div>
              ))}
            </div>

            <div className="product-media-frame overflow-hidden rounded-sm border border-white/5 bg-card">
              <div className="aspect-[16/11] overflow-hidden bg-background">
                <img
                  src={selectedImage || service.coverImage || "/blog-cover.svg"}
                  alt={service.name}
                  fetchPriority="high"
                  decoding="async"
                  sizes="(max-width: 1279px) 100vw, 52vw"
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="flex items-center justify-between gap-3 border-t border-white/5 px-3 py-3 sm:px-4">
                <div className="text-xs font-bold uppercase tracking-[0.2em] text-white/35">
                  {locale === "en" ? "Product gallery" : "Galeria produktu"}
                </div>
                <div className="text-xs text-white/45">
                  {galleryImages.length} {locale === "en" ? "visuals inside" : "widoki w środku"}
                </div>
              </div>
              <div className="grid grid-cols-4 gap-2 border-t border-white/5 p-3 sm:gap-3 sm:p-4">
                {galleryImages.map((image, index) => (
                  <button
                    key={`${image}-${index}`}
                    type="button"
                    onClick={() => setSelectedImage(image)}
                    className={`overflow-hidden rounded-sm border transition-colors ${
                      selectedImage === image ? "border-gold" : "border-white/10 hover:border-gold/30"
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${service.name} ${index + 1}`}
                      loading="lazy"
                      decoding="async"
                      sizes="(max-width: 640px) 25vw, 180px"
                      className="aspect-[4/3] h-full w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="grid gap-5 lg:grid-cols-2 lg:gap-10">
              <div className="rounded-sm border border-white/5 bg-card p-5 sm:p-8">
                <SectionHeading
                  eyebrow={locale === "en" ? "Benefits" : "Korzyści"}
                  title={locale === "en" ? "What the client is actually buying" : "Co realnie kupuje klient"}
                  description={
                    locale === "en"
                      ? "Not just a file. They are buying a process, predictable scope and a design prepared for real use."
                      : "Nie sam plik. Kupuje uporządkowany proces, przewidywalny zakres i projekt przygotowany pod realne użycie."
                  }
                />
                <div className="mt-8 grid gap-4">
                  {service.benefits.map((benefit) => (
                    <div key={benefit} className="inline-flex items-center gap-3 text-sm text-white/68">
                      <Check size={16} className="text-gold" />
                      {benefit}
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-sm border border-white/5 bg-card p-5 sm:p-8">
                <SectionHeading
                  eyebrow={locale === "en" ? "Deliverables" : "Pliki końcowe"}
                  title={locale === "en" ? "What you get at the end" : "Co dostajesz na końcu"}
                  description={
                    locale === "en"
                      ? "The scope depends on the package, but the client should see right away which files and assets are delivered."
                      : "Zakres zależy od pakietu, ale klient od razu widzi, jakie pliki i materiały będą przekazane."
                  }
                />
                <div className="mt-8 flex flex-wrap gap-3">
                  {service.deliverables.map((item) => (
                    <span
                      key={item}
                      className="rounded-full border border-white/10 bg-background px-4 py-2 text-sm text-white/60"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <aside className="product-panel self-start rounded-sm border border-gold/20 p-4 sm:p-8 xl:sticky xl:top-24">
            <div className="section-label mb-3">
              {locale === "en" ? "Product configuration" : "Konfiguracja produktu"}
            </div>
            <h2 className="font-display text-xl font-black text-white sm:text-2xl">
              {locale === "en" ? "Choose package, parameters and add-ons" : "Wybierz pakiet, parametry i dodatki"}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-white/55">
              {locale === "en"
                ? "Open the product, compare package depth, set the scope and see a live price preview before it lands in the cart."
                : "Tutaj porównujesz pakiety, ustawiasz zakres i od razu widzisz podgląd ceny, zanim produkt wyląduje w koszyku."}
            </p>

            <div className="mt-5 grid gap-2 sm:mt-6 sm:grid-cols-3 sm:gap-3 xl:grid-cols-1 2xl:grid-cols-3">
              <div className="rounded-sm border border-white/10 bg-background/80 p-3 sm:p-4">
                <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/35">
                  {locale === "en" ? "Current package" : "Wybrany pakiet"}
                </div>
                <div className="mt-2 text-sm font-semibold text-white">{selectedPackage.name}</div>
              </div>
              <div className="rounded-sm border border-white/10 bg-background/80 p-3 sm:p-4">
                <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/35">
                  {locale === "en" ? "Revisions" : "Poprawki"}
                </div>
                <div className="mt-2 text-sm font-semibold text-white">{selectedPackage.revisions}</div>
              </div>
              <div className="rounded-sm border border-white/10 bg-background/80 p-3 sm:p-4">
                <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/35">
                  {locale === "en" ? "Delivery" : "Realizacja"}
                </div>
                <div className="mt-2 text-sm font-semibold text-white">{selectedPackage.turnaround}</div>
              </div>
            </div>

            <div className="mt-5 grid gap-2 sm:mt-6 sm:gap-3">
              {service.packages.map((item) => {
                const isActive = item.slug === selectedPackage.slug;
                return (
                  <button
                    key={item.slug}
                    type="button"
                    onClick={() => handlePackageChange(item.slug)}
                    className={`rounded-sm border p-3 text-left transition-colors sm:p-4 ${
                      isActive ? "border-gold bg-gold/10" : "border-white/10 bg-background hover:border-gold/30"
                    }`}
                  >
                    <div className="grid gap-3 sm:flex sm:items-start sm:justify-between sm:gap-4">
                      <div>
                        <div className="font-display text-base font-black text-white sm:text-xl">{item.name}</div>
                        <div className="mt-1 hidden text-sm text-white/55 sm:block">{item.description}</div>
                      </div>
                      <div className="text-left sm:text-right">
                        <div className="font-display text-lg font-black text-gold sm:text-2xl">
                          {formatPackagePrice(item.price, item.priceLabel)}
                        </div>
                        <div className="text-xs uppercase tracking-wide text-white/35">{item.turnaround}</div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {selectedPackage.priceLabel ? (
              <p className="mt-4 text-xs leading-relaxed text-white/45">
                {locale === "en"
                  ? "For packages with a price range, the calculator and cart start from the lower bracket. The final scope is confirmed before production."
                  : "Przy pakietach z widełkami kalkulator i koszyk startują od dolnego progu cenowego. Finalny zakres potwierdzany jest przed realizacją."}
              </p>
            ) : null}

            {shopConfig.length > 0 ? (
              <div className="mt-8 grid gap-5">
                <div className="text-xs font-bold uppercase tracking-wider text-white/35">
                {locale === "en" ? "Calculator" : "Kalkulator"}
                </div>
                {shopConfig.map((field) => (
                  <div key={field.id} className="rounded-sm border border-white/10 bg-background p-3 sm:p-4">
                    <div className="font-bold text-white">{field.label}</div>
                    {field.description ? (
                      <p className="mt-1 hidden text-sm leading-relaxed text-white/50 sm:block">{field.description}</p>
                    ) : null}
                    <div className="mt-4 grid gap-2">
                      {field.choices.map((choice) => {
                        const isActive = (configSelections[field.id] ?? field.choices[0]?.value) === choice.value;
                        return (
                          <button
                            key={choice.value}
                            type="button"
                            onClick={() => handleConfigChange(field.id, choice.value)}
                            className={`flex items-center justify-between gap-3 rounded-sm border px-3 py-2.5 text-left text-sm transition-colors sm:gap-4 sm:px-4 sm:py-3 ${
                              isActive
                                ? "border-gold bg-gold/10 text-white"
                                : "border-white/10 text-white/65 hover:border-gold/30"
                            }`}
                          >
                            <span>{choice.label}</span>
                            <span className="text-gold">
                              {choice.priceDelta > 0
                                ? `+${choice.priceDelta} ${locale === "en" ? "PLN" : "zł"}`
                                : locale === "en"
                                  ? "included"
                                  : "w cenie"}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            ) : null}

            <div className="mt-8 grid gap-4">
              <div className="text-xs font-bold uppercase tracking-wider text-white/35">
                {locale === "en" ? "Project parameters" : "Parametry projektu"}
              </div>
              <input
                value={brandName}
                onChange={(event) => setBrandName(event.target.value)}
                placeholder={locale === "en" ? "Brand / company name" : "Nazwa marki / firmy"}
                className="h-11 rounded-sm border border-white/10 bg-background px-3 text-sm text-white outline-none sm:h-12 sm:px-4"
              />
              <input
                value={scopeDetails}
                onChange={(event) => setScopeDetails(event.target.value)}
                placeholder={
                  locale === "en"
                    ? "Format, dimensions, quantity or basic project scope"
                    : "Format, wymiary, ilość albo podstawowy zakres projektu"
                }
                className="h-11 rounded-sm border border-white/10 bg-background px-3 text-sm text-white outline-none sm:h-12 sm:px-4"
              />
              <textarea
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                placeholder={
                  locale === "en"
                    ? "Add notes, inspiration or what should definitely be included."
                    : "Dodaj notatki, inspiracje albo to, co ma się koniecznie znaleźć w projekcie."
                }
                className="min-h-24 rounded-sm border border-white/10 bg-background px-3 py-3 text-sm text-white outline-none sm:min-h-28 sm:px-4"
              />
            </div>

            <div className="mt-6 rounded-sm border border-white/10 bg-background p-4 sm:mt-8 sm:p-5">
              <div className="grid gap-3 sm:flex sm:items-start sm:justify-between sm:gap-4">
                <div>
                  <div className="font-display text-lg font-black text-white sm:text-xl">{selectedPackage.name}</div>
                  <div className="mt-1 text-sm text-white/50">{selectedPackage.revisions}</div>
                </div>
                <div className="text-left sm:text-right">
                  <div className="font-display text-2xl font-black text-gold sm:text-3xl">
                    {locale === "en" ? `${orderTotal} PLN` : `${orderTotal} zł`}
                  </div>
                  <div className="text-xs uppercase tracking-wide text-white/35">
                    {locale === "en" ? "Current preview" : "Aktualna wycena"}
                  </div>
                </div>
              </div>

              <div className="mt-5 rounded-sm border border-white/10 bg-card px-4 py-3">
                <div className="flex items-center justify-between gap-4 text-xs font-bold uppercase tracking-[0.2em] text-white/35">
                  <span>{locale === "en" ? "What is already included" : "Co już masz w środku"}</span>
                  <span className="text-gold">{locale === "en" ? "Base scope" : "Zakres bazowy"}</span>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {service.deliverables.slice(0, 4).map((item) => (
                    <span
                      key={item}
                      className="rounded-full border border-white/10 bg-background px-3 py-1 text-[11px] font-medium text-white/62"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              {configurationSummary.length > 0 ? (
                <div className="mt-5 grid gap-2 border-t border-white/10 pt-5">
                  {configurationSummary.map((item) => (
                    <div key={item.label} className="flex items-center justify-between gap-3 text-sm text-white/62">
                      <span>
                        {item.label}: {item.value}
                      </span>
                      <span className="text-gold">
                        {item.priceDelta > 0
                          ? `+${item.priceDelta} ${locale === "en" ? "PLN" : "zł"}`
                          : locale === "en"
                            ? "included"
                            : "w cenie"}
                      </span>
                    </div>
                  ))}
                </div>
              ) : null}

              <div className="mt-5">
                <div className="mb-3 text-xs font-bold uppercase tracking-wider text-white/35">
                  {locale === "en" ? "Add-ons" : "Dodatki"}
                </div>
                <div className="grid gap-3">
                  {selectedPackage.addons.map((addon) => {
                    const checked = selectedAddons.includes(addon.name);
                    return (
                      <label
                        key={addon.name}
                        className="flex items-center justify-between gap-3 rounded-sm border border-white/10 px-4 py-3 text-sm text-white/70"
                      >
                        <span className="inline-flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleAddon(addon.name)}
                            className="h-4 w-4 accent-[oklch(0.72_0.12_85)]"
                          />
                          {addon.name}
                        </span>
                        <span className="text-gold">+{addon.price} zł</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <button
                type="button"
                onClick={handleAddToCart}
                className="gold-button-shimmer mt-5 inline-flex w-full items-center justify-center gap-2 rounded-sm px-5 py-3 text-xs font-black uppercase tracking-wider text-background sm:mt-6 sm:px-6 sm:py-4 sm:text-sm"
              >
                <ShoppingBag size={16} />
                {locale === "en" ? "Add to cart" : "Dodaj do koszyka"}
              </button>
              <Link
                href={getStaticPath("cart")}
                className="mt-2.5 inline-flex w-full items-center justify-center gap-2 rounded-sm border border-gold/30 px-5 py-3 text-xs font-black uppercase tracking-wider text-gold sm:mt-3 sm:px-6 sm:py-4 sm:text-sm"
              >
                {locale === "en" ? "Go to cart" : "Przejdź do koszyka"}
              </Link>
              <Link
                href={getStaticPath("order")}
                className="mt-2.5 inline-flex w-full items-center justify-center gap-2 rounded-sm border border-white/10 px-5 py-3 text-xs font-black uppercase tracking-wider text-white/65 sm:mt-3 sm:px-6 sm:py-4 sm:text-sm"
              >
                {locale === "en" ? "Compare more products" : "Porównaj więcej produktów"}
                <ArrowUpRight size={15} />
              </Link>
            </div>
          </aside>
        </div>
      </section>

      <section className="container content-auto-section py-16">
        <SectionHeading
          eyebrow={locale === "en" ? "Related portfolio" : "Powiązane portfolio"}
          title={locale === "en" ? "Projects related to this product" : "Realizacje powiązane z tym produktem"}
          description={
            locale === "en"
              ? "This is where the product stops being abstract. The client sees concrete examples and real-world use."
              : "Tutaj produkt przestaje być abstrakcją. Klient widzi konkretne przykłady i realne zastosowanie."
          }
        />
        <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {relatedProjects.map((project) => (
            <Link
              key={project.slug}
              href={getPortfolioDetailPath(project.slug)}
              className="group overflow-hidden rounded-sm border border-white/5 bg-card"
            >
              <div className="aspect-square overflow-hidden">
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
                <h3 className="font-display text-xl font-black text-white">{project.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/60">{project.summary}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="container content-auto-section py-16">
        <SectionHeading
          eyebrow="FAQ"
          title={locale === "en" ? "Questions before buying the product" : "Pytania przed zakupem produktu"}
          description={
            locale === "en"
              ? "A section that supports both conversion and SEO by closing common objections."
              : "Sekcja, która wspiera sprzedaż i SEO, bo zamyka najczęstsze obiekcje przed zakupem."
          }
        />
        <div className="mt-10 grid gap-5 lg:grid-cols-2">
          {faqs.map((faq) => (
            <article key={faq.id} className="rounded-sm border border-white/5 bg-card p-6">
              <h3 className="font-display text-xl font-black text-white">{faq.question}</h3>
              <p className="mt-3 text-sm leading-relaxed text-white/65">{faq.answer}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="container content-auto-section py-16">
        <SectionHeading
          eyebrow="SEO"
          title={locale === "en" ? "Long-form service copy" : "Rozbudowany opis usługi"}
          description={
            locale === "en"
              ? "Longer copy for search and for the client who needs more context before buying."
              : "Miejsce na dłuższy opis pod wyszukiwarkę i pod klienta, który chce więcej konkretu przed zakupem."
          }
        />
        <div className="mt-8 grid gap-5">
          {service.seoText.map((paragraph) => (
            <div
              key={paragraph}
              className="rounded-sm border border-white/5 bg-card p-6 text-sm leading-relaxed text-white/68 sm:text-base"
            >
              {paragraph}
            </div>
          ))}
        </div>
      </section>

      <section className="container content-auto-section py-20">
        <div className="rounded-sm border border-gold/20 bg-gradient-to-r from-gold/12 via-card to-card p-8 sm:p-10">
          <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <div className="section-label mb-3">CTA</div>
              <h2 className="font-display text-3xl font-black text-white sm:text-4xl">
                {locale === "en" ? "Want to compare other products" : "Chcesz porównać inne produkty"}
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/65">
                {locale === "en"
                  ? "Go back to the shop feed or jump straight to the cart if this product already fits."
                  : "Wróć do feedu sklepu albo przejdź od razu do koszyka, jeśli ten produkt już Ci pasuje."}
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href={getStaticPath("order")}
                className="inline-flex items-center justify-center gap-2 rounded-sm border border-gold/30 px-7 py-4 text-sm font-black uppercase tracking-wider text-gold"
              >
                <Sparkles size={16} />
                {locale === "en" ? "Back to shop" : "Wróć do sklepu"}
              </Link>
              <button
                type="button"
                onClick={handleAddToCart}
                className="gold-button-shimmer inline-flex items-center justify-center gap-2 rounded-sm px-7 py-4 text-sm font-black uppercase tracking-wider text-background"
              >
                <ShoppingBag size={16} />
                {locale === "en" ? "Add to cart" : "Dodaj do koszyka"}
              </button>
            </div>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
