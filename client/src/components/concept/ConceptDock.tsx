import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { ArrowUp, Search } from "lucide-react";
import { isMacLike, prefersReducedMotion, scrollToSection } from "./fx";

/*
 * Pływająca "wyspa" nawigacji (pojawia się po zjechaniu z hero):
 * - pierścień postępu całej strony w czystym CSS (animation-timeline: scroll(root)) = przycisk "na górę"
 * - linki sekcji z przesuwającym się wskaźnikiem aktywnej sekcji (IntersectionObserver)
 * - na telefonie zamiast linków: nazwa bieżącej sekcji, podmieniana z animacją
 * - przycisk palety poleceń (⌘K / Ctrl K) i CTA do kontaktu
 * - chowa się przy formularzu kontaktowym, żeby nie zasłaniać pól
 */

type Section = { id: string; label: string };
type Labels = { nav: string; top: string; palette: string; cta: string };

type Props = {
  sections: Section[];
  labels: Labels;
  onOpenPalette: () => void;
};

export function ConceptDock({ sections, labels, onOpenPalette }: Props) {
  const [pastHero, setPastHero] = useState(false);
  const [nearContact, setNearContact] = useState(false);
  const [activeId, setActiveId] = useState(sections[0]?.id ?? "");
  const [shortcut, setShortcut] = useState("Ctrl K");
  const linksRef = useRef<HTMLDivElement>(null);

  useEffect(() => setShortcut(isMacLike() ? "⌘K" : "Ctrl K"), []);

  useEffect(() => {
    let raf = 0;
    const check = () => {
      raf = 0;
      setPastHero(window.scrollY > window.innerHeight * 0.65);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(check);
    };
    check();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  useEffect(() => {
    const contact = document.getElementById("kontakt");
    if (!contact) return;
    const observer = new IntersectionObserver(([entry]) => setNearContact(entry.isIntersecting), {
      rootMargin: "0px 0px -35% 0px",
    });
    observer.observe(contact);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const elements = sections
      .map((section) => document.getElementById(section.id))
      .filter((element): element is HTMLElement => Boolean(element));
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveId(entry.target.id);
        });
      },
      { rootMargin: "-42% 0px -52% 0px" },
    );
    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [sections]);

  useLayoutEffect(() => {
    const links = linksRef.current;
    if (!links) return;
    const place = () => {
      const active = links.querySelector<HTMLElement>("[data-active]");
      if (!active) return;
      links.style.setProperty("--ix", `${active.offsetLeft}px`);
      links.style.setProperty("--iw", `${active.offsetWidth}px`);
    };
    place();
    const resize = new ResizeObserver(place);
    resize.observe(links);
    return () => resize.disconnect();
  }, [activeId]);

  const visible = pastHero && !nearContact;
  const activeLabel = sections.find((section) => section.id === activeId)?.label ?? "";

  return (
    <nav className="c-dock" data-visible={visible || undefined} aria-label={labels.nav} inert={!visible}>
      <button
        type="button"
        className="c-dock__top"
        onClick={() => window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? "auto" : "smooth" })}
        aria-label={labels.top}
      >
        <svg viewBox="0 0 36 36" className="c-dock__ring" aria-hidden="true">
          <circle cx="18" cy="18" r="16" pathLength={100} className="c-dock__ring-track" />
          <circle cx="18" cy="18" r="16" pathLength={100} className="c-dock__ring-fill" />
        </svg>
        <ArrowUp size={14} aria-hidden="true" />
      </button>

      <div ref={linksRef} className="c-dock__links">
        <span className="c-dock__indicator" aria-hidden="true" />
        {sections.map((section) => (
          <a
            key={section.id}
            href={`#${section.id}`}
            className="c-dock__link"
            data-active={activeId === section.id || undefined}
            aria-current={activeId === section.id ? "true" : undefined}
            onClick={(event) => {
              event.preventDefault();
              scrollToSection(section.id);
            }}
          >
            {section.label}
          </a>
        ))}
      </div>

      <span className="c-dock__current" aria-hidden="true">
        <span key={activeId} className="c-dock__current-text">
          {activeLabel}
        </span>
      </span>

      <button
        type="button"
        className="c-dock__cmd"
        onClick={onOpenPalette}
        aria-label={labels.palette}
        aria-keyshortcuts="Control+K Meta+K"
      >
        <Search size={14} aria-hidden="true" />
        <kbd>{shortcut}</kbd>
      </button>

      <a
        href="#kontakt"
        className="c-dock__cta"
        data-magnetic="0.2"
        onClick={(event) => {
          event.preventDefault();
          scrollToSection("kontakt");
        }}
      >
        {labels.cta}
      </a>
    </nav>
  );
}
