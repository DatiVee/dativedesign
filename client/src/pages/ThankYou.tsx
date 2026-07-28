import { CheckCircle2, FileText, Mail, ShoppingBag } from "lucide-react";
import { Link } from "wouter";
import { Reveal } from "@/components/site/Reveal";
import { SectionHeading } from "@/components/site/SectionHeading";
import { SiteLayout } from "@/components/site/SiteLayout";
import { useLocale } from "@/contexts/LocaleContext";
import { useOrderFlow } from "@/contexts/OrderFlowContext";
import { usePageMeta } from "@/hooks/usePageMeta";

export default function ThankYouPage() {
  const { locale, getStaticPath } = useLocale();
  const { activeOrder } = useOrderFlow();

  usePageMeta(
    locale === "en" ? "Thank You | DatiVe Design" : "Dziękujemy | DatiVe Design",
    locale === "en"
      ? "Quote request confirmation for DatiVe Design. Summary of the selected services and next steps."
      : "Potwierdzenie zapytania o wycenę DatiVe Design. Podsumowanie wybranych usług i dalsze kroki.",
    { locale, path: getStaticPath("thankYou"), robots: "noindex, follow" }
  );

  const briefDone = activeOrder?.status === "brief_submitted";

  if (!activeOrder) {
    return (
      <SiteLayout>
        <section className="container py-24">
          <SectionHeading
            as="h1"
            eyebrow={locale === "en" ? "Thank you" : "Dziękujemy"}
            title={locale === "en" ? "There is no recent inquiry to display" : "Nie ma świeżego zapytania do wyświetlenia"}
            description={
              locale === "en"
                ? "The confirmation page appears after you send a quote request."
                : "Strona potwierdzenia pojawia się po wysłaniu zapytania o wycenę."
            }
          />
          <div className="mt-8">
            <Link
              href={getStaticPath("order")}
              className="gold-button-shimmer inline-flex items-center justify-center rounded-sm px-7 py-4 text-sm font-black uppercase tracking-wider text-background"
            >
              {locale === "en" ? "Back to shop" : "Wróć do sklepu"}
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
            as="h1"
            eyebrow={locale === "en" ? "Thank you" : "Dziękujemy"}
            title={locale === "en" ? "Your quote request has been sent" : "Twoje zapytanie o wycenę zostało wysłane"}
            description={
              locale === "en"
                ? "We will review the scope and reply by email with a tailored quote and next steps - usually within 24h on business days."
                : "Sprawdzimy zakres i odpowiemy mailem z dopasowaną wyceną i dalszymi krokami - zwykle do 24h w dni robocze."
            }
          />
        </Reveal>

        <div className="mt-10 rounded-sm border border-gold/20 bg-gradient-to-r from-gold/12 via-card to-card p-6 sm:p-8">
          <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <div className="section-label mb-3">{locale === "en" ? "Inquiry number" : "Numer zapytania"}</div>
              <h2 className="font-display text-4xl font-black text-white">{activeOrder.number}</h2>
              <p className="mt-4 max-w-3xl text-sm leading-relaxed text-white/65">
                {briefDone
                  ? locale === "en"
                    ? "Your inquiry and the project brief have reached us. Keep this number - we will reference it in the quote email."
                    : "Twoje zapytanie razem z briefem projektowym do nas dotarło. Zachowaj ten numer - powołamy się na niego w mailu z wyceną."
                  : locale === "en"
                    ? "Your inquiry has reached us. Keep this number - we will reference it in the quote email."
                    : "Twoje zapytanie do nas dotarło. Zachowaj ten numer - powołamy się na niego w mailu z wyceną."}
              </p>
            </div>
            <div className="rounded-sm border border-white/10 bg-background px-5 py-4 text-right">
              <div className="text-xs font-bold uppercase tracking-[0.2em] text-white/35">
                {locale === "en" ? "Status" : "Status"}
              </div>
              <div className="mt-3 text-lg font-semibold text-gold">
                {briefDone
                  ? locale === "en"
                    ? "Inquiry + brief sent"
                    : "Zapytanie + brief wysłane"
                  : locale === "en"
                    ? "Inquiry sent"
                    : "Zapytanie wysłane"}
              </div>
              <div className="mt-2 text-xs text-white/45">
                {activeOrder.delivery.savedToServer
                  ? locale === "en"
                    ? "Saved on server"
                    : "Zapisane na serwerze"
                  : locale === "en"
                    ? "Server save failed"
                    : "Błąd zapisu na serwerze"}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 grid gap-8 xl:grid-cols-[1fr_0.9fr]">
          <div className="rounded-sm border border-white/5 bg-card p-6 sm:p-8">
            <div className="section-label mb-3">{locale === "en" ? "What happens next" : "Co dalej"}</div>
            <div className="grid gap-4">
              {[
                {
                  icon: ShoppingBag,
                  title:
                    locale === "en"
                      ? "1. Your selection and contact details reached us"
                      : "1. Twój wybór i dane kontaktowe do nas dotarły",
                },
                {
                  icon: FileText,
                  title: briefDone
                    ? locale === "en"
                      ? "2. The project brief is attached to your inquiry"
                      : "2. Brief projektowy został dołączony do zapytania"
                    : locale === "en"
                      ? "2. You skipped the brief - you can still add details when we reply"
                      : "2. Brief pominięty - szczegóły możesz dosłać w odpowiedzi na maila",
                },
                {
                  icon: CheckCircle2,
                  title:
                    locale === "en"
                      ? "3. We review the scope and prepare your quote"
                      : "3. Weryfikujemy zakres i przygotowujemy wycenę",
                },
                {
                  icon: Mail,
                  title:
                    activeOrder.delivery.customerEmail === "sent"
                      ? locale === "en"
                        ? "4. A confirmation has been sent to your inbox"
                        : "4. Potwierdzenie trafiło na Twojego maila"
                      : locale === "en"
                        ? "4. The quote lands in your inbox - usually within 24h"
                        : "4. Wycena przyjdzie na Twojego maila - zwykle do 24h",
                },
              ].map((step) => (
                <div key={step.title} className="rounded-sm border border-white/8 bg-background px-4 py-4">
                  <div className="inline-flex items-start gap-3 text-sm text-white/75">
                    <step.icon size={16} className="mt-0.5 shrink-0 text-gold" />
                    <span>{step.title}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <aside className="rounded-sm border border-gold/20 bg-card p-6 sm:p-8">
            <div className="section-label mb-3">{locale === "en" ? "Summary" : "Podsumowanie"}</div>
            <div className="grid gap-4 border-b border-white/5 pb-6">
              {activeOrder.items.map((item) => {
                const addonsTotal = item.addons.reduce((sum, addon) => sum + addon.price, 0);
                return (
                  <div key={item.id} className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="font-bold text-white">{item.serviceName}</div>
                      <div className="text-sm text-white/55">{item.packageName}</div>
                    </div>
                    <div className="font-bold text-gold">{item.price + addonsTotal} zł</div>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 flex items-end justify-between gap-4">
              <span className="text-sm text-white/55">
                {locale === "en" ? "Price-list total" : "Suma wg cennika"}
              </span>
              <span className="font-display text-4xl font-black text-gold">{activeOrder.subtotal} zł</span>
            </div>

            <div className="mt-6 grid gap-3 text-sm text-white/60">
              <div>{locale === "en" ? `Client: ${activeOrder.customer.name}` : `Klient: ${activeOrder.customer.name}`}</div>
              <div>{locale === "en" ? `Email: ${activeOrder.customer.email}` : `Email: ${activeOrder.customer.email}`}</div>
              {activeOrder.customer.company ? (
                <div>{locale === "en" ? `Company: ${activeOrder.customer.company}` : `Firma: ${activeOrder.customer.company}`}</div>
              ) : null}
            </div>

            <div className="mt-8 flex flex-col gap-3">
              {!briefDone ? (
                <Link
                  href={getStaticPath("brief")}
                  className="gold-button-shimmer inline-flex items-center justify-center rounded-sm px-6 py-4 text-sm font-black uppercase tracking-wider text-background"
                >
                  {locale === "en" ? "Add project brief" : "Uzupełnij brief projektu"}
                </Link>
              ) : null}
              <Link
                href={getStaticPath("home")}
                className={
                  briefDone
                    ? "gold-button-shimmer inline-flex items-center justify-center rounded-sm px-6 py-4 text-sm font-black uppercase tracking-wider text-background"
                    : "inline-flex items-center justify-center rounded-sm border border-gold/30 px-6 py-4 text-sm font-black uppercase tracking-wider text-gold"
                }
              >
                {locale === "en" ? "Back to homepage" : "Wróć na stronę główną"}
              </Link>
              <Link
                href={getStaticPath("order")}
                className="inline-flex items-center justify-center rounded-sm border border-white/10 px-6 py-4 text-sm font-black uppercase tracking-wider text-white/60"
              >
                {locale === "en" ? "Browse more services" : "Przeglądaj więcej usług"}
              </Link>
            </div>
          </aside>
        </div>
      </section>
    </SiteLayout>
  );
}
