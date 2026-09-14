type PriceTagProps = {
  /** Gotowy tekst ceny, np. "300-600 zł netto" albo "od 149 zł". */
  value: string;
  className?: string;
  suffixClassName?: string;
};

// "300-600 zł netto" -> kwota + drobny dopisek; kwota nigdy się nie łamie.
const SUFFIX_RE = /\s+(netto|brutto|net|gross)\s*$/i;

export function PriceTag({ value, className = "", suffixClassName = "" }: PriceTagProps) {
  const match = value.match(SUFFIX_RE);
  const amount = (match ? value.replace(SUFFIX_RE, "") : value)
    // półpauza między widełkami czyta się lepiej niż dywiz
    .replace(/(\d)\s*-\s*(\d)/g, "$1–$2");
  const suffix = match?.[1];

  return (
    <span className={`inline-flex items-baseline gap-1.5 ${className}`}>
      <span className="whitespace-nowrap">{amount}</span>
      {suffix ? (
        <span className={`text-[0.62em] font-medium tracking-wide text-white/45 ${suffixClassName}`}>
          {suffix}
        </span>
      ) : null}
    </span>
  );
}
