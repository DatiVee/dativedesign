import { ArrowRight } from "lucide-react";
import { Link, useRoute } from "wouter";
import { Reveal } from "@/components/site/Reveal";
import { SectionHeading } from "@/components/site/SectionHeading";
import { SiteLayout } from "@/components/site/SiteLayout";
import { useLocale } from "@/contexts/LocaleContext";
import { getBlogPostBySlugLocalized, getBlogPosts } from "@/data/localizedSiteContent";
import { usePageMeta } from "@/hooks/usePageMeta";

export default function BlogPostPage() {
  const { locale, getBlogPostPath, getStaticPath } = useLocale();
  const [, plParams] = useRoute("/blog/:slug");
  const [, enParams] = useRoute("/en/blog/:slug");
  const slug = plParams?.slug || enParams?.slug;
  const post = slug ? getBlogPostBySlugLocalized(locale, slug) : undefined;
  const blogPosts = getBlogPosts(locale);
  const formatter = new Intl.DateTimeFormat(locale === "en" ? "en-US" : "pl-PL", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  usePageMeta(
    post
      ? `${post.title} | Blog DatiVe Design`
      : locale === "en"
        ? "Blog post | DatiVe Design"
        : "Wpis blogowy | DatiVe Design",
    post?.excerpt ||
      (locale === "en"
        ? "A DatiVe Design article about branding, design and visual identity."
        : "Artykuł DatiVe Design o brandingu, projektowaniu i identyfikacji wizualnej."),
    { locale, path: slug ? `${getStaticPath("blog")}/${slug}` : getStaticPath("blog") }
  );

  if (!post) {
    return (
      <SiteLayout>
        <section className="container py-24">
          <SectionHeading
            eyebrow="Blog"
            title={locale === "en" ? "Article not found" : "Nie znaleziono wpisu"}
            description={
              locale === "en"
                ? "Check the full list of articles and choose the post you want to read."
                : "Sprawdź pełną listę artykułów i wybierz wpis, który chcesz przeczytać."
            }
          />
          <div className="mt-8">
            <Link href={getStaticPath("blog")} className="text-sm font-bold uppercase tracking-wider text-gold">
              {locale === "en" ? "Back to blog" : "Wróć do bloga"}
            </Link>
          </div>
        </section>
      </SiteLayout>
    );
  }

  const relatedPosts = blogPosts.filter((item) => item.slug !== post.slug).slice(0, 2);

  return (
    <SiteLayout>
      <section className="container py-20 sm:py-24">
        <div className="max-w-5xl">
          <div className="section-label mb-4">{post.category}</div>
          <h1 className="font-display text-4xl font-black text-white sm:text-5xl lg:text-6xl">{post.title}</h1>
          <div className="mt-5 flex flex-wrap gap-4 text-xs uppercase tracking-wide text-white/35">
            <span>{post.author}</span>
            <span>{formatter.format(new Date(post.publishedAt))}</span>
            <span>{post.readTime}</span>
          </div>
          <p className="mt-6 max-w-3xl text-base leading-relaxed text-white/68 sm:text-lg">{post.excerpt}</p>
        </div>

        <div className="mt-10 overflow-hidden rounded-sm border border-gold/15 bg-card">
          <div className="aspect-[16/9] overflow-hidden">
            <img src={post.image} alt={post.title} className="h-full w-full object-cover" />
          </div>
        </div>
      </section>

      <section className="container py-10">
        <div className="grid gap-10 lg:grid-cols-[1fr_0.34fr]">
          <div className="max-w-4xl space-y-5">
            {post.content.map((paragraph, index) => (
              <div
                key={`${post.slug}-${index}`}
                className={`rounded-sm border border-white/5 p-6 text-sm leading-relaxed sm:text-base ${
                  index === 0 ? "bg-card text-white/76" : "bg-card text-white/70"
                }`}
              >
                {paragraph}
              </div>
            ))}
          </div>

          <aside className="space-y-5">
            <div className="rounded-sm border border-white/5 bg-card p-6">
              <div className="section-label mb-3">{locale === "en" ? "Article details" : "Szczegóły wpisu"}</div>
              <div className="space-y-3 text-sm text-white/62">
                <div>
                  <span className="font-bold text-white">{locale === "en" ? "Author:" : "Autor:"}</span> {post.author}
                </div>
                <div>
                  <span className="font-bold text-white">{locale === "en" ? "Date:" : "Data:"}</span> {formatter.format(new Date(post.publishedAt))}
                </div>
                <div>
                  <span className="font-bold text-white">{locale === "en" ? "Reading time:" : "Czas czytania:"}</span> {post.readTime}
                </div>
              </div>
            </div>

            <div className="rounded-sm border border-gold/15 bg-gradient-to-br from-gold/10 via-card to-card p-6">
              <div className="section-label mb-3">{locale === "en" ? "Shop" : "Sklep"}</div>
              <h2 className="font-display text-2xl font-black text-white">
                {locale === "en" ? "Need a similar result for your brand" : "Chcesz podobny efekt dla swojej marki"}
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-white/65">
                {locale === "en"
                  ? "You can move straight from the article to the service packages and choose the right scope online."
                  : "Możesz przejść prosto z artykułu do pakietów usług i wybrać odpowiedni zakres online."}
              </p>
              <Link href={getStaticPath("order")} className="gold-button-shimmer mt-6 inline-flex items-center justify-center gap-2 rounded-sm px-6 py-4 text-sm font-black uppercase tracking-wider text-background">
                {locale === "en" ? "Go to shop" : "Przejdź do sklepu"}
                <ArrowRight size={16} />
              </Link>
            </div>
          </aside>
        </div>
      </section>

      <section className="container py-16">
        <div className="rounded-sm border border-gold/20 bg-gradient-to-r from-gold/12 via-card to-card p-8 sm:p-10">
          <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <div className="section-label mb-3">{locale === "en" ? "Start" : "Zacznij"}</div>
              <h2 className="font-display text-3xl font-black text-white sm:text-4xl">
                {locale === "en" ? "Ready for a project for your brand?" : "Gotowy na projekt dla swojej marki?"}
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/65">
                {locale === "en"
                  ? "Check the service packages and order a project online without a long email chain."
                  : "Sprawdź pakiety usług i zamów projekt online bez rozwleczonej wymiany wiadomości."}
              </p>
            </div>
            <Link href={getStaticPath("order")} className="gold-button-shimmer inline-flex items-center justify-center gap-2 rounded-sm px-7 py-4 text-sm font-black uppercase tracking-wider text-background">
              {locale === "en" ? "Order project" : "Zamów projekt"}
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      <section className="container py-16">
        <Reveal>
          <SectionHeading
            eyebrow={locale === "en" ? "Read next" : "Czytaj dalej"}
            title={locale === "en" ? "Related posts" : "Powiązane wpisy"}
            description={
              locale === "en"
                ? "More topics that help you understand branding, design and how to get the most out of your visuals."
                : "Kolejne tematy, które pomagają zrozumieć branding, projektowanie i jak wycisnąć więcej z grafiki."
            }
          />
        </Reveal>
        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          {relatedPosts.map((item, index) => (
            <Reveal key={item.slug} delay={(index % 2) * 90}>
            <Link href={getBlogPostPath(item.slug)} className="block overflow-hidden rounded-sm border border-white/5 bg-card gold-border-hover">
              <div className="aspect-[16/10] overflow-hidden">
                <img src={item.image} alt={item.title} loading="lazy" className="h-full w-full object-cover" />
              </div>
              <div className="p-6">
                <div className="section-label mb-2">{item.category}</div>
                <h3 className="font-display text-2xl font-black text-white">{item.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-white/60">{item.excerpt}</p>
              </div>
            </Link>
            </Reveal>
          ))}
        </div>
      </section>
    </SiteLayout>
  );
}
