import { ArrowRight, Home } from "lucide-react";
import { Link } from "wouter";
import { SectionHeading } from "@/components/site/SectionHeading";
import { SiteLayout } from "@/components/site/SiteLayout";
import { useLocale } from "@/contexts/LocaleContext";
import { usePageMeta } from "@/hooks/usePageMeta";

export default function NotFound() {
  const { locale, getStaticPath } = useLocale();

  usePageMeta(
    locale === "en" ? "404 - Page not found | DatiVe Design" : "404 - Nie znaleziono strony | DatiVe Design",
    locale === "en"
      ? "The page you are looking for does not exist or has been moved."
      : "Strona, której szukasz, nie istnieje lub została przeniesiona.",
    { locale, path: getStaticPath("home"), robots: "noindex, follow" },
  );

  return (
    <SiteLayout>
      <section className="relative overflow-hidden">
        <div className="ambient-orb ambient-orb-gold left-[10%] top-10 h-44 w-44" />
        <div className="ambient-orb ambient-orb-soft bottom-0 right-[12%] h-52 w-52" />
        <div className="container relative py-28 sm:py-36">
          <div className="font-display text-7xl font-black leading-none text-gold sm:text-9xl">404</div>
          <div className="mt-6 max-w-2xl">
            <SectionHeading
              eyebrow={locale === "en" ? "Page not found" : "Nie znaleziono strony"}
              title={locale === "en" ? "This page doesn't exist" : "Tej strony nie ma"}
              description={
                locale === "en"
                  ? "The link may be outdated or the page has been moved. Let's get you back on track."
                  : "Link mógł się zdezaktualizować albo strona została przeniesiona. Wróćmy na właściwe tory."
              }
            />
          </div>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link
              href={getStaticPath("home")}
              className="gold-button-shimmer inline-flex items-center justify-center gap-2 rounded-sm px-7 py-4 text-sm font-black uppercase tracking-wider text-background"
            >
              <Home size={18} />
              {locale === "en" ? "Back to homepage" : "Wróć na stronę główną"}
            </Link>
            <Link
              href={getStaticPath("portfolio")}
              className="inline-flex items-center justify-center gap-2 rounded-sm border border-gold/30 px-7 py-4 text-sm font-black uppercase tracking-wider text-gold transition-colors hover:bg-gold/10"
            >
              {locale === "en" ? "See portfolio" : "Zobacz portfolio"}
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
