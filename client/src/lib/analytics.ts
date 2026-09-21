/*
 * Zdarzenia dla Google Tag Manager (window.dataLayer, kontener GTM-NNVKR9BK).
 * Nazwy uzgodnione z kampanią Google Ads (docs/marketing/google-ads-kampania-1.md):
 *   generate_lead  – wysłany formularz kontaktowy (konwersja główna)
 *   phone_click    – kliknięcie w link tel:
 *   email_click    – kliknięcie w link mailto:
 *   cta_click      – kliknięcie "Zapytaj o wycenę" na stronie usługi
 *   consent_update – decyzja w banerze cookies
 * Samo wrzucenie zdarzenia do dataLayer nie zapisuje cookies – tagi Google w GTM
 * respektują tryb zgody (Consent Mode v2, domyślnie "denied", patrz index.html).
 */

type DataLayerWindow = Window & { dataLayer?: unknown[] };

export function track(event: string, params: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return;
  const w = window as DataLayerWindow;
  w.dataLayer = w.dataLayer || [];
  w.dataLayer.push({ event, page_path: window.location.pathname, ...params });
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
