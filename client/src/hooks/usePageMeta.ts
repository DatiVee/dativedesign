import { useEffect } from "react";

type PageMetaOptions = {
  locale: "pl" | "en";
  path: string;
};

export function usePageMeta(title: string, description: string, options: PageMetaOptions) {
  useEffect(() => {
    const locale = options.locale ?? "pl";

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
      canonical.setAttribute("href", `https://dativedesign.com${options.path}`);
    }

    const ogLocale = document.querySelector('meta[property="og:locale"]');
    if (ogLocale) {
      ogLocale.setAttribute("content", locale === "en" ? "en_US" : "pl_PL");
    }
  }, [description, options.locale, options.path, title]);
}
