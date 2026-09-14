import { useMemo } from "react";
import { Reveal } from "@/components/site/Reveal";
import { SectionHeading } from "@/components/site/SectionHeading";
import { SiteLayout } from "@/components/site/SiteLayout";
import { useLocale } from "@/contexts/LocaleContext";
import { getFaqs } from "@/data/localizedSiteContent";
import { usePageMeta } from "@/hooks/usePageMeta";
import { isShopOnlyFaq } from "@/lib/faqVisibility";
import { SHOP_ENABLED } from "@/siteConfig";

export default function FAQPage() {
  const { locale, getStaticPath } = useLocale();
  const allFaqs = getFaqs(locale);
  const faqs = useMemo(
    () => (SHOP_ENABLED ? allFaqs : allFaqs.filter((item) => !isShopOnlyFaq(item))),
    [allFaqs]
  );
  const categoryLabels =
    locale === "en"
      ? {
          delivery: "Delivery & timeline",
          files: "Files & handoff",
          legal: "Rights & formalities",
          payments: "Payments & billing",
          process: "Process & brief",
        }
      : {
          realizacja: "Realizacja i terminy",
          pliki: "Pliki i przekazanie projektu",
          formalnosci: "Prawa i formalności",
          platnosci: "Płatności i rozliczenia",
          proces: "Proces i brief",
        };

  const groupedFaqs = useMemo(() => {
    return faqs.reduce<Record<string, typeof faqs>>((acc, item) => {
      if (!acc[item.category]) acc[item.category] = [];
      acc[item.category].push(item);
      return acc;
    }, {});
  }, [faqs]);

  usePageMeta(
    "FAQ | DatiVe Design",
    SHOP_ENABLED
      ? locale === "en"
        ? "Frequently asked questions about working with DatiVe Design: delivery time, revisions, payments, rights, files and the post-purchase process."
        : "Najczęstsze pytania o współpracę z DatiVe Design: czas realizacji, poprawki, płatności, prawa autorskie, pliki końcowe i proces po zakupie."
      : locale === "en"
        ? "Frequently asked questions about working with DatiVe Design: delivery time, revisions, rights, final files and how the collaboration works."
        : "Najczęstsze pytania o współpracę z DatiVe Design: czas realizacji, poprawki, prawa autorskie, pliki końcowe i przebieg współpracy.",
    { locale, path: getStaticPath("faq") }
  );

  return (
    <SiteLayout>
      <section className="container py-20 sm:py-24">
        <Reveal>
          <SectionHeading
            as="h1"
            eyebrow="FAQ"
            title={
              SHOP_ENABLED
                ? (locale === "en" ? "Questions before ordering a service" : "Pytania przed zamówieniem usługi")
                : (locale === "en" ? "Frequently asked questions" : "Najczęstsze pytania")
            }
            description={
              SHOP_ENABLED
                ? (locale === "en"
                  ? "Clear answers about the process, revisions, files, timelines and payments – everything before you decide."
                  : "Jasne odpowiedzi o procesie, poprawkach, plikach, terminach i płatnościach – wszystko, zanim zdecydujesz.")
                : (locale === "en"
                  ? "Clear answers about the process, revisions, files, timelines and rights – everything you need before we start."
                  : "Jasne odpowiedzi o procesie, poprawkach, plikach, terminach i prawach – wszystko, zanim zaczniemy współpracę.")
            }
          />
        </Reveal>

        <div className="mt-10 grid gap-8">
          {Object.entries(groupedFaqs).map(([category, items], index) => (
            <Reveal key={category} delay={(index % 3) * 70} as="section" className="rounded-sm border border-white/5 bg-card p-6 sm:p-8">
              <div className="section-label mb-4">
                {categoryLabels[category as keyof typeof categoryLabels] ?? category}
              </div>
              <div className="grid gap-5">
                {items.map((faq) => (
                  <article key={faq.id} className="rounded-sm border border-white/5 bg-background p-5">
                    <h2 className="font-display text-xl font-black text-white">{faq.question}</h2>
                    <p className="mt-3 text-sm leading-relaxed text-white/65">{faq.answer}</p>
                  </article>
                ))}
              </div>
            </Reveal>
          ))}
        </div>
      </section>
    </SiteLayout>
  );
}
