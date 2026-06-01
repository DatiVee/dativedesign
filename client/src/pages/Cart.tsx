import { ArrowRight, CheckCircle2, FileText, ShoppingBag, Trash2 } from "lucide-react";
import { Link } from "wouter";
import { Reveal } from "@/components/site/Reveal";
import { SectionHeading } from "@/components/site/SectionHeading";
import { SiteLayout } from "@/components/site/SiteLayout";
import { useCart } from "@/contexts/CartContext";
import { useLocale } from "@/contexts/LocaleContext";
import { usePageMeta } from "@/hooks/usePageMeta";

export default function CartPage() {
  const { items, subtotal, removeItem, clearCart } = useCart();
  const { locale, getServicePath, getStaticPath } = useLocale();

  usePageMeta(
    locale === "en" ? "Cart | DatiVe Design" : "Koszyk | DatiVe Design",
    locale === "en"
      ? "Cart for DatiVe Design graphic services. Review selected packages, extras, pricing and move to checkout."
      : "Koszyk usług graficznych DatiVe Design. Sprawdź wybrane pakiety, dodatki, cenę i przejdź do checkoutu.",
    { locale, path: getStaticPath("cart"), robots: "noindex, follow" }
  );

  if (items.length === 0) {
    return (
      <SiteLayout>
        <section className="container py-24">
          <SectionHeading
            eyebrow={locale === "en" ? "Cart" : "Koszyk"}
            title={locale === "en" ? "Your cart is empty" : "Koszyk jest pusty"}
            description={
              locale === "en"
                ? "Choose a service or package first. Then you can move to checkout and the project brief."
                : "Najpierw wybierz usługę albo gotowy pakiet. Potem przejdziesz do checkoutu i briefu projektowego."
            }
          />
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href={getStaticPath("order")}
              className="gold-button-shimmer inline-flex items-center justify-center gap-2 rounded-sm px-7 py-4 text-sm font-black uppercase tracking-wider text-background"
            >
              <ShoppingBag size={16} />
              {locale === "en" ? "Go to offer" : "Przejdź do oferty"}
            </Link>
            <Link
              href={getStaticPath("services")}
              className="inline-flex items-center justify-center gap-2 rounded-sm border border-gold/30 px-7 py-4 text-sm font-black uppercase tracking-wider text-gold"
            >
              {locale === "en" ? "See services" : "Zobacz usługi"}
            </Link>
          </div>
        </section>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <section className="container py-20 sm:py-24">
        <Reveal>
          <SectionHeading
            eyebrow={locale === "en" ? "Cart" : "Koszyk"}
            title={locale === "en" ? "Order summary" : "Podsumowanie zamówienia"}
            description={
              locale === "en"
                ? "A clear view of what you're buying, what affects the price and what happens right after checkout."
                : "Przejrzysty widok tego, co kupujesz, co wpływa na cenę i co wydarzy się zaraz po checkoutcie."
            }
          />
        </Reveal>

        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {(locale === "en"
            ? [
                "1. Review the selected product and package.",
                "2. Move to checkout and confirm customer details.",
                "3. After checkout, complete the project brief.",
              ]
            : [
                "1. Sprawdź wybrany produkt i pakiet.",
                "2. Przejdź do checkoutu i potwierdź dane klienta.",
                "3. Po checkoutcie uzupełnij brief projektowy.",
              ]).map((item, index) => (
            <Reveal key={item} delay={index * 80} as="div" className="rounded-sm border border-white/8 bg-card px-5 py-4">
              <div className="text-xs font-bold uppercase tracking-[0.2em] text-gold">0{index + 1}</div>
              <div className="mt-3 text-sm leading-relaxed text-white/72">{item}</div>
            </Reveal>
          ))}
        </div>

        <div className="mt-10 grid gap-8 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="grid gap-5">
            {items.map((item) => {
              const addonsTotal = item.addons.reduce((sum, addon) => sum + addon.price, 0);

              return (
                <article key={item.id} className="rounded-sm border border-white/5 bg-card p-6">
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <div className="section-label mb-2">{item.serviceName}</div>
                      <h2 className="font-display text-2xl font-black text-white">{item.packageName}</h2>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <span className="rounded-full bg-white/5 px-3 py-1 text-xs text-white/50">{item.turnaround}</span>
                        <span className="rounded-full bg-white/5 px-3 py-1 text-xs text-white/50">{item.revisions}</span>
                      </div>
                      <div className="mt-4">
                        <Link
                          href={getServicePath(item.serviceSlug)}
                          className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gold"
                        >
                          {locale === "en" ? "Edit product" : "Edytuj produkt"}
                          <ArrowRight size={14} />
                        </Link>
                      </div>

                      {item.addons.length > 0 ? (
                        <div className="mt-5">
                          <div className="mb-2 text-xs font-bold uppercase tracking-wider text-white/35">
                            {locale === "en" ? "Add-ons" : "Dodatki"}
                          </div>
                          <div className="grid gap-2">
                            {item.addons.map((addon) => (
                              <div key={addon.name} className="text-sm text-white/60">
                                {addon.name} · +{addon.price} zł
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : null}

                      {item.configuration.length > 0 ? (
                        <div className="mt-5">
                          <div className="mb-2 text-xs font-bold uppercase tracking-wider text-white/35">
                            {locale === "en" ? "Configuration" : "Konfiguracja"}
                          </div>
                          <div className="grid gap-2">
                            {item.configuration.map((config) => (
                              <div key={`${config.label}-${config.value}`} className="text-sm text-white/60">
                                {config.label}: {config.value}
                                {config.priceDelta > 0 ? ` · +${config.priceDelta} ${locale === "en" ? "PLN" : "zł"}` : ""}
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : null}

                      {item.brandName || item.scopeDetails || item.notes ? (
                        <div className="mt-5">
                          <div className="mb-2 text-xs font-bold uppercase tracking-wider text-white/35">
                            Brief
                          </div>
                          <div className="grid gap-2 text-sm text-white/60">
                            {item.brandName ? <div>{locale === "en" ? "Brand" : "Marka"}: {item.brandName}</div> : null}
                            {item.scopeDetails ? <div>{locale === "en" ? "Scope" : "Zakres"}: {item.scopeDetails}</div> : null}
                            {item.notes ? <div>{locale === "en" ? "Notes" : "Notatki"}: {item.notes}</div> : null}
                          </div>
                        </div>
                      ) : null}
                    </div>

                    <div className="flex shrink-0 flex-col items-start gap-4 lg:items-end">
                      <div className="font-display text-3xl font-black text-gold">{item.price + addonsTotal} zł</div>
                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        className="inline-flex items-center gap-2 text-sm font-bold text-white/55 transition-colors hover:text-red-400"
                      >
                        <Trash2 size={16} />
                        {locale === "en" ? "Remove" : "Usuń"}
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          <aside className="rounded-sm border border-gold/20 bg-card p-6 sm:p-8">
            <div className="section-label mb-3">{locale === "en" ? "Summary" : "Podsumowanie"}</div>
            <h2 className="font-display text-2xl font-black text-white">{locale === "en" ? "Total due" : "Do zapłaty"}</h2>
            <div className="mt-6 flex items-end justify-between gap-4 border-b border-white/5 pb-6">
              <span className="text-sm text-white/55">
                {locale === "en" ? "Services and add-ons total" : "Suma usług i dodatków"}
              </span>
              <span className="font-display text-4xl font-black text-gold">{subtotal} zł</span>
            </div>

            <div className="mt-6 grid gap-3">
              <div className="rounded-sm border border-white/10 bg-background px-4 py-4 text-sm text-white/65">
                <div className="inline-flex items-center gap-2 font-bold text-white">
                  <CheckCircle2 size={16} className="text-gold" />
                  {locale === "en" ? "What happens next" : "Co dzieje się dalej"}
                </div>
                <div className="mt-3 leading-relaxed">
                  {locale === "en"
                    ? "After checkout you go straight to a short project brief. That's where we collect everything needed to start your project."
                    : "Po checkoutcie przejdziesz od razu do krótkiego briefu projektowego. To tam zbieramy wszystko, co potrzebne, żeby ruszyć z Twoim projektem."}
                </div>
              </div>
              <div className="rounded-sm border border-white/10 bg-background px-4 py-4 text-sm text-white/65">
                <div className="inline-flex items-center gap-2 font-bold text-white">
                  <FileText size={16} className="text-gold" />
                  {locale === "en" ? "No risk" : "Bez ryzyka"}
                </div>
                <div className="mt-3 leading-relaxed">
                  {locale === "en"
                    ? "Placing the order is the start of our conversation. We confirm the scope and timeline with you before any work begins."
                    : "Złożenie zamówienia to początek rozmowy. Zakres i termin potwierdzamy z Tobą, zanim ruszymy z realizacją."}
                </div>
              </div>
            </div>

            <div className="mt-8 grid gap-3">
              <Link
                href={getStaticPath("checkout")}
                className="gold-button-shimmer inline-flex items-center justify-center gap-2 rounded-sm px-6 py-4 text-sm font-black uppercase tracking-wider text-background"
              >
                {locale === "en" ? "Go to checkout" : "Przejdź do checkoutu"}
                <ArrowRight size={16} />
              </Link>
              <button
                type="button"
                onClick={clearCart}
                className="inline-flex items-center justify-center rounded-sm border border-white/10 px-6 py-4 text-sm font-black uppercase tracking-wider text-white/60"
              >
                {locale === "en" ? "Clear cart" : "Wyczyść koszyk"}
              </button>
            </div>
          </aside>
        </div>
      </section>
    </SiteLayout>
  );
}
