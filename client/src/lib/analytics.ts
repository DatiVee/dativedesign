/*
 * Zdarzenia strony i konwersje Google Ads (tag Google ładowany w index.html).
 *   generate_lead  – wysłany formularz kontaktowy (konwersja główna)
 *   phone_click    – kliknięcie w link tel: (konwersja pomocnicza)
 *   email_click    – kliknięcie w link mailto: (konwersja pomocnicza)
 *   cta_click      – kliknięcie "Zapytaj o wycenę" na stronie usługi
 *   consent_update – decyzja w banerze cookies
 * Każde zdarzenie trafia też do window.dataLayer (podgląd w konsoli, testy).
 * Tag Google respektuje tryb zgody (Consent Mode v2, domyślnie "denied", patrz index.html):
 * bez zgody konwersje idą w trybie ograniczonym, bez zapisywania plików cookies.
 */

/** Tag Google konta Google Ads DatiVe Design – ten sam identyfikator jest w client/index.html. */
export const GOOGLE_ADS_ID = "AW-18466116864";

/** Etykiety działań powodujących konwersję (Google Ads → Cele → Konwersje → działanie → Konfiguracja tagu). */
const ADS_CONVERSION_LABELS: Partial<Record<string, string>> = {
  generate_lead: "HonRCJbjmoAdEICqquVE",
  phone_click: "PnhDCJnjmoAdEICqquVE",
  email_click: "HAYdCJzjmoAdEICqquVE",
};

type TrackingWindow = Window & { dataLayer?: unknown[]; gtag?: (...args: unknown[]) => void };

export function track(event: string, params: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return;
  const w = window as TrackingWindow;
  w.dataLayer = w.dataLayer || [];
  w.dataLayer.push({ event, page_path: window.location.pathname, ...params });

  const label = ADS_CONVERSION_LABELS[event];
  if (label && typeof w.gtag === "function") {
    w.gtag("event", "conversion", { send_to: `${GOOGLE_ADS_ID}/${label}` });
  }
}

let linkTrackingInstalled = false;

/** Kliknięcia w linki tel: i mailto: w całej aplikacji (jedna delegacja zdarzeń na dokumencie). */
export function installLinkTracking() {
  if (linkTrackingInstalled || typeof document === "undefined") return;
  linkTrackingInstalled = true;
  document.addEventListener(
    "click",
    (event) => {
      const link =
        event.target instanceof Element
          ? event.target.closest<HTMLAnchorElement>('a[href^="tel:"], a[href^="mailto:"]')
          : null;
      if (!link) return;
      const href = link.getAttribute("href") ?? "";
      track(href.startsWith("tel:") ? "phone_click" : "email_click", { link_url: href });
    },
    { capture: true },
  );
}
