import { useMemo, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Link, useLocation } from "wouter";
import { SectionHeading } from "@/components/site/SectionHeading";
import { SiteLayout } from "@/components/site/SiteLayout";
import { getBriefPrompt } from "@/data/orderBriefConfig";
import { useLocale } from "@/contexts/LocaleContext";
import { type OrderBriefAnswer, useOrderFlow } from "@/contexts/OrderFlowContext";
import { usePageMeta } from "@/hooks/usePageMeta";

export default function OrderBriefPage() {
  const { locale, getStaticPath } = useLocale();
  const { activeOrder, submitBrief, isSubmitting } = useOrderFlow();
  const [, navigate] = useLocation();

  const initialAnswers = useMemo<OrderBriefAnswer[]>(
    () =>
      activeOrder?.items.map((item) => ({
        itemId: item.id,
        brandName: item.brandName || activeOrder.customer.company || "",
        projectGoal: "",
        audience: "",
        visualDirection: "",
        references: "",
        contentScope: item.scopeDetails || "",
        deadline: "",
        additionalNotes: item.notes || "",
      })) ?? [],
    [activeOrder]
  );

  const [answers, setAnswers] = useState<OrderBriefAnswer[]>(initialAnswers);

  usePageMeta(
    locale === "en" ? "Project Brief | DatiVe Design" : "Brief projektowy | DatiVe Design",
    locale === "en"
      ? "Post-purchase project brief for DatiVe Design orders. The client fills in brand, scope, references and execution details."
      : "Brief projektowy po zakupie usługi DatiVe Design. Klient uzupełnia markę, zakres, inspiracje i detale realizacji.",
    { locale, path: getStaticPath("brief") }
  );

  if (!activeOrder) {
    return (
      <SiteLayout>
        <section className="container py-24">
          <SectionHeading
            eyebrow="Brief"
            title={locale === "en" ? "There is no active order to complete" : "Nie ma aktywnego zamówienia do uzupełnienia"}
            description={
              locale === "en"
                ? "The brief appears only after the checkout creates an order record."
                : "Brief pojawia się dopiero wtedy, kiedy checkout utworzy rekord zamówienia."
            }
          />
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href={getStaticPath("cart")}
              className="gold-button-shimmer inline-flex items-center justify-center rounded-sm px-7 py-4 text-sm font-black uppercase tracking-wider text-background"
            >
              {locale === "en" ? "Go to cart" : "Przejdź do koszyka"}
            </Link>
            <Link
              href={getStaticPath("order")}
              className="inline-flex items-center justify-center rounded-sm border border-gold/30 px-7 py-4 text-sm font-black uppercase tracking-wider text-gold"
            >
              {locale === "en" ? "Go to shop" : "Przejdź do sklepu"}
            </Link>
          </div>
        </section>
      </SiteLayout>
    );
  }

  const updateAnswer = (itemId: string, key: keyof OrderBriefAnswer, value: string) => {
    setAnswers((current) =>
      current.map((answer) =>
        answer.itemId === itemId
          ? {
              ...answer,
              [key]: value,
            }
          : answer
      )
    );
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const hasMissing = answers.some(
      (answer) =>
        !answer.brandName ||
        !answer.projectGoal ||
        !answer.audience ||
        !answer.visualDirection ||
        !answer.contentScope
    );

    if (hasMissing) {
      toast.error(
        locale === "en"
          ? "Fill in the key project inputs for each ordered item."
          : "Uzupełnij kluczowe informacje projektowe dla każdej zamówionej pozycji."
      );
      return;
    }

    try {
      await submitBrief(answers);
      toast.success(locale === "en" ? "Brief saved." : "Brief zapisany.");
      navigate(getStaticPath("thankYou"));
    } catch {
      toast.error(
        locale === "en"
          ? "The brief could not be saved on the server."
          : "Nie udało się zapisać briefu po stronie serwera."
      );
    }
  };

  return (
    <SiteLayout>
      <section className="container py-20 sm:py-24">
        <SectionHeading
          eyebrow={locale === "en" ? "Post-purchase brief" : "Brief po zakupie"}
          title={locale === "en" ? "Now the client gives the real production input" : "Tu klient daje realny input do realizacji"}
          description={
            locale === "en"
              ? "The checkout collects buyer data. This stage collects the actual creative and production context needed before work starts."
              : "Checkout zbiera dane kupującego. Ten etap zbiera właściwy kontekst kreatywny i produkcyjny potrzebny przed startem pracy."
          }
        />

        <div className="mt-10 rounded-sm border border-gold/20 bg-card p-6 sm:p-8">
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <div className="text-xs font-bold uppercase tracking-[0.2em] text-white/35">
                {locale === "en" ? "Order number" : "Numer zamówienia"}
              </div>
              <div className="mt-3 font-display text-2xl font-black text-gold">{activeOrder.number}</div>
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-[0.2em] text-white/35">
                {locale === "en" ? "Client" : "Klient"}
              </div>
              <div className="mt-3 text-sm font-semibold text-white">{activeOrder.customer.name}</div>
              <div className="text-sm text-white/55">{activeOrder.customer.email}</div>
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-[0.2em] text-white/35">
                {locale === "en" ? "Current status" : "Aktualny status"}
              </div>
              <div className="mt-3 text-sm font-semibold text-white">
                {locale === "en" ? "Brief pending" : "Brief do uzupełnienia"}
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={submit} className="mt-10 grid gap-8">
          {activeOrder.items.map((item) => {
            const prompt = getBriefPrompt(locale, item.serviceSlug);
            const answer = answers.find((entry) => entry.itemId === item.id);
            if (!answer) return null;

            return (
              <article key={item.id} className="rounded-sm border border-white/5 bg-card p-6 sm:p-8">
                <div className="flex flex-col gap-3 border-b border-white/5 pb-6 lg:flex-row lg:items-end lg:justify-between">
                  <div>
                    <div className="section-label mb-2">{item.serviceName}</div>
                    <h2 className="font-display text-3xl font-black text-white">{item.packageName}</h2>
                    <p className="mt-3 max-w-3xl text-sm leading-relaxed text-white/62">{prompt.description}</p>
                  </div>
                  <div className="rounded-sm border border-gold/20 bg-gold/8 px-4 py-3 text-sm text-white/75">
                    {item.price + item.addons.reduce((sum, addon) => sum + addon.price, 0)} zł
                  </div>
                </div>

                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <input
                    disabled={isSubmitting}
                    value={answer.brandName}
                    onChange={(event) => updateAnswer(item.id, "brandName", event.target.value)}
                    placeholder={locale === "en" ? "Brand / company name" : "Nazwa marki / firmy"}
                    className="h-12 rounded-sm border border-white/10 bg-background px-4 text-sm text-white outline-none disabled:opacity-60"
                  />
                  <input
                    disabled={isSubmitting}
                    value={answer.deadline}
                    onChange={(event) => updateAnswer(item.id, "deadline", event.target.value)}
                    placeholder={prompt.deadlinePlaceholder}
                    className="h-12 rounded-sm border border-white/10 bg-background px-4 text-sm text-white outline-none disabled:opacity-60"
                  />
                </div>

                <div className="mt-4 grid gap-4">
                  <textarea
                    disabled={isSubmitting}
                    value={answer.projectGoal}
                    onChange={(event) => updateAnswer(item.id, "projectGoal", event.target.value)}
                    placeholder={prompt.goalPlaceholder}
                    className="min-h-24 rounded-sm border border-white/10 bg-background px-4 py-3 text-sm text-white outline-none disabled:opacity-60"
                  />
                  <textarea
                    disabled={isSubmitting}
                    value={answer.audience}
                    onChange={(event) => updateAnswer(item.id, "audience", event.target.value)}
                    placeholder={prompt.audiencePlaceholder}
                    className="min-h-24 rounded-sm border border-white/10 bg-background px-4 py-3 text-sm text-white outline-none disabled:opacity-60"
                  />
                  <textarea
                    disabled={isSubmitting}
                    value={answer.visualDirection}
                    onChange={(event) => updateAnswer(item.id, "visualDirection", event.target.value)}
                    placeholder={prompt.visualPlaceholder}
                    className="min-h-24 rounded-sm border border-white/10 bg-background px-4 py-3 text-sm text-white outline-none disabled:opacity-60"
                  />
                  <textarea
                    disabled={isSubmitting}
                    value={answer.references}
                    onChange={(event) => updateAnswer(item.id, "references", event.target.value)}
                    placeholder={prompt.referencesPlaceholder}
                    className="min-h-24 rounded-sm border border-white/10 bg-background px-4 py-3 text-sm text-white outline-none disabled:opacity-60"
                  />
                  <textarea
                    disabled={isSubmitting}
                    value={answer.contentScope}
                    onChange={(event) => updateAnswer(item.id, "contentScope", event.target.value)}
                    placeholder={prompt.contentPlaceholder}
                    className="min-h-24 rounded-sm border border-white/10 bg-background px-4 py-3 text-sm text-white outline-none disabled:opacity-60"
                  />
                  <textarea
                    disabled={isSubmitting}
                    value={answer.additionalNotes}
                    onChange={(event) => updateAnswer(item.id, "additionalNotes", event.target.value)}
                    placeholder={prompt.notesPlaceholder}
                    className="min-h-24 rounded-sm border border-white/10 bg-background px-4 py-3 text-sm text-white outline-none disabled:opacity-60"
                  />
                </div>
              </article>
            );
          })}

          <div className="rounded-sm border border-gold/20 bg-gradient-to-r from-gold/12 via-card to-card p-6 sm:p-8">
            <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
              <div>
                <div className="section-label mb-3">{locale === "en" ? "Final step" : "Ostatni krok"}</div>
                <h2 className="font-display text-3xl font-black text-white">
                  {locale === "en" ? "Save the brief and move to the order confirmation" : "Zapisz brief i przejdź do potwierdzenia zamówienia"}
                </h2>
                <p className="mt-3 max-w-3xl text-sm leading-relaxed text-white/65">
                  {locale === "en"
                    ? "At this stage the order has enough real input to start production properly."
                    : "Na tym etapie zamówienie ma już wystarczająco konkretów, żeby ruszyć z realizacją bez zgadywania."}
                </p>
              </div>
              <button
                disabled={isSubmitting}
                type="submit"
                className="gold-button-shimmer inline-flex items-center justify-center rounded-sm px-7 py-4 text-sm font-black uppercase tracking-wider text-background disabled:opacity-60"
              >
                {isSubmitting
                  ? locale === "en"
                    ? "Saving brief..."
                    : "Zapisywanie briefu..."
                  : locale === "en"
                    ? "Save brief"
                    : "Zapisz brief"}
              </button>
            </div>
          </div>
        </form>
      </section>
    </SiteLayout>
  );
}
