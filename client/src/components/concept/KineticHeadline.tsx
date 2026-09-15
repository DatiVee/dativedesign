import { Fragment, useEffect, useRef, type CSSProperties } from "react";
import { clamp } from "./fx";

/*
 * Kinetyczny nagłówek hero.
 * 1. Wejście: każda litera wyjeżdża spod maski linii (stagger), bez JS – @starting-style
 *    albo zdjęcie atrybutu data-intro="pending" po kurtynie intro.
 * 2. Typografia reagująca na kursor: litery blisko wskaźnika zmieniają grubość
 *    na zmiennej osi Montserrat (800 → 280), a kursywa Fraunces miękknie (oś SOFT).
 * Czytniki ekranu dostają cały tekst z aria-label – rozbite litery są aria-hidden.
 */

type Line = { text: string; accent?: boolean };

type Props = {
  lines: Line[];
  interactive: boolean;
  className?: string;
};

export function KineticHeadline({ lines, interactive, className = "" }: Props) {
  const headingRef = useRef<HTMLHeadingElement>(null);
  const label = lines.map((line) => line.text).join(" ");

  useEffect(() => {
    const heading = headingRef.current;
    if (!heading || !interactive) return;

    const chars = Array.from(heading.querySelectorAll<HTMLElement>(".c-char"));
    const values = new Float32Array(chars.length);
    let pointerX = -1e5;
    let pointerY = -1e5;
    let active = false;
    let raf = 0;

    const update = () => {
      raf = 0;
      const fontSize = parseFloat(getComputedStyle(heading).fontSize) || 100;
      const radius = fontSize * 1.55;

      chars.forEach((char, index) => {
        const rect = char.getBoundingClientRect();
        const distance = Math.hypot(pointerX - (rect.left + rect.width / 2), pointerY - (rect.top + rect.height / 2));
        const raw = active ? clamp(1 - distance / radius, 0, 1) : 0;
        const eased = raw * raw * (3 - 2 * raw);
        if (Math.abs(eased - values[index]) > 0.004) {
          values[index] = eased;
          char.style.setProperty("--p", eased.toFixed(3));
        }
      });
    };

    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      pointerX = event.clientX;
      pointerY = event.clientY;
      const rect = heading.getBoundingClientRect();
      const margin = rect.height * 0.35;
      const inside =
        pointerX > rect.left - margin &&
        pointerX < rect.right + margin &&
        pointerY > rect.top - margin &&
        pointerY < rect.bottom + margin;
      if (!inside && !active) return;
      active = inside;
      if (!raf) raf = requestAnimationFrame(update);
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      cancelAnimationFrame(raf);
      chars.forEach((char) => char.style.removeProperty("--p"));
    };
  }, [interactive, label]);

  let charIndex = 0;

  return (
    <h1 ref={headingRef} className={`c-kinetic ${className}`} aria-label={label}>
      {lines.map((line, lineIndex) => (
        <span key={lineIndex} className="c-kline" aria-hidden="true">
          <span className={line.accent ? "c-accent" : undefined}>
            {line.text.split(" ").map((word, wordIndex, words) => (
              <Fragment key={wordIndex}>
                <span className="c-word">
                  {Array.from(word).map((char) => {
                    const index = charIndex++;
                    return (
                      <span key={index} className="c-char" style={{ "--ci": index } as CSSProperties}>
                        {char}
                      </span>
                    );
                  })}
                </span>
                {wordIndex < words.length - 1 ? " " : null}
              </Fragment>
            ))}
          </span>
        </span>
      ))}
    </h1>
  );
}
