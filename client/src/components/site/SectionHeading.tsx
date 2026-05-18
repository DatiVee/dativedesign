type SectionHeadingProps = {
  eyebrow: string;
  title: string;
  accent?: string;
  description?: string;
  align?: "left" | "center";
};

export function SectionHeading({
  eyebrow,
  title,
  accent,
  description,
  align = "left",
}: SectionHeadingProps) {
  const alignmentClass = align === "center" ? "text-center mx-auto" : "";

  return (
    <div className={alignmentClass}>
      <div className="section-label mb-4">{eyebrow}</div>
      <h2 className="font-display text-4xl font-black leading-tight text-white sm:text-5xl">
        {title}
        {accent ? <span className="text-gold"> {accent}</span> : null}
      </h2>
      {description ? (
        <p className={`mt-4 max-w-2xl text-sm leading-relaxed text-white/65 sm:text-base ${align === "center" ? "mx-auto" : ""}`}>
          {description}
        </p>
      ) : null}
    </div>
  );
}
