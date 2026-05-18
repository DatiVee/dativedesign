import { services } from "@/data/siteContent";

export type Locale = "pl" | "en";
export type StaticRouteKey =
  | "home"
  | "about"
  | "services"
  | "portfolio"
  | "reviews"
  | "faq"
  | "blog"
  | "order"
  | "cart"
  | "checkout"
  | "brief"
  | "thankYou";

const staticRoutes: Record<StaticRouteKey, Record<Locale, string>> = {
  home: { pl: "/", en: "/en" },
  about: { pl: "/o-nas", en: "/en/about" },
  services: { pl: "/uslugi", en: "/en/services" },
  portfolio: { pl: "/portfolio", en: "/en/portfolio" },
  reviews: { pl: "/opinie", en: "/en/reviews" },
  faq: { pl: "/faq", en: "/en/faq" },
  blog: { pl: "/blog", en: "/en/blog" },
  order: { pl: "/zamow-projekt", en: "/en/order" },
  cart: { pl: "/koszyk", en: "/en/cart" },
  checkout: { pl: "/checkout", en: "/en/checkout" },
  brief: { pl: "/brief-zamowienia", en: "/en/order-brief" },
  thankYou: { pl: "/dziekujemy", en: "/en/thank-you" },
};

const serviceSlugs = new Set(services.map((service) => service.slug));

export function getStaticPath(locale: Locale, key: StaticRouteKey) {
  return staticRoutes[key][locale];
}

export function getServicePath(locale: Locale, slug: string) {
  return locale === "en" ? `/en/services/${slug}` : `/${slug}`;
}

export function getPortfolioDetailPath(locale: Locale, slug: string) {
  return `${getStaticPath(locale, "portfolio")}/${slug}`;
}

export function getBlogPostPath(locale: Locale, slug: string) {
  return `${getStaticPath(locale, "blog")}/${slug}`;
}

function matchStaticRoute(pathname: string, locale: Locale) {
  return (Object.keys(staticRoutes) as StaticRouteKey[]).find(
    (key) => staticRoutes[key][locale] === pathname
  );
}

export function switchLocalePath(pathname: string, targetLocale: Locale) {
  const currentLocale: Locale = pathname === "/en" || pathname.startsWith("/en/") ? "en" : "pl";

  if (pathname === "/" || pathname === "/en") {
    return getStaticPath(targetLocale, "home");
  }

  const staticKey = matchStaticRoute(pathname, currentLocale);
  if (staticKey) {
    return getStaticPath(targetLocale, staticKey);
  }

  const currentPortfolioPrefix = getStaticPath(currentLocale, "portfolio");
  if (pathname.startsWith(`${currentPortfolioPrefix}/`)) {
    const slug = pathname.slice(currentPortfolioPrefix.length + 1);
    return getPortfolioDetailPath(targetLocale, slug);
  }

  const currentBlogPrefix = getStaticPath(currentLocale, "blog");
  if (pathname.startsWith(`${currentBlogPrefix}/`)) {
    const slug = pathname.slice(currentBlogPrefix.length + 1);
    return getBlogPostPath(targetLocale, slug);
  }

  if (currentLocale === "pl") {
    if (pathname.startsWith("/uslugi/")) {
      const slug = pathname.slice("/uslugi/".length);
      return getServicePath(targetLocale, slug);
    }

    const normalized = pathname.startsWith("/") ? pathname.slice(1) : pathname;
    if (serviceSlugs.has(normalized)) {
      return getServicePath(targetLocale, normalized);
    }
  } else if (pathname.startsWith("/en/services/")) {
    const slug = pathname.slice("/en/services/".length);
    return getServicePath(targetLocale, slug);
  }

  return getStaticPath(targetLocale, "home");
}
