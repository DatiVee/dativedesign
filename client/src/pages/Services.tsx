import { Link } from "wouter";
import { SectionHeading } from "@/components/site/SectionHeading";
import { SiteLayout } from "@/components/site/SiteLayout";
import { useLocale } from "@/contexts/LocaleContext";
import { getServices } from "@/data/localizedSiteContent";
import { usePageMeta } from "@/hooks/usePageMeta";

export default function Services() {
  const { locale, getServicePath, getStaticPath } = useLocale();
  const services = getServices(locale);

  usePageMeta(
    locale === "en" ? "Services | DatiVe Design" : "Usługi | DatiVe Design",
    locale === "en" ? "Explore DatiVe Design services: logo design, branding, business cards, flyers, banners and social media packages available for online ordering."
      : "Poznaj usługi DatiVe Design: projekt logo, branding, wizytówki, ulotki, bannery i pakiety social media z możliwością zamówienia online.",
    { locale, path: getStaticPath("services") }
  );

  return (
    <SiteLayout>
      <section className="container py-20 sm:py-24">
        <SectionHeading
          eyebrow={locale === "en" ? "Services" : "Usługi"}
          title={locale === "en" ? "Services ready for ordering and growth" : "Usługi gotowe do zamówienia i dalszej rozbudowy"}
          description={
            locale === "en" ? "Each service has its own URL, scope, packages, supporting portfolio and a direct path to the store."
              : "Każda usługa ma własny URL, opis, pakiety, powiązane portfolio i bezpośrednie przejście do sklepu."
          }
        />
        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          {services.map((service) => (
            <article key={service.slug} className="content-auto-card overflow-hidden rounded-sm border border-white/5 bg-card">
              <div className="grid h-full gap-0 md:grid-cols-[0.9fr_1.1fr]">
                <div className="relative min-h-64 overflow-hidden border-b border-white/5 bg-background md:min-h-full md:border-b-0 md:border-r">
                  <img
                    src={service.coverImage ?? "/blog-cover.svg"}
                    alt={service.name}
                    loading="lazy"
                    decoding="async"
                    sizes="(max-width: 767px) 100vw, 40vw"
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/75 via-background/10 to-transparent" />
                  <div className="absolute bottom-5 left-5">
                    <div className="section-label">{service.category}</div>
                  </div>
                </div>
                <div className="p-7">
                  <h2 className="font-display text-3xl font-black text-white">{service.name}</h2>
                  <p className="mt-2 text-base text-gold">{service.tagline}</p>
                  <p className="mt-4 text-sm leading-relaxed text-white/65">{service.heroDescription}</p>
                  <div className="mt-5 flex flex-wrap gap-2">
                    {service.deliverables.slice(0, 3).map((item) => (
                      <span key={item} className="rounded-full bg-white/5 px-3 py-1 text-xs text-white/45">
                        {item}
                      </span>
                    ))}
                  </div>
                  <div className="mt-6 flex flex-wrap gap-3">
                    <Link href={getServicePath(service.slug)} className="text-sm font-bold uppercase tracking-wider text-gold">
                      {locale === "en" ? "Open service page" : "Zobacz podstronę usługi"}
                    </Link>
                    <Link href={getStaticPath("order")} className="text-sm font-bold uppercase tracking-wider text-white/55">
                      {locale === "en" ? "Go to shop" : "Przejdź do sklepu"}
                    </Link>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </SiteLayout>
  );
}
