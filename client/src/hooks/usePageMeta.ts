import { useEffect } from "react";
import { switchLocalePath } from "@/lib/localeRoutes";

type PageMetaOptions = {
  locale: "pl" | "en";
  path: string;
  robots?: "index, follow" | "noindex, follow";
};

const SITE_URL = "https://dativedesign.com";

function upsertAlternate(hreflang: string, href: string) {
  let link = document.querySelector<HTMLLinkElement>(`link[rel="alternate"][hreflang="${hreflang}"]`);

  if (!link) {
    link = document.createElement("link");
    link.setAttribute("rel", "alternate");
    link.setAttribute("hreflang", hreflang);
    document.head.appendChild(link);
  }

  link.setAttribute("href", href);
}

export function usePageMeta(title: string, description: string, options: PageMetaOptions) {
  useEffect(() => {
    const locale = options.locale ?? "pl";
    const robotsContent = options.robots ?? "index, follow";

    document.title = title;
    document.documentElement.lang = locale;

    const descriptionTag = document.querySelector('meta[name="description"]');
    if (descriptionTag) {
      descriptionTag.setAttribute("content", description);
    }

    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) {
      ogTitle.setAttribute("content", title);
    }

    const ogDescription = document.querySelector('meta[property="og:description"]');
    if (ogDescription) {
      ogDescription.setAttribute("content", description);
    }

    const twitterTitle = document.querySelector('meta[name="twitter:title"]');
    if (twitterTitle) {
      twitterTitle.setAttribute("content", title);
    }

    const twitterDescription = document.querySelector('meta[name="twitter:description"]');
    if (twitterDescription) {
      twitterDescription.setAttribute("content", description);
    }

    const canonical = document.querySelector('link[rel="canonical"]');
    if (canonical && options.path) {
      canonical.setAttribute("href", `${SITE_URL}${options.path}`);
    }

    let robots = document.querySelector<HTMLMetaElement>('meta[name="robots"]');
    if (!robots) {
      robots = document.createElement("meta");
      robots.setAttribute("name", "robots");
      document.head.appendChild(robots);
    }
    robots.setAttribute("content", robotsContent);

    const ogLocale = document.querySelector('meta[property="og:locale"]');
    if (ogLocale) {
      ogLocale.setAttribute("content", locale === "en" ? "en_US" : "pl_PL");
    }

    if (options.path) {
      const plPath = locale === "pl" ? options.path : switchLocalePath(options.path, "pl");
      const enPath = locale === "en" ? options.path : switchLocalePath(options.path, "en");

      upsertAlternate("pl", `${SITE_URL}${plPath}`);
      upsertAlternate("en", `${SITE_URL}${enPath}`);
      upsertAlternate("x-default", `${SITE_URL}${plPath}`);
    }
  }, [description, options.locale, options.path, options.robots, title]);
}
