import { FileText, Mail, ShoppingBag } from "lucide-react";
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

type QuoteForm = {
  name: string;
  email: string;
  phone: string;
  company: string;
  taxId: string;
  notes: string;
};

const initialForm: QuoteForm = {
  name: "",
  email: "",
  phone: "",
  company: "",
  taxId: "",
  notes: "",
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

type FieldProps = {
  label: string;
  required?: boolean;
  children: React.ReactNode;
};

function Field({ label, required, children }: FieldProps) {
  return (
    <label className="grid gap-1.5">
      <span className="text-[0.65rem] font-black uppercase tracking-[0.18em] text-white/38">
        {label}
        {required ? <span className="ml-1 text-gold">*</span> : null}
      </span>
      {children}
    </label>
  );
}

export default function CheckoutPage() {
  const { items, subtotal, clearCart } = useCart();
  const { locale, getStaticPath } = useLocale();
  const { createCheckoutOrder, isSubmitting } = useOrderFlow();
  const [, navigate] = useLocation();
  const [form, setForm] = useState<QuoteForm>(initialForm);

  usePageMeta(
    locale === "en" ? "Quote request | DatiVe Design" : "Zapytanie o wycenę | DatiVe Design",
    locale === "en"
      ? "Send a free quote request for the selected DatiVe Design services. You will receive a tailored quote and next steps by email."
      : "Wyślij bezpłatne zapytanie o wycenę wybranych usług DatiVe Design. Dostaniesz dopasowaną wycenę i dalsze kroki na maila.",
    { locale, path: getStaticPath("checkout"), robots: "noindex, follow" }
  );

  const inputClass =
    "h-12 w-full rounded-sm border border-white/10 bg-background px-4 text-sm text-white outline-none transition focus:border-gold/45 disabled:opacity-60";

  if (items.length === 0) {
    return (
      <SiteLayout>
        <section className="container py-24">
          <SectionHeading
            as="h1"
            eyebrow={locale === "en" ? "Quote request" : "Zapytanie o wycenę"}
            title={locale === "en" ? "Your inquiry is empty" : "Twoje zapytanie jest puste"}
            description={
              locale === "en"
                ? "Choose a service and package first - then send everything as one quote request."
                : "Najpierw wybierz usługę i pakiet - potem wyślesz wszystko jako jedno zapytanie o wycenę."
            }
          />
          <div className="mt-8">
            <Link
              href={getStaticPath("order")}
              className="gold-button-shimmer inline-flex items-center justify-center rounded-sm px-7 py-4 text-sm font-black uppercase tracking-wider text-background"
            >
              {locale === "en" ? "Browse services" : "Przeglądaj usługi"}
            </Link>
          </div>
        </section>
      </SiteLayout>
    );
  }

  const submitQuote = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form.name.trim() || !form.email.trim()) {
      toast.error(
        locale === "en"
          ? "Enter your name and email so we can reply with the quote."
          : "Podaj imię i adres e-mail, żebyśmy mogli odesłać wycenę."
      );
      return;
    }

    if (!EMAIL_RE.test(form.email.trim())) {
      toast.error(
        locale === "en" ? "This email address looks invalid." : "Ten adres e-mail wygląda na niepoprawny."
      );
      return;
    }

    try {
      await createCheckoutOrder({
        locale,
        items,
        subtotal,
        customer: {
          name: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          company: form.company.trim(),
          taxId: form.taxId.trim(),
          paymentMethod: locale === "en" ? "quote request" : "zapytanie o wycenę",
          notes: form.notes.trim(),
        },
      });
      clearCart();
      toast.success(
        locale === "en" ? "Quote request sent!" : "Zapytanie o wycenę wysłane!"
      );
      navigate(getStaticPath("brief"));
    } catch {
      toast.error(
        locale === "en"
          ? "The request could not be sent. Please try again."
          : "Nie udało się wysłać zapytania. Spróbuj ponownie."
      );
    }
  };

  return (
    <SiteLayout>
      <section className="container py-20 sm:py-24">
        <Reveal>
          <SectionHeading
            as="h1"
            eyebrow={locale === "en" ? "Quote request" : "Zapytanie o wycenę"}
            title={locale === "en" ? "Send a free quote request" : "Wyślij bezpłatne zapytanie o wycenę"}
            description={
              locale === "en"
                ? "No payment now, no obligation. You send the selected packages with your contact details - we reply by email with a tailored quote and next steps."
                : "Bez płatności i bez zobowiązań. Wysyłasz wybrane pakiety ze swoimi danymi kontaktowymi - odpowiadamy mailem z dopasowaną wyceną i dalszymi krokami."
            }
          />
        </Reveal>

        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          <div className="rounded-sm border border-white/8 bg-card px-5 py-4">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-gold">
              <ShoppingBag size={14} />
              {locale === "en" ? "1. Selection" : "1. Wybór"}
            </div>
            <div className="mt-3 text-sm text-white/72">
              {locale === "en" ? "Your services and packages are picked." : "Usługi i pakiety masz już wybrane."}
            </div>
          </div>
          <div className="rounded-sm border border-gold/20 bg-gold/8 px-5 py-4">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-gold">
              <Mail size={14} />
              {locale === "en" ? "2. Request" : "2. Zapytanie"}
            </div>
            <div className="mt-3 text-sm text-white/72">
              {locale === "en"
                ? "Leave your contact details and send the inquiry."
                : "Zostaw dane kontaktowe i wyślij zapytanie."}
            </div>
          </div>
          <div className="rounded-sm border border-white/8 bg-card px-5 py-4">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-gold">
              <FileText size={14} />
              {locale === "en" ? "3. Quote" : "3. Wycena"}
            </div>
            <div className="mt-3 text-sm text-white/72">
              {locale === "en"
                ? "You get the quote and next steps by email."
                : "Wycenę i dalsze kroki dostajesz na maila."}
            </div>
          </div>
        </div>

        <div className="mt-10 grid gap-8 xl:grid-cols-[1fr_0.9fr]">
          <form onSubmit={submitQuote} className="rounded-sm border border-white/5 bg-card p-6 sm:p-8">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label={locale === "en" ? "Full name" : "Imię i nazwisko"} required>
                <input
                  disabled={isSubmitting}
                  autoComplete="name"
                  value={form.name}
                  onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                  placeholder={locale === "en" ? "e.g. John Smith" : "np. Jan Kowalski"}
                  className={inputClass}
                />
              </Field>
              <Field label={locale === "en" ? "Email address" : "Adres e-mail"} required>
                <input
                  disabled={isSubmitting}
                  type="email"
                  autoComplete="email"
                  value={form.email}
                  onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                  placeholder={locale === "en" ? "e.g. john@company.com" : "np. jan@firma.pl"}
                  className={inputClass}
                />
              </Field>
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Field label={locale === "en" ? "Phone (optional)" : "Telefon (opcjonalnie)"}>
                <input
                  disabled={isSubmitting}
                  type="tel"
                  autoComplete="tel"
                  value={form.phone}
                  onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))}
                  placeholder={locale === "en" ? "If you prefer a call" : "Jeśli wolisz kontakt telefoniczny"}
                  className={inputClass}
                />
              </Field>
              <Field label={locale === "en" ? "Company / brand (optional)" : "Firma / marka (opcjonalnie)"}>
                <input
                  disabled={isSubmitting}
                  autoComplete="organization"
                  value={form.company}
                  onChange={(event) => setForm((current) => ({ ...current, company: event.target.value }))}
                  placeholder={locale === "en" ? "Who is the project for?" : "Dla kogo jest projekt?"}
                  className={inputClass}
                />
              </Field>
            </div>

            <div className="mt-4">
              <Field label={locale === "en" ? "Tax ID (optional)" : "NIP (opcjonalnie)"}>
                <input
                  disabled={isSubmitting}
                  value={form.taxId}
                  onChange={(event) => setForm((current) => ({ ...current, taxId: event.target.value }))}
                  placeholder={locale === "en" ? "For the invoice later" : "Do późniejszej faktury"}
                  className={inputClass}
                />
              </Field>
            </div>

            <div className="mt-4">
              <Field label={locale === "en" ? "Message (optional)" : "Wiadomość (opcjonalnie)"}>
                <textarea
                  disabled={isSubmitting}
                  value={form.notes}
                  onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))}
                  placeholder={
                    locale === "en"
                      ? "Anything that helps with the quote: deadline, budget range, links, questions."
                      : "Wszystko, co pomoże w wycenie: termin, widełki budżetu, linki, pytania."
                  }
                  className="min-h-32 w-full rounded-sm border border-white/10 bg-background px-4 py-3 text-sm text-white outline-none transition focus:border-gold/45 disabled:opacity-60"
                />
              </Field>
            </div>

            <button
              disabled={isSubmitting}
              type="submit"
              className="gold-button-shimmer mt-6 inline-flex w-full items-center justify-center gap-2 rounded-sm px-6 py-4 text-sm font-black uppercase tracking-wider text-background disabled:opacity-60"
            >
              <Mail size={16} />
              {isSubmitting
                ? locale === "en"
                  ? "Sending..."
                  : "Wysyłanie..."
                : locale === "en"
                  ? "Send quote request"
                  : "Wyślij zapytanie o wycenę"}
            </button>

            <p className="mt-3 text-center text-xs leading-relaxed text-white/40">
              {locale === "en"
                ? "Free and non-binding. We reply within 24h on business days."
                : "Bezpłatnie i bez zobowiązań. Odpowiadamy do 24h w dni robocze."}
            </p>
          </form>

          <aside className="self-start rounded-sm border border-gold/20 bg-card p-6 sm:p-8">
            <div className="section-label mb-3">{locale === "en" ? "Your inquiry" : "Twoje zapytanie"}</div>
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
              <span className="text-sm text-white/55">
                {locale === "en" ? "Price-list estimate" : "Suma wg cennika"}
              </span>
              <span className="font-display text-4xl font-black text-gold">{subtotal} zł</span>
            </div>

            <div className="mt-6 grid gap-3 text-sm text-white/60">
              <div>
                {locale === "en"
                  ? "This is the price-list total for your selection. The final quote lands in your inbox after we review the scope."
                  : "To suma cennikowa Twojego wyboru. Ostateczna wycena przyjdzie na maila po weryfikacji zakresu."}
              </div>
              <div>
                {locale === "en"
                  ? "After sending you can optionally add a project brief - it speeds up the quote."
                  : "Po wysłaniu możesz opcjonalnie uzupełnić brief projektowy - to przyspiesza wycenę."}
              </div>
            </div>
          </aside>
        </div>
      </section>
    </SiteLayout>
  );
}
