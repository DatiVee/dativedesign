import { useEffect, useRef, useState, type CSSProperties } from "react";

/*
 * Intro przy pierwszym wejściu w sesji: znak DatiVe wjeżdża literami, licznik 000 → 100,
 * potem kurtyna odsłania stronę od dołu do góry (clip-path), a nagłówek hero rusza w tej samej chwili.
 * - czeka na fonty (maks. 1,8 s), twardy limit 2,6 s – nigdy nie blokuje strony
 * - scroll, klawisz, klik lub dotyk = natychmiastowe pominięcie
 * - rodzic nie renderuje go przy ograniczeniu ruchu i przy kolejnych wejściach w sesji
 */

type Props = {
  brand: string;
  accent: string;
  tagline: string;
  onReveal: () => void;
};

const COUNT_DURATION = 1150;

export function IntroCurtain({ brand, accent, tagline, onReveal }: Props) {
  const [phase, setPhase] = useState<"in" | "out" | "gone">("in");
  const countRef = useRef<HTMLSpanElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const revealedRef = useRef(false);

  useEffect(() => {
    const startedAt = performance.now();
    let raf = 0;
    const timers: number[] = [];

    const paint = (progress: number) => {
      if (countRef.current) countRef.current.textContent = String(Math.round(progress * 100)).padStart(3, "0");
      barRef.current?.style.setProperty("--p", progress.toFixed(3));
    };

    const tick = (now: number) => {
      const linear = Math.min(1, (now - startedAt) / COUNT_DURATION);
      paint(1 - Math.pow(1 - linear, 3));
      if (linear < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    const reveal = () => {
      if (revealedRef.current) return;
      revealedRef.current = true;
      cancelAnimationFrame(raf);
      paint(1);
      setPhase("out");
      onReveal();
      timers.push(window.setTimeout(() => setPhase("gone"), 1000));
    };

    const wait = (ms: number) => new Promise<void>((resolve) => timers.push(window.setTimeout(resolve, ms)));
    const fontsReady = document.fonts?.ready ?? Promise.resolve();
    void Promise.all([wait(COUNT_DURATION + 150), Promise.race([fontsReady, wait(1800)])]).then(reveal);
    timers.push(window.setTimeout(reveal, 2600));

    const skipEvents = ["wheel", "touchstart", "keydown", "pointerdown"] as const;
    skipEvents.forEach((type) => window.addEventListener(type, reveal, { passive: true }));

    return () => {
      cancelAnimationFrame(raf);
      timers.forEach((timer) => window.clearTimeout(timer));
      skipEvents.forEach((type) => window.removeEventListener(type, reveal));
    };
  }, [onReveal]);

  if (phase === "gone") return null;

  return (
    <div className="c-intro" data-phase={phase} aria-hidden="true">
      <div className="c-intro__center">
        <div className="c-intro__brand">
          {Array.from(brand).map((char, index) => (
            <span key={index} className="c-intro__ch" style={{ "--i": index } as CSSProperties}>
              {char}
            </span>
          ))}
          <span className="c-intro__ch c-intro__accent" style={{ "--i": brand.length + 1 } as CSSProperties}>
            {accent}
          </span>
        </div>
        <div className="c-intro__tag">{tagline}</div>
      </div>
      <div className="c-intro__foot">
        <span className="c-intro__year">©2026</span>
        <span ref={countRef} className="c-intro__count">
          000
        </span>
      </div>
      <div ref={barRef} className="c-intro__bar" />
    </div>
  );
}
