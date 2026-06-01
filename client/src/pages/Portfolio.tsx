import { useMemo, useState } from "react";
import { Link } from "wouter";
import { Reveal } from "@/components/site/Reveal";
import { SectionHeading } from "@/components/site/SectionHeading";
import { SiteLayout } from "@/components/site/SiteLayout";
import { useLocale } from "@/contexts/LocaleContext";
import { getProjects } from "@/data/localizedSiteContent";
import { usePageMeta } from "@/hooks/usePageMeta";

export default function Portfolio() {
  const { locale, getPortfolioDetailPath, getStaticPath } = useLocale();
  const projects = getProjects(locale);
  const categories = [
    locale === "en" ? "All" : "Wszystkie",
    ...Array.from(new Set(projects.map((project) => project.category))),
  ];
  const [activeCategory, setActiveCategory] = useState(categories[0]);

  const filteredProjects = useMemo(() => {
    if (activeCategory === categories[0]) return projects;
    return projects.filter((project) => project.category === activeCategory);
  }, [activeCategory, categories, projects]);

  usePageMeta(
    "Portfolio | DatiVe Design",
    locale === "en"
      ? "DatiVe Design portfolio split into categories: logo, branding, business cards, social media, flyers, banners and packaging with mini case studies."
      : "Portfolio DatiVe Design podzielone kategoriami: logo, branding, wizytówki, social media, ulotki, bannery, opakowania i projekty z mini case study.",
    { locale, path: getStaticPath("portfolio") }
  );

  return (
    <SiteLayout>
      <section className="container py-20 sm:py-24">
        <Reveal>
          <SectionHeading
            eyebrow="Portfolio"
            title={locale === "en" ? "Case studies, not just a gallery" : "Case studies, nie tylko galeria"}
            description={
              locale === "en"
                ? "Each project sits inside a category and includes its own goal, result, application and visual direction."
                : "Każdy projekt jest przypięty do kategorii i ma własny opis celu, efektu, zastosowania i kierunku wizualnego."
            }
          />
        </Reveal>

        <div className="mt-8 flex flex-wrap gap-3">
          {categories.map((category) => {
            const active = category === activeCategory;
            return (
              <button
                key={category}
                type="button"
                onClick={() => setActiveCategory(category)}
                className={`rounded-full border px-4 py-2 text-xs font-bold uppercase tracking-wide transition-colors ${
                  active
                    ? "border-gold bg-gold/10 text-gold"
                    : "border-white/10 text-white/55 hover:border-gold/30 hover:text-gold"
                }`}
              >
                {category}
              </button>
            );
          })}
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filteredProjects.map((project, index) => (
            <Reveal key={project.slug} delay={(index % 3) * 70}>
            <Link
              href={getPortfolioDetailPath(project.slug)}
              className="group block overflow-hidden rounded-sm border border-white/5 bg-card gold-border-hover"
            >
              <div className="relative aspect-square overflow-hidden">
                <img
                  src={project.image}
                  alt={project.title}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="portfolio-sheen absolute inset-0" />
              </div>
              <div className="p-6">
                <div className="section-label mb-2">{project.category}</div>
                <h2 className="font-display text-xl font-black text-white">{project.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-white/60">{project.summary}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {project.tags.map((tag) => (
                    <span key={tag} className="rounded-full bg-white/5 px-3 py-1 text-xs text-white/45">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </Link>
            </Reveal>
          ))}
        </div>
      </section>
    </SiteLayout>
  );
}
