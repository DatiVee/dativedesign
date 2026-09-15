import type { CSSProperties } from "react";

/*
 * Manifest podświetlany słowo po słowie w rytmie przewijania (scroll-driven animation,
 * jedna nazwana oś czasu dla całego akapitu, zakres każdego słowa liczony z jego indeksu).
 * Fragmenty w *gwiazdkach* są akcentem (złota kursywa). Bez wsparcia API tekst jest po prostu jasny.
 */

type Token = { word: string; accent: boolean };

function tokenize(text: string): Token[] {
  const tokens: Token[] = [];
  text.split(/(\*[^*]+\*)/).forEach((part) => {
    if (!part) return;
    const accent = part.length > 2 && part.startsWith("*") && part.endsWith("*");
    const clean = accent ? part.slice(1, -1) : part;
    clean
      .split(/\s+/)
      .filter(Boolean)
      .forEach((word) => tokens.push({ word, accent }));
  });
  return tokens;
}

export function StatementReveal({ text, kicker }: { text: string; kicker: string }) {
  const tokens = tokenize(text);
  const plain = text.replace(/\*/g, "");

  return (
    <section className="c-statement-wrap">
      <div className="container">
        <div className="c-label">
          <span className="c-label__n" aria-hidden="true">
            ✦
          </span>
          {kicker}
        </div>
        <p className="c-statement">
          <span className="sr-only">{plain}</span>
          {tokens.map((token, index) => (
            <span
              key={index}
              aria-hidden="true"
              className={token.accent ? "c-statement__w c-statement__w--accent" : "c-statement__w"}
              style={{ "--i": index, "--n": tokens.length } as CSSProperties}
            >
              {token.word}{" "}
            </span>
          ))}
        </p>
      </div>
    </section>
  );
}
