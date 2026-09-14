import type { FaqItem } from "@/data/siteContent";

/**
 * Tryb wizytówki (SHOP_ENABLED = false): pytania FAQ, które dotyczą płatności,
 * koszyka, checkoutu, zapytania o wycenę lub zakupu w sklepie, nie mają sensu
 * bez sklepu – ten sam filtr stosuje strona FAQ i sekcja FAQ na stronie głównej.
 */
const SHOP_ONLY_FAQ_CATEGORIES = new Set(["platnosci", "payments"]);
const SHOP_ONLY_FAQ_IDS = new Set(["brief-start", "brief"]);
const SHOP_ONLY_FAQ_PATTERN = /koszyk|checkout|wycen|zakup|\bcart\b|\bquote\b|\bbuy(ing)?\b/i;

export function isShopOnlyFaq(item: FaqItem) {
  return (
    SHOP_ONLY_FAQ_CATEGORIES.has(item.category) ||
    SHOP_ONLY_FAQ_IDS.has(item.id) ||
    SHOP_ONLY_FAQ_PATTERN.test(`${item.question} ${item.answer}`)
  );
}
