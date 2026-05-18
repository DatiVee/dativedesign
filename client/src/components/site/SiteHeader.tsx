import { Menu, ShoppingBag, Sparkles, X } from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useCart } from "@/contexts/CartContext";
import { useLocale } from "@/contexts/LocaleContext";
import { services } from "@/data/siteContent";
import type { StaticRouteKey } from "@/lib/localeRoutes";

export function SiteHeader() {
  const [location] = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const { count } = useCart();
  const { locale, alternateLocale, switchPath, getStaticPath } = useLocale();

  const navItems: { key: StaticRouteKey; label: string }[] =
    locale === "en"
      ? [
          { key: "home", label: "Home" },
          { key: "about", label: "About" },
          { key: "services", label: "Services" },
          { key: "portfolio", label: "Portfolio" },
          { key: "reviews", label: "Reviews" },
          { key: "faq", label: "FAQ" },
          { key: "blog", label: "Blog" },
          { key: "order", label: "Order" },
        ]
      : [
          { key: "home", label: "Start" },
          { key: "about", label: "O nas" },
          { key: "services", label: "Usługi" },
          { key: "portfolio", label: "Portfolio" },
          { key: "reviews", label: "Opinie" },
          { key: "faq", label: "FAQ" },
          { key: "blog", label: "Blog" },
          { key: "order", label: "Zamów projekt" },
        ];

  const isActive = (key: StaticRouteKey) => {
    const href = getStaticPath(key);
    if (key === "home") return location === href;
    if (key === "services") {
      return (
        location === href ||
        location.startsWith(`${href}/`) ||
        services.some((service) =>
          locale === "pl" ? location === `/${service.slug}` : location === `/en/services/${service.slug}`,
        )
      );
    }
    return location === href || location.startsWith(`${href}/`);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-background/85 backdrop-blur-xl">
      <div className="container flex h-16 items-center justify-between gap-3 py-2 lg:h-18 lg:gap-4 lg:py-3">
        <Link href={getStaticPath("home")} className="flex min-w-0 items-center gap-3">
          <img src="/logo.png" alt="DatiVe Design" className="h-9 w-auto sm:h-10 lg:h-12" />
        </Link>

        <nav className="hidden items-center gap-6 lg:flex">
          {navItems.map((item) => (
            <Link
              key={item.key}
              href={getStaticPath(item.key)}
              className={`font-display text-sm font-bold uppercase tracking-wide transition-colors ${
                item.key === "order"
                  ? isActive(item.key)
                    ? "rounded-full border border-gold bg-gold/14 px-4 py-2 text-gold"
                    : "rounded-full border border-gold/25 px-4 py-2 text-gold hover:border-gold hover:bg-gold/10"
                  : isActive(item.key)
                    ? "text-gold"
                    : "text-white/65 hover:text-gold"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <Link
            href={switchPath}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-2 text-xs font-black uppercase tracking-wide text-white/70 transition-colors hover:border-gold/30 hover:text-gold"
          >
            {locale.toUpperCase()}
            <span className="text-white/30">/</span>
            {alternateLocale.toUpperCase()}
          </Link>
          <Link
            href={getStaticPath("cart")}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm text-white/70 transition-colors hover:border-gold/30 hover:text-gold"
          >
            <ShoppingBag size={16} />
            {locale === "en" ? "Cart" : "Koszyk"}
            {count > 0 ? (
              <span className="rounded-full bg-gold px-2 py-0.5 text-xs font-bold text-background">
                {count}
              </span>
            ) : null}
          </Link>
          <Link
            href={getStaticPath("order")}
            className="gold-button-shimmer inline-flex items-center gap-2 rounded-sm px-5 py-3 text-sm font-black uppercase tracking-wider text-background"
          >
            <Sparkles size={15} />
            {locale === "en" ? "Shop" : "Sklep"}
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setMenuOpen((current) => !current)}
          className="inline-flex items-center justify-center rounded-sm border border-white/10 p-2.5 text-white lg:hidden"
          aria-label={
            menuOpen
              ? locale === "en"
                ? "Close menu"
                : "Zamknij menu"
              : locale === "en"
                ? "Open menu"
                : "Otwórz menu"
          }
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {menuOpen ? (
        <div className="border-t border-white/5 bg-card lg:hidden">
          <div className="container flex flex-col gap-3 py-4">
            {navItems.map((item) => (
              <Link
                key={item.key}
                href={getStaticPath(item.key)}
                onClick={() => setMenuOpen(false)}
                className={`font-display text-sm font-bold uppercase tracking-wide ${
                  item.key === "order"
                    ? "rounded-full border border-gold/25 px-4 py-2.5 text-gold"
                    : isActive(item.key)
                      ? "text-gold"
                      : "text-white/75"
                }`}
              >
                {item.label}
              </Link>
            ))}
            <div className="mt-2 flex items-center justify-between gap-3">
              <Link
                href={getStaticPath("cart")}
                onClick={() => setMenuOpen(false)}
                className="inline-flex items-center gap-2 text-sm text-white/75"
              >
                <ShoppingBag size={16} />
                {locale === "en" ? `Cart (${count})` : `Koszyk (${count})`}
              </Link>
              <Link
                href={switchPath}
                onClick={() => setMenuOpen(false)}
                className="text-xs font-black uppercase tracking-wide text-gold"
              >
                {locale.toUpperCase()} / {alternateLocale.toUpperCase()}
              </Link>
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}
