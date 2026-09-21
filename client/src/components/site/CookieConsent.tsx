import { useEffect, useState } from "react";
import { Cookie } from "lucide-react";
import { Link } from "wouter";
import { useLocale } from "@/contexts/LocaleContext";
import { track } from "@/lib/analytics";

/*
 * Baner zgody na cookies + aktualizacja trybu zgody Google (Consent Mode v2).
 * Domyślne "denied" ustawia skrypt w index.html jeszcze przed tagiem Google (Google Ads).
 * "Odrzucam" jest tak samo widoczne jak "Akceptuję" (wymóg RODO / wytyczne UODO).
 * Ponowne otwarcie: window.dispatchEvent(new Event("dative:open-consent")) – link w stopce.
 */

const STORAGE_KEY = "dative-consent";
type Choice = "granted" | "denied";

function readChoice(): Choice | null {
  try {
    const value = window.localStorage.getItem(STORAGE_KEY);
    return value === "granted" || value === "denied" ? value : null;
  } catch {
    return null;
  }
}

function applyConsent(choice: Choice) {
  const w = window as Window & { dataLayer?: unknown[]; gtag?: (...args: unknown[]) => void };
  w.dataLayer = w.dataLayer || [];
  const gtag =
    w.gtag ??
    function gtagShim(..._args: unknown[]) {
      // tryb zgody wymaga obiektu `arguments`, a nie tablicy
      // eslint-disable-next-line prefer-rest-params
      w.dataLayer?.push(arguments);
    };
  gtag("consent", "update", {
    ad_storage: choice,
    ad_user_data: choice,
    ad_personalization: choice,
    analytics_storage: choice,
  });
}

export function CookieConsent() {
  const { locale, getStaticPath } = useLocale();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(readChoice() === null);
    const reopen = () => setOpen(true);
    window.addEventListener("dative:open-consent", reopen);
    return () => window.removeEventListener("dative:open-consent", reopen);
  }, []);

  const decide = (choice: Choice) => {
    try {
      window.localStorage.setItem(STORAGE_KEY, choice);
    } catch {
      /* zablokowane dane witryny – decyzja obowiązuje do końca wizyty */
    }
    applyConsent(choice);
    track("consent_update", { consent: choice });
    setOpen(false);
  };

  if (!open) return null;

  const t =
    locale === "en"
      ? {
          title: "Cookies",
          text: "This site uses Google Ads to measure how well its ads work. Google cookies are stored only after you accept – the site works the same either way.",
          accept: "Accept",
          reject: "Reject",
          policy: "Privacy policy",
        }
      : {
          title: "Pliki cookies",
          text: "Strona korzysta z Google Ads do mierzenia skuteczności reklam. Pliki cookies Google zapisują się dopiero po Twojej zgodzie – strona działa tak samo w obu przypadkach.",
          accept: "Akceptuję",
          reject: "Odrzucam",
          policy: "Polityka prywatności",
        };

  return (
    <div
      role="dialog"
      aria-labelledby="cookie-consent-title"
      aria-describedby="cookie-consent-text"
      className="fixed inset-x-3 bottom-3 z-[110] rounded-sm border border-gold/25 bg-card/95 p-5 shadow-2xl backdrop-blur-xl sm:inset-x-auto sm:bottom-6 sm:left-6 sm:max-w-md sm:p-6"
      style={{ paddingBottom: "max(1.25rem, env(safe-area-inset-bottom))" }}
    >
      <div id="cookie-consent-title" className="flex items-center gap-2.5 text-sm font-bold text-white">
        <Cookie size={17} className="text-gold" aria-hidden="true" />
        {t.title}
      </div>
      <p id="cookie-consent-text" className="mt-2.5 text-[13px] leading-relaxed text-white/65">
        {t.text}{" "}
        <Link href={getStaticPath("privacy")} className="text-gold underline-offset-4 hover:underline">
          {t.policy}
        </Link>
      </p>
      <div className="mt-4 grid grid-cols-2 gap-2.5">
        <button
          type="button"
          onClick={() => decide("denied")}
          className="inline-flex h-11 items-center justify-center rounded-sm border border-white/15 text-xs font-black uppercase tracking-wider text-white transition-colors hover:border-gold/50 hover:text-gold"
        >
          {t.reject}
        </button>
        <button
          type="button"
          onClick={() => decide("granted")}
          className="gold-button-shimmer inline-flex h-11 items-center justify-center rounded-sm text-xs font-black uppercase tracking-wider text-background"
        >
          {t.accept}
        </button>
      </div>
    </div>
  );
}
