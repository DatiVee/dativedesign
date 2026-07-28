import type { ReactNode } from "react";
import { ShoppingBag, Sparkles } from "lucide-react";
import { Link } from "wouter";
import { useCart } from "@/contexts/CartContext";
import { useLocale } from "@/contexts/LocaleContext";
import { SiteFooter } from "./SiteFooter";
import { SiteHeader } from "./SiteHeader";

export function SiteLayout({ children }: { children: ReactNode }) {
  const { count } = useCart();
  const { locale, getStaticPath } = useLocale();

  return (
    <div className="min-h-screen overflow-x-hidden bg-background text-foreground">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-sm focus:bg-gold focus:px-4 focus:py-2 focus:text-sm focus:font-bold focus:text-background"
      >
        {locale === "en" ? "Skip to content" : "Przejdź do treści"}
      </a>
      <SiteHeader />
      <main id="main">{children}</main>
      <div className="fixed inset-x-2 bottom-2 z-50 lg:hidden">
        <div className="grid grid-cols-2 gap-2 rounded-xl border border-white/10 bg-card/95 p-2 shadow-2xl backdrop-blur-xl">
          <Link
            href={getStaticPath("cart")}
            className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-white/10 px-3 py-2.5 text-[11px] font-black uppercase tracking-wide text-white"
          >
            <ShoppingBag size={14} />
            {locale === "en" ? "Cart" : "Koszyk"} {count > 0 ? `(${count})` : ""}
          </Link>
          <Link
            href={getStaticPath("order")}
            className="gold-button-shimmer inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-2.5 text-[11px] font-black uppercase tracking-wide text-background"
          >
            <Sparkles size={14} />
            {locale === "en" ? "Order" : "Zamów"}
          </Link>
        </div>
      </div>
      <SiteFooter />
    </div>
  );
}
