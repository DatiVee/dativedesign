import { useEffect, useState, type RefObject } from "react";

/* Wspólne narzędzia interakcji konceptu 2026 (trasa /koncept). */

export const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

/** Wygładzanie niezależne od liczby klatek: `rate` = udział drogi pokonany w 1/60 s. */
export const damp = (current: number, target: number, rate: number, dtSeconds: number) =>
  current + (target - current) * (1 - Math.pow(1 - rate, dtSeconds * 60));

function readMedia(query: string) {
  try {
    return window.matchMedia(query).matches;
  } catch {
    return false;
  }
}

function useMedia(query: string) {
  const [matches, setMatches] = useState(() => (typeof window === "undefined" ? false : readMedia(query)));

  useEffect(() => {
    const media = window.matchMedia(query);
    const update = () => setMatches(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, [query]);

  return matches;
}

export const prefersReducedMotion = () => readMedia("(prefers-reduced-motion: reduce)");
export const useReducedMotion = () => useMedia("(prefers-reduced-motion: reduce)");
/** Mysz lub rysik: kursor, magnesy, przechylanie kart. Na dotyku wyłączone. */
export const useFinePointer = () => useMedia("(hover: hover) and (pointer: fine)");
export const useDesktop = () => useMedia("(min-width: 1024px)");

/** Czy element jest blisko okna – do pauzowania pętli animacji poza ekranem. */
export function useInView(ref: RefObject<Element | null>, rootMargin = "120px") {
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { rootMargin });
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref, rootMargin]);

  return inView;
}

export const supportsViewTransitions = () =>
  typeof document !== "undefined" && typeof document.startViewTransition === "function" && !prefersReducedMotion();

/**
 * Odpytuje warunek co ~16 ms (setTimeout, nie rAF – w trakcie View Transition
 * przeglądarka wstrzymuje renderowanie, więc rAF by nie ruszył).
 */
export function waitFor<T>(read: () => T | null | undefined, timeoutMs = 1200): Promise<T | null> {
  return new Promise((resolve) => {
    const started = performance.now();
    const tick = () => {
      const value = read();
      if (value) return resolve(value);
      if (performance.now() - started > timeoutMs) return resolve(null);
      window.setTimeout(tick, 16);
    };
    tick();
  });
}

export const isMacLike = () => typeof navigator !== "undefined" && /Mac|iPhone|iPad|iPod/.test(navigator.userAgent);

/** Przewinięcie do sekcji z uwzględnieniem ograniczenia ruchu. */
export function scrollToSection(id: string) {
  const target = document.getElementById(id);
  if (!target) return;
  target.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth", block: "start" });
}
