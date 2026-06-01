import { CreditCard, FileText, ShoppingBag } from "lucide-react";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Link, useLocation } from "wouter";
import { Reveal } from "@/components/site/Reveal";
import { SectionHeading } from "@/components/site/SectionHeading";
import { SiteLayout } from "@/components/site/SiteLayout";
import { useCart } from "@/contexts/CartContext";
import { useLocale } from "@/contexts/LocaleContext";
import { useOrderFlow } from "@/contexts/OrderFlowContext";
import { usePageMeta } from "@/hooks/usePageMeta";

type CheckoutForm = {
  name: string;
  email: string;
  phone: string;
  company: string;
  taxId: string;
  payment: string;
  notes: string;
};

const initialForm: CheckoutForm = {
  name: "",
  email: "",
  phone: "",
  company: "",
  taxId: "",
  payment: "stripe",
  notes: "",
};

export default function CheckoutPage() {
  const { items, subtotal, clearCart } = useCart();
  const { locale, getStaticPath } = useLocale();
  const { createCheckoutOrder, isSubmitting } = useOrderFlow();
  const [, navigate] = useLocation();
  const [form, setForm] = useState<CheckoutForm>(initialForm);

  usePageMeta(
    "Checkout | DatiVe Design",
    locale === "en"
      ? "Checkout for DatiVe Design graphic services: selected packages, client details, payment method and the path to the brief after purchase."
      : "Checkout dla usług graficznych DatiVe Design. Podsumowanie pakietów, dane klienta, wybór płatności i przejście do briefu po zakupie.",
    { locale, path: getStaticPath("checkout"), robots: "noindex, follow" }
  );

  if (items.length === 0) {
    return (
      <SiteLayout>
        <section className="container py-24">
          <SectionHeading
            eyebrow="Checkout"
            title={locale === "en" ? "There is nothing to pay for yet" : "Nie ma czego opłacić"}
            description={
              locale === "en"
                ? "Add a service to the cart first. Checkout only makes sense when the client has selected a package."
                : "Najpierw dodaj usługę do koszyka. Checkout działa dopiero, kiedy klient ma wybrane pakiety."
            }
          />
          <div className="mt-8">
            <Link
              href={getStaticPath("order")}
              className="gold-button-shimmer inline-flex items-center justify-center rounded-sm px-7 py-4 text-sm font-black uppercase tracking-wider text-background"
            >
              {locale === "en" ? "Back to offer" : "Wróć do oferty"}
            </Link>
          </div>
        </section>
      </SiteLayout>
    );
  }

  const submitCheckout = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form.name || !form.email || !form.phone || !form.company) {
      toast.error(
        locale === "en"
          ? "Fill in the customer data before moving on."
          : "Uzupełnij dane klienta, zanim przejdziesz dalej."
      );
      return;
    }

    try {
      await createCheckoutOrder({
        locale,
        items,
        subtotal,
        customer: {
          name: form.name,
          email: form.email,
          phone: form.phone,
          company: form.company,
          taxId: form.taxId,
          paymentMethod: form.payment,
          notes: form.notes,
        },
      });
      clearCart();
      toast.success(locale === "en" ? "Order moved to brief." : "Zamówienie przeszło do briefu.");
      navigate(getStaticPath("brief"));
    } catch {
      toast.error(
        locale === "en"
          ? "The order could not be saved on the server."
          : "Nie udało się zapisać zamówienia po stronie serwera."
      );
    }
  };

  return (
    <SiteLayout>
      <section className="container py-20 sm:py-24">
        <Reveal>
          <SectionHeading
            eyebrow="Checkout"
            title={locale === "en" ? "Finalize the order and move to the brief" : "Domknij zamówienie i przejdź do briefu"}
            description={
              locale === "en"
                ? "Customer details, payment method, order summary - and then the short project brief."
                : "Dane klienta, metoda płatności, podsumowanie zamówienia - a potem krótki brief projektowy."
            }
          />
        </Reveal>

        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          <div className="rounded-sm border border-white/8 bg-card px-5 py-4">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-gold">
              <ShoppingBag size={14} />
              {locale === "en" ? "Cart" : "Koszyk"}
            </div>
            <div className="mt-3 text-sm text-white/72">
              {locale === "en" ? "The product and package are already chosen." : "Produkt i pakiet są już wybrane."}
            </div>
          </div>
          <div className="rounded-sm border border-gold/20 bg-gold/8 px-5 py-4">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-gold">
              <CreditCard size={14} />
              Checkout
            </div>
            <div className="mt-3 text-sm text-white/72">
              {locale === "en" ? "Now we confirm the buyer and payment route." : "Tutaj potwierdzamy kupującego i ścieżkę płatności."}
            </div>
          </div>
          <div className="rounded-sm border border-white/8 bg-card px-5 py-4">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-gold">
              <FileText size={14} />
              Brief
            </div>
            <div className="mt-3 text-sm text-white/72">
              {locale === "en" ? "Right after checkout, the client fills in the full project input." : "Zaraz po checkoutcie klient uzupełnia pełny brief projektowy."}
            </div>
          </div>
        </div>

        <div className="mt-10 grid gap-8 xl:grid-cols-[1fr_0.9fr]">
          <form onSubmit={submitCheckout} className="rounded-sm border border-white/5 bg-card p-6 sm:p-8">
            <div className="grid gap-4 sm:grid-cols-2">
              <input
                disabled={isSubmitting}
                value={form.name}
                onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                placeholder={locale === "en" ? "Full name" : "Imię i nazwisko"}
                className="h-12 rounded-sm border border-white/10 bg-background px-4 text-sm text-white outline-none disabled:opacity-60"
              />
              <input
                disabled={isSubmitting}
                value={form.email}
                onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                placeholder={locale === "en" ? "Email address" : "Adres e-mail"}
                className="h-12 rounded-sm border border-white/10 bg-background px-4 text-sm text-white outline-none disabled:opacity-60"
              />
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <input
                disabled={isSubmitting}
                value={form.phone}
                onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))}
                placeholder={locale === "en" ? "Phone number" : "Numer telefonu"}
                className="h-12 rounded-sm border border-white/10 bg-background px-4 text-sm text-white outline-none disabled:opacity-60"
              />
              <input
                disabled={isSubmitting}
                value={form.company}
                onChange={(event) => setForm((current) => ({ ...current, company: event.target.value }))}
                placeholder={locale === "en" ? "Company / brand" : "Firma / marka"}
                className="h-12 rounded-sm border border-white/10 bg-background px-4 text-sm text-white outline-none disabled:opacity-60"
              />
            </div>

            <input
              disabled={isSubmitting}
              value={form.taxId}
              onChange={(event) => setForm((current) => ({ ...current, taxId: event.target.value }))}
              placeholder={locale === "en" ? "Tax ID / VAT ID (optional)" : "NIP (opcjonalnie)"}
              className="mt-4 h-12 w-full rounded-sm border border-white/10 bg-background px-4 text-sm text-white outline-none disabled:opacity-60"
            />

            <div className="mt-6">
              <div className="mb-3 text-xs font-bold uppercase tracking-wider text-white/35">
                {locale === "en" ? "Payment method" : "Wybór płatności"}
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  ["stripe", "Stripe"],
                  ["przelewy24", "Przelewy24"],
                  ["blik", "BLIK"],
                  ["paypal", "PayPal"],
                ].map(([value, label]) => {
                  const active = form.payment === value;
                  return (
                    <button
                      key={value}
                      type="button"
                      disabled={isSubmitting}
                      onClick={() => setForm((current) => ({ ...current, payment: value }))}
                      className={`rounded-sm border px-4 py-3 text-left text-sm transition-colors ${
                        active ? "border-gold bg-gold/10 text-gold" : "border-white/10 bg-background text-white/65"
                      } disabled:opacity-60`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>

            <textarea
              disabled={isSubmitting}
              value={form.notes}
              onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))}
              placeholder={
                locale === "en"
                  ? "Optional order notes before the full brief: preferred contact hours, invoice notes, urgent constraints."
                  : "Opcjonalne notatki przed pełnym briefem: preferowane godziny kontaktu, uwagi do faktury, pilne ograniczenia."
              }
              className="mt-6 min-h-36 w-full rounded-sm border border-white/10 bg-background px-4 py-3 text-sm text-white outline-none disabled:opacity-60"
            />

            <button
              disabled={isSubmitting}
              type="submit"
              className="gold-button-shimmer mt-6 inline-flex w-full items-center justify-center rounded-sm px-6 py-4 text-sm font-black uppercase tracking-wider text-background disabled:opacity-60"
            >
              {isSubmitting
                ? locale === "en"
                  ? "Saving order..."
                  : "Zapisywanie zamówienia..."
                : locale === "en"
                  ? "Continue to project brief"
                  : "Przejdź do briefu projektowego"}
            </button>
          </form>

          <aside className="rounded-sm border border-gold/20 bg-card p-6 sm:p-8">
            <div className="section-label mb-3">{locale === "en" ? "Summary" : "Podsumowanie"}</div>
            <div className="grid gap-4 border-b border-white/5 pb-6">
              {items.map((item) => {
                const addonsTotal = item.addons.reduce((sum, addon) => sum + addon.price, 0);
                return (
                  <div key={item.id} className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="font-bold text-white">{item.serviceName}</div>
                      <div className="text-sm text-white/55">{item.packageName}</div>
                      {item.configuration.length > 0 ? (
                        <div className="mt-2 grid gap-1 text-xs text-white/45">
                          {item.configuration.map((config) => (
                            <div key={`${config.label}-${config.value}`}>
                              {config.label}: {config.value}
                            </div>
                          ))}
                        </div>
                      ) : null}
                    </div>
                    <div className="font-bold text-gold">{item.price + addonsTotal} zł</div>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 flex items-end justify-between gap-4">
              <span className="text-sm text-white/55">{locale === "en" ? "Total" : "Łącznie"}</span>
              <span className="font-display text-4xl font-black text-gold">{subtotal} zł</span>
            </div>

            <div className="mt-6 grid gap-3 text-sm text-white/60">
              <div>
                {locale === "en"
                  ? "After you confirm, you go straight to a short brief where you describe your project."
                  : "Po potwierdzeniu przejdziesz od razu do krótkiego briefu, w którym opiszesz swój projekt."}
              </div>
              <div>
                {locale === "en"
                  ? "We confirm the scope, price and timeline with you before starting any work."
                  : "Zakres, cenę i termin potwierdzamy z Tobą, zanim rozpoczniemy pracę."}
              </div>
            </div>
          </aside>
        </div>
      </section>
    </SiteLayout>
  );
}
