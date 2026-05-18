import { ArrowRight } from "lucide-react";
import { Link, useRoute } from "wouter";
import { SectionHeading } from "@/components/site/SectionHeading";
import { SiteLayout } from "@/components/site/SiteLayout";
import { useLocale } from "@/contexts/LocaleContext";
import {
  getProjectBySlugLocalized,
  getProjects,
  getServices,
} from "@/data/localizedSiteContent";
import { usePageMeta } from "@/hooks/usePageMeta";

export default function PortfolioDetail() {
  const { locale, getPortfolioDetailPath, getServicePath, getStaticPath } = useLocale();
  const [, plParams] = useRoute("/portfolio/:slug");
  const [, enParams] = useRoute("/en/portfolio/:slug");
  const slug = plParams?.slug || enParams?.slug;
  const project = slug ? getProjectBySlugLocalized(locale, slug) : undefined;
  const projects = getProjects(locale);
  const services = getServices(locale);

  usePageMeta(
    project
      ? `${project.title} | Portfolio DatiVe Design`
      : locale === "en"
        ? "Project | DatiVe Design"
        : "Projekt | DatiVe Design",
    project?.summary ||
      (locale === "en"
        ? "DatiVe Design case study with project background, goal, final effect and real-world application."
        : "Szczegóły realizacji DatiVe Design: opis projektu, cel, efekt końcowy i zastosowanie."),
    { locale, path: slug ? `${getStaticPath("portfolio")}/${slug}` : getStaticPath("portfolio") }
  );

  if (!project) {
    return (
      <SiteLayout>
        <section className="container py-24">
          <SectionHeading
            eyebrow="Portfolio"
            title={locale === "en" ? "Project not found" : "Nie znaleziono projektu"}
            description={
              locale === "en"
                ? "Check the full portfolio and choose the case study you want to review."
                : "Sprawdź pełne portfolio i wybierz case study, które chcesz przejrzeć."
            }
          />
          <div className="mt-8">
            <Link href={getStaticPath("portfolio")} className="text-sm font-bold uppercase tracking-wider text-gold">
              {locale === "en" ? "Back to portfolio" : "Wróć do portfolio"}
            </Link>
          </div>
        </section>
      </SiteLayout>
    );
  }

  const similarProjects = projects
    .filter((item) => item.slug !== project.slug && item.category === project.category)
    .slice(0, 3);
  const suggestedServices = services.filter((service) => service.portfolioSlugs.includes(project.slug));
  const projectMeta =
    locale === "en"
      ? [
          ["Client", project.client],
          ["Category", project.category],
          ["Use case", project.application],
        ]
      : [
          ["Klient", project.client],
          ["Kategoria", project.category],
          ["Zastosowanie", project.application],
        ];

  return (
    <SiteLayout>
      <section className="container py-20 sm:py-24">
        <div className="grid gap-12 lg:grid-cols-[1fr_0.9fr]">
          <div>
            <div className="section-label mb-4">{project.category}</div>
            <h1 className="font-display text-4xl font-black text-white sm:text-5xl lg:text-6xl">
              {project.title}
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/68 sm:text-lg">
              {project.summary}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              {project.tags.map((tag) => (
                <span key={tag} className="rounded-full border border-white/10 bg-card px-4 py-2 text-xs text-white/50">
                  {tag}
                </span>
              ))}
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              {projectMeta.map(([label, value]) => (
                <div key={label} className="rounded-sm border border-white/5 bg-card p-5">
                  <div className="section-label mb-2">{label}</div>
                  <div className="text-sm leading-relaxed text-white/72">{value}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="overflow-hidden rounded-sm border border-gold/15 bg-card">
            <img src={project.image} alt={project.title} className="h-full w-full object-cover" />
          </div>
        </div>
      </section>

      <section className="container py-16">
        <div className="mb-10 max-w-3xl">
          <SectionHeading
            eyebrow="Case study"
            title={
              locale === "en"
                ? "A portfolio page should explain more than the visual"
                : "Podstrona portfolio powinna tłumaczyć coś więcej niż sam wygląd"
            }
            description={
              locale === "en"
                ? "The goal is not to stop at one image. A strong case study gives context, business intent and a real outcome."
                : "Chodzi o coś więcej niż jeden ładny mockup. Dobre case study pokazuje kontekst, cel biznesowy i realny efekt projektu."
            }
          />
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          {[
            [locale === "en" ? "Project goal" : "Cel projektu", project.goal],
            [locale === "en" ? "Final result" : "Efekt końcowy", project.outcome],
            [locale === "en" ? "Application" : "Zastosowanie", project.application],
          ].map(([title, text]) => (
            <article key={title} className="rounded-sm border border-white/5 bg-card p-8">
              <h2 className="font-display text-2xl font-black text-white">{title}</h2>
              <p className="mt-4 text-sm leading-relaxed text-white/65">{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="container py-16">
        <SectionHeading
          eyebrow={locale === "en" ? "Related services" : "Powiązane usługi"}
          title={locale === "en" ? "Services connected to this type of project" : "Usługi powiązane z tym typem realizacji"}
          description={
            locale === "en"
              ? "A portfolio page should naturally lead the user back to the offer."
              : "Dobra podstrona portfolio powinna naturalnie prowadzić użytkownika z powrotem do oferty."
          }
        />
        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          {suggestedServices.map((service) => (
            <Link key={service.slug} href={getServicePath(service.slug)} className="overflow-hidden rounded-sm border border-white/5 bg-card">
              <div className="aspect-[16/10] overflow-hidden border-b border-white/5">
                <img src={service.coverImage ?? "/blog-cover.svg"} alt={service.name} loading="lazy" className="h-full w-full object-cover" />
              </div>
              <div className="p-6">
                <div className="section-label mb-3">{service.category}</div>
                <h3 className="font-display text-2xl font-black text-white">{service.name}</h3>
                <p className="mt-3 text-sm leading-relaxed text-white/65">{service.shortDescription}</p>
                <div className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-gold">
                  {locale === "en" ? "See service" : "Zobacz usługę"}
                  <ArrowRight size={16} />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {similarProjects.length > 0 ? (
        <section className="container py-16">
          <SectionHeading
            eyebrow={locale === "en" ? "More from this category" : "Więcej z tej kategorii"}
            title={locale === "en" ? "Similar projects" : "Podobne realizacje"}
            description={
              locale === "en"
                ? "Additional examples from the same category or service direction."
                : "Dalsze przykłady projektów dla tego samego typu usługi lub branży."
            }
          />
          <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {similarProjects.map((item) => (
              <Link key={item.slug} href={getPortfolioDetailPath(item.slug)} className="group overflow-hidden rounded-sm border border-white/5 bg-card">
                <div className="aspect-square overflow-hidden">
                  <img src={item.image} alt={item.title} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                </div>
                <div className="p-6">
                  <div className="section-label mb-2">{item.category}</div>
                  <h3 className="font-display text-xl font-black text-white">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-white/60">{item.summary}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      ) : null}
    </SiteLayout>
  );
}
