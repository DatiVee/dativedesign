/**
 * Tryb działania strony.
 *
 * SHOP_ENABLED = false  -> wizytówka: portfolio, o nas, opinie, blog, kontakt.
 *                          Sklep, koszyk, konfigurator, zapytania o wycenę są ukryte,
 *                          a ich trasy przekierowują na stronę główną.
 * SHOP_ENABLED = true   -> pełna wersja ze sklepem i ścieżką zapytania o wycenę.
 *
 * Zmiana tej jednej stałej przełącza cały serwis (nawigacja, trasy, CTA, sekcje).
 */
export const SHOP_ENABLED = false;
