import { useEffect, useRef, useState, type CSSProperties } from "react";

/*
 * Wielki adres e-mail jako mikrointerakcja: klik kopiuje adres do schowka
 * (etykieta kursora i status zmieniają się na "Skopiowano"), litery robią falę przy najechaniu.
 * Obok zwykły link mailto dla osób z klientem poczty. Brak dostępu do schowka → mailto.
 */

type Labels = { copy: string; copied: string; hint: string; open: string };

export function CopyEmail({ email, labels }: { email: string; labels: Labels }) {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef(0);

  useEffect(() => () => window.clearTimeout(timerRef.current), []);
  useEffect(() => {
    window.dispatchEvent(new Event("c-cursor-refresh"));
  }, [copied]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      window.clearTimeout(timerRef.current);
      timerRef.current = window.setTimeout(() => setCopied(false), 2400);
    } catch {
      window.location.href = `mailto:${email}`;
    }
  };

  return (
    <div className="c-mailbox">
      <button
        type="button"
        className="c-mail"
        onClick={copy}
        data-cursor="copy"
        data-cursor-label={copied ? labels.copied : labels.copy}
        data-copied={copied || undefined}
      >
        <span className="sr-only">
          {labels.copy}: {email}
        </span>
        <span className="c-mail__text" aria-hidden="true">
          {Array.from(email).map((char, index) => (
            <span key={index} className="c-mail__ch" style={{ "--i": index } as CSSProperties}>
              {char}
            </span>
          ))}
        </span>
      </button>
      <div className="c-mail__row">
        <span className="c-mail__status" role="status" data-copied={copied || undefined}>
          {copied ? `✓ ${labels.copied}` : labels.hint}
        </span>
        <a href={`mailto:${email}`} className="c-link">
          {labels.open}
        </a>
      </div>
    </div>
  );
}
