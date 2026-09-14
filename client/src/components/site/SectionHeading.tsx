type SectionHeadingProps = {
  eyebrow: string;
  title: string;
  accent?: string;
  description?: string;
  align?: "left" | "center";
  /** "h1" dla głównego nagłówka strony (SEO/a11y), domyślnie "h2". */
  as?: "h1" | "h2";
  /** "compact" dla dłuższych, zdaniowych nagłówków – żeby nie robiły ściany. */
  size?: "default" | "compact";
};

export function SectionHeading({
  eyebrow,
  title,
  accent,
  description,
  align = "left",
  as: Tag = "h2",
  size = "default",
}: SectionHeadingProps) {
  const alignmentClass = align === "center" ? "text-center mx-auto" : "";
  const titleSize =
    size === "compact" ? "text-[1.6rem] sm:text-[2.35rem]" : "text-[2rem] sm:text-[2.9rem]";

  return (
    <div className={alignmentClass}>
      <div
        className={`section-label mb-4 flex items-center gap-3 ${
          align === "center" ? "justify-center" : ""
        }`}
      >
        <span aria-hidden="true" className="h-px w-7 bg-gold/45" />
        {eyebrow}
      </div>
      <Tag
        className={`font-display ${titleSize} font-extrabold leading-[1.15] text-white`}
      >
        {title}
        {accent ? <span className="text-gold"> {accent}</span> : null}
      </Tag>
      {description ? (
        <p
          className={`mt-4 max-w-xl text-sm leading-relaxed text-white/62 sm:text-base ${
            align === "center" ? "mx-auto" : ""
          }`}
        >
          {description}
        </p>
      ) : null}
    </div>
  );
}
