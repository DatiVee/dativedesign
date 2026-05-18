import { ArrowRight, Star } from "lucide-react";
import { Link } from "wouter";
import { SectionHeading } from "@/components/site/SectionHeading";
import { SiteLayout } from "@/components/site/SiteLayout";
import { useLocale } from "@/contexts/LocaleContext";
import { getTestimonials } from "@/data/localizedSiteContent";
import { usePageMeta } from "@/hooks/usePageMeta";

export default function ReviewsPage() {
  const { locale, getStaticPath } = useLocale();
  const reviews = getTestimonials(locale);

  usePageMeta(
    locale === "en" ? "Client reviews | DatiVe Design" : "Opinie klientów | DatiVe Design",
    locale === "en" ? "Read client feedback after working with DatiVe Design on branding, logo design, print, social media and promotional graphics."
      : "Poznaj opinie klientów DatiVe Design po współpracy przy brandingu, logo, druku, social media i materiałach reklamowych.",
    { locale, path: getStaticPath("reviews") }
  );

  const trustBadges =
    locale === "en" ? ["100% recommendation rate", "5/5 rating", "Refined projects", "Direct contact"]
      : ["100% rekomendacji", "5/5 ocena", "Dopracowane projekty", "Kontakt bez pośredników"];

  const reviewHighlights =
    locale === "en" ? [
          "Clients most often mention process clarity, fast feedback and visuals that actually match the brand.",
          "The review section is here to build trust, not to simulate a CMS with a fake form.",
          "If needed later, this page can be connected to real reviews from Google, Facebook or a custom CMS.",
        ]
      : [
          "Klienci najczęściej chwalą klarowny proces, szybki kontakt i projekty, które realnie pasują do marki.",
          "Ta podstrona ma budować zaufanie, a nie udawać panel opinii z losowym formularzem.",
          "Jeśli będzie trzeba, później można ją spiąć z prawdziwymi opiniami z Google, Facebooka albo CMS-a.",
        ];

  return (
    <SiteLayout>
      <section className="container py-20 sm:py-24">
        <SectionHeading
          eyebrow={locale === "en" ? "Reviews" : "Opinie"}
          title={locale === "en" ? "Proof that the process works" : "Dowód, że ten proces działa"}
          description={
            locale === "en" ? "This page should show real post-project confidence: ratings, recommendations and feedback after collaboration."
              : "Ta podstrona ma pokazywać realne zaufanie po współpracy: oceny, rekomendacje i konkretne komentarze po projekcie."
          }
        />

        <div className="mt-8 flex flex-wrap gap-3">
          {trustBadges.map((item) => (
            <span
              key={item}
              className="rounded-full border border-gold/20 bg-gold/8 px-4 py-2 text-xs font-bold uppercase tracking-wide text-gold"
            >
              {item}
            </span>
          ))}
        </div>

        <div className="mt-10 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="grid gap-6 lg:grid-cols-2">
            {reviews.map((review) => (
              <article key={review.id} className="rounded-sm border border-white/5 bg-card p-6">
                <div className="mb-4 flex gap-1">
                  {Array.from({ length: review.rating }).map((_, index) => (
                    <Star key={`${review.id}-${index}`} size={16} className="fill-gold text-gold" />
                  ))}
                </div>
                <p className="text-lg italic leading-relaxed text-white/72">"{review.quote}"</p>
                <div className="mt-5 text-sm text-white/50">
                  <span className="font-bold text-white">{review.name}</span> · {review.company} · {review.service}
                </div>
              </article>
            ))}
          </div>

          <aside className="rounded-sm border border-gold/15 bg-gradient-to-br from-gold/10 via-card to-card p-6 sm:p-8">
            <div className="section-label mb-3">{locale === "en" ? "Trust" : "Zaufanie"}</div>
            <h2 className="font-display text-3xl font-black text-white">
              {locale === "en" ? "What clients usually value most" : "Co klienci doceniają najbardziej"}
            </h2>
            <div className="mt-6 grid gap-4">
              {reviewHighlights.map((item) => (
                <div
                  key={item}
                  className="rounded-sm border border-white/5 bg-background/50 p-5 text-sm leading-relaxed text-white/68"
                >
                  {item}
                </div>
              ))}
            </div>

            <div className="mt-8">
              <Link
                href={getStaticPath("order")}
                className="gold-button-shimmer inline-flex items-center gap-2 rounded-sm px-6 py-4 text-sm font-black uppercase tracking-wider text-background"
              >
                {locale === "en" ? "Order project" : "Zamów projekt"}
                <ArrowRight size={16} />
              </Link>
            </div>
          </aside>
        </div>
      </section>
    </SiteLayout>
  );
}
