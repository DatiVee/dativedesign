import { createContext, useContext, useMemo, type ReactNode } from "react";
import { useLocation } from "wouter";
import {
  getBlogPostPath,
  getPortfolioDetailPath,
  getServicePath,
  getStaticPath,
  switchLocalePath,
  type Locale,
  type StaticRouteKey,
} from "@/lib/localeRoutes";

type LocaleContextValue = {
  locale: Locale;
  alternateLocale: Locale;
  switchPath: string;
  getStaticPath: (key: StaticRouteKey) => string;
  getServicePath: (slug: string) => string;
  getPortfolioDetailPath: (slug: string) => string;
  getBlogPostPath: (slug: string) => string;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const locale: Locale = location === "/en" || location.startsWith("/en/") ? "en" : "pl";
  const alternateLocale: Locale = locale === "pl" ? "en" : "pl";

  const value = useMemo<LocaleContextValue>(
    () => ({
      locale,
      alternateLocale,
      switchPath: switchLocalePath(location, alternateLocale),
      getStaticPath: (key) => getStaticPath(locale, key),
      getServicePath: (slug) => getServicePath(locale, slug),
      getPortfolioDetailPath: (slug) => getPortfolioDetailPath(locale, slug),
      getBlogPostPath: (slug) => getBlogPostPath(locale, slug),
    }),
    [locale, alternateLocale, location],
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error("useLocale must be used within LocaleProvider");
  }

  return context;
}
