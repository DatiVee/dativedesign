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
      ? "Order confirmation page for DatiVe Design. Summary of the service order, current status and next project steps."
      : "Strona potwierdzenia zamówienia DatiVe Design. Podsumowanie zakupu usługi, aktualny status i kolejne kroki projektu.",
    { locale, path: getStaticPath("thankYou"), robots: "noindex, follow" }
  );

  if (!activeOrder) {
    return (
      <SiteLayout>
        <section className="container py-24">
          <SectionHeading
            eyebrow={locale === "en" ? "Thank you" : "Dziękujemy"}
            title={locale === "en" ? "There is no recent order to display" : "Nie ma świeżego zamówienia do wyświetlenia"}
            description={
              locale === "en"
                ? "The confirmation page appears after checkout and brief completion."
                : "Strona potwierdzenia pojawia się po checkoutcie i uzupełnieniu briefu."
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
            eyebrow={locale === "en" ? "Thank you for your order" : "Dziękujemy za zamówienie"}
            title={locale === "en" ? "Your order has been received" : "Twoje zamówienie zostało przyjęte"}
            description={
              locale === "en"
                ? "Your project brief is already saved. The next step is review, confirmation of the scope and moving the project into production."
                : "Twój brief projektowy został już zapisany. Teraz kolejnym krokiem jest weryfikacja zgłoszenia, potwierdzenie zakresu i przejście do realizacji."
            }
          />
        </Reveal>

        <div className="mt-10 rounded-sm border border-gold/20 bg-gradient-to-r from-gold/12 via-card to-card p-6 sm:p-8">
          <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <div className="section-label mb-3">{locale === "en" ? "Order number" : "Numer zamówienia"}</div>
              <h2 className="font-display text-4xl font-black text-white">{activeOrder.number}</h2>
              <p className="mt-4 max-w-3xl text-sm leading-relaxed text-white/65">
                {locale === "en"
                  ? "The order details and the full brief are already saved on the server. I can now review the request and prepare the next production step."
                  : "Dane zamówienia i pełny brief są już zapisane na serwerze. Teraz mogę przejrzeć zgłoszenie i przygotować kolejny krok realizacji."}
              </p>
            </div>
            <div className="rounded-sm border border-white/10 bg-background px-5 py-4 text-right">
              <div className="text-xs font-bold uppercase tracking-[0.2em] text-white/35">
                {locale === "en" ? "Status" : "Status"}
              </div>
              <div className="mt-3 text-lg font-semibold text-gold">
                {locale === "en" ? "Brief submitted" : "Brief wysłany"}
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
                  title: locale === "en" ? "1. Your order details are saved" : "1. Dane zamówienia zostały zapisane",
                },
                {
                  icon: FileText,
                  title:
                    locale === "en"
                      ? "2. The project brief is attached to the order"
                      : "2. Brief projektowy został przypisany do zamówienia",
                },
                {
                  icon: CheckCircle2,
                  title:
                    locale === "en"
                      ? "3. The project is ready for review and production planning"
                      : "3. Zamówienie jest gotowe do weryfikacji i planowania realizacji",
                },
                {
                  icon: Mail,
                  title:
                    activeOrder.delivery.customerEmail === "sent"
                      ? locale === "en"
                        ? "4. A confirmation has been sent to your inbox"
                        : "4. Potwierdzenie trafiło na Twojego maila"
                      : locale === "en"
                        ? "4. Keep your order number - we'll get back to you by email or phone"
                        : "4. Zachowaj numer zamówienia - odezwiemy się mailowo lub telefonicznie",
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
              <span className="text-sm text-white/55">{locale === "en" ? "Order total" : "Łącznie"}</span>
              <span className="font-display text-4xl font-black text-gold">{activeOrder.subtotal} zł</span>
            </div>

            <div className="mt-6 grid gap-3 text-sm text-white/60">
              <div>{locale === "en" ? `Client: ${activeOrder.customer.name}` : `Klient: ${activeOrder.customer.name}`}</div>
              <div>{locale === "en" ? `Email: ${activeOrder.customer.email}` : `Email: ${activeOrder.customer.email}`}</div>
              <div>{locale === "en" ? `Company: ${activeOrder.customer.company}` : `Firma: ${activeOrder.customer.company}`}</div>
            </div>

            <div className="mt-8 flex flex-col gap-3">
              <Link
                href={getStaticPath("home")}
                className="gold-button-shimmer inline-flex items-center justify-center rounded-sm px-6 py-4 text-sm font-black uppercase tracking-wider text-background"
              >
                {locale === "en" ? "Back to homepage" : "Wróć na stronę główną"}
              </Link>
              <Link
                href={getStaticPath("order")}
                className="inline-flex items-center justify-center rounded-sm border border-gold/30 px-6 py-4 text-sm font-black uppercase tracking-wider text-gold"
              >
                {locale === "en" ? "Order another service" : "Zamów kolejną usługę"}
              </Link>
            </div>
          </aside>
        </div>
      </section>
    </SiteLayout>
  );
}
