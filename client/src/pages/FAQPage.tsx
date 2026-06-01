import { useMemo } from "react";
import { Reveal } from "@/components/site/Reveal";
import { SectionHeading } from "@/components/site/SectionHeading";
import { SiteLayout } from "@/components/site/SiteLayout";
import { useLocale } from "@/contexts/LocaleContext";
import { getFaqs } from "@/data/localizedSiteContent";
import { usePageMeta } from "@/hooks/usePageMeta";

export default function FAQPage() {
  const { locale, getStaticPath } = useLocale();
  const faqs = getFaqs(locale);
  const categoryLabels =
    locale === "en"
      ? {
          delivery: "Delivery & timeline",
          files: "Files & handoff",
          legal: "Rights & formalities",
          payments: "Payments & checkout",
          process: "Process & brief",
        }
      : {
          realizacja: "Realizacja i terminy",
          pliki: "Pliki i przekazanie projektu",
          formalnosci: "Prawa i formalności",
          platnosci: "Płatności i checkout",
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
    locale === "en"
      ? "Frequently asked questions about working with DatiVe Design: delivery time, revisions, payments, rights, files and the post-purchase process."
      : "Najczęstsze pytania o współpracę z DatiVe Design: czas realizacji, poprawki, płatności, prawa autorskie, pliki końcowe i proces po zakupie.",
    { locale, path: getStaticPath("faq") }
  );

  return (
    <SiteLayout>
      <section className="container py-20 sm:py-24">
        <Reveal>
          <SectionHeading
            eyebrow="FAQ"
            title={locale === "en" ? "Questions before ordering a service" : "Pytania przed zamówieniem usługi"}
            description={
              locale === "en"
                ? "Clear answers about the process, revisions, files, timelines and payments - everything before you decide."
                : "Jasne odpowiedzi o procesie, poprawkach, plikach, terminach i płatnościach - wszystko, zanim zdecydujesz."
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
