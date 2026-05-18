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
      <SiteHeader />
      <main>{children}</main>
      <div className="fixed inset-x-3 bottom-3 z-50 lg:hidden">
        <div className="grid grid-cols-2 gap-3 rounded-2xl border border-white/10 bg-card/95 p-3 shadow-2xl backdrop-blur-xl">
          <Link
            href={getStaticPath("cart")}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 px-4 py-3 text-sm font-black uppercase tracking-wide text-white"
          >
            <ShoppingBag size={16} />
            {locale === "en" ? "Cart" : "Koszyk"} {count > 0 ? `(${count})` : ""}
          </Link>
          <Link
            href={getStaticPath("order")}
            className="gold-button-shimmer inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-black uppercase tracking-wide text-background"
          >
            <Sparkles size={16} />
            {locale === "en" ? "Order" : "Zamów"}
          </Link>
        </div>
      </div>
      <SiteFooter />
    </div>
  );
}
