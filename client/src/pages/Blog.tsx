import { Link } from "wouter";
import { SectionHeading } from "@/components/site/SectionHeading";
import { SiteLayout } from "@/components/site/SiteLayout";
import { useLocale } from "@/contexts/LocaleContext";
import { getBlogPosts } from "@/data/localizedSiteContent";
import { usePageMeta } from "@/hooks/usePageMeta";

export default function Blog() {
  const { locale, getBlogPostPath, getStaticPath } = useLocale();
  const blogPosts = getBlogPosts(locale);
  const [featuredPost, ...otherPosts] = blogPosts;
  const formatter = new Intl.DateTimeFormat(locale === "en" ? "en-US" : "pl-PL", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  usePageMeta(
    "Blog | DatiVe Design",
    locale === "en"
      ? "DatiVe Design blog supports SEO and online service sales with content about logo design, branding, visual identity, business cards and project preparation."
      : "Blog DatiVe Design wspiera SEO i sprzedaż usług graficznych. Artykuły o logo, brandingu, identyfikacji wizualnej, wizytówkach i przygotowaniu firmy do projektów.",
    { locale, path: getStaticPath("blog") }
  );

  return (
    <SiteLayout>
      <section className="container py-20 sm:py-24">
        <SectionHeading
          eyebrow="Blog"
          title={
            locale === "en"
              ? "Articles that support SEO and real buying intent"
              : "Artykuły, które wspierają SEO i realną decyzję zakupową"
          }
          description={
            locale === "en"
              ? "The blog should answer actual client questions, build trust and help service pages rank with stronger supporting content."
              : "Blog ma odpowiadać na realne pytania klientów, budować zaufanie i wzmacniać pozycjonowanie podstron usługowych sensownym contentem."
          }
        />

        {featuredPost ? (
          <div className="mt-10 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
            <Link href={getBlogPostPath(featuredPost.slug)} className="group overflow-hidden rounded-sm border border-gold/15 bg-card">
              <div className="grid h-full gap-0 lg:grid-cols-[1fr_0.9fr]">
                <div className="relative min-h-80 overflow-hidden">
                  <img
                    src={featuredPost.image}
                    alt={featuredPost.title}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-background/85 via-background/32 to-transparent" />
                  <div className="absolute left-8 top-8 max-w-md">
                    <div className="section-label mb-3">
                      {locale === "en" ? "Featured article" : "Wyróżniony artykuł"}
                    </div>
                    <h2 className="font-display text-4xl font-black text-white sm:text-5xl">
                      {featuredPost.title}
                    </h2>
                  </div>
                </div>
                <div className="p-8">
                  <div className="section-label mb-3">{featuredPost.category}</div>
                  <p className="text-sm leading-relaxed text-white/65 sm:text-base">
                    {featuredPost.excerpt}
                  </p>
                  <div className="mt-6 flex flex-wrap gap-3 text-xs uppercase tracking-wide text-white/35">
                    <span>{featuredPost.author}</span>
                    <span>{formatter.format(new Date(featuredPost.publishedAt))}</span>
                    <span>{featuredPost.readTime}</span>
                  </div>
                  <div className="mt-8 rounded-sm border border-white/5 bg-background/50 p-5 text-sm leading-relaxed text-white/62">
                    {locale === "en"
                      ? "A strong blog post should explain the topic clearly, show real design thinking and naturally support service pages."
                      : "Dobry wpis blogowy powinien jasno tłumaczyć temat, pokazywać realne podejście projektowe i naturalnie wzmacniać podstrony usługowe."}
                  </div>
                </div>
              </div>
            </Link>

            <div className="grid gap-6">
              {otherPosts.map((post) => (
                <Link key={post.slug} href={getBlogPostPath(post.slug)} className="overflow-hidden rounded-sm border border-white/5 bg-card">
                  <div className="grid h-full gap-0 sm:grid-cols-[0.42fr_0.58fr]">
                    <div className="aspect-[4/3] overflow-hidden sm:aspect-auto">
                      <img src={post.image} alt={post.title} loading="lazy" className="h-full w-full object-cover" />
                    </div>
                    <div className="p-6">
                      <div className="section-label mb-2">{post.category}</div>
                      <h2 className="font-display text-2xl font-black text-white">{post.title}</h2>
                      <p className="mt-3 text-sm leading-relaxed text-white/60">{post.excerpt}</p>
                      <div className="mt-5 flex items-center justify-between text-xs uppercase tracking-wide text-white/35">
                        <span>{post.readTime}</span>
                        <span>{formatter.format(new Date(post.publishedAt))}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ) : null}
      </section>
    </SiteLayout>
  );
}
