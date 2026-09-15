import { useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { flushSync } from "react-dom";
import {
  ArrowRight,
  Check,
  CreditCard,
  FileText,
  Layers,
  Megaphone,
  Package,
  PenTool,
  Phone,
  Plus,
  Share2,
  Sparkles,
  Tag,
  X,
  type LucideIcon,
} from "lucide-react";
import { Link } from "wouter";
import type { Project, Service } from "@/data/siteContent";
import { prefersReducedMotion, scrollToSection } from "./fx";

/*
 * Zakres usług jako bento. Kafelek po kliknięciu "rozwija się" w pełny arkusz szczegółów:
 * natywny <dialog> (fokus, Esc, tło nieaktywne za darmo) + animacja clip-path od prostokąta
 * klikniętego kafelka do pełnego panelu (FLIP bez zniekształcania treści).
 * "Zapytaj o ten projekt" zamyka arkusz, wpisuje nazwę usługi do formularza i przewija do kontaktu.
 */

const ICONS: Record<string, LucideIcon> = {
  "projekt-logo": PenTool,
  branding: Layers,
  "projekt-etykiety": Tag,
  "projekt-opakowania": Package,
  "projekt-wizytowki": CreditCard,
  "projekt-banera": Megaphone,
  "social-media": Share2,
  "projekt-ulotki": FileText,
};

type Labels = {
  kicker: string;
  title: string;
  accent: string;
  desc: string;
  more: string;
  benefits: string;
  deliverables: string;
  related: string;
  open: string;
  ask: string;
  call: string;
  close: string;
  prefill: (serviceName: string) => string;
};

type Props = {
  services: Service[];
  projects: Project[];
  labels: Labels;
  getProjectPath: (slug: string) => string;
};

const OPEN_CLIP = "inset(0px 0px 0px 0px round 28px)";

function clipFromTile(tile: HTMLElement, panel: HTMLElement) {
  const from = tile.getBoundingClientRect();
  const to = panel.getBoundingClientRect();
  const top = Math.max(0, from.top - to.top);
  const right = Math.max(0, to.right - from.right);
  const bottom = Math.max(0, to.bottom - from.bottom);
  const left = Math.max(0, from.left - to.left);
  return `inset(${top}px ${right}px ${bottom}px ${left}px round 22px)`;
}

export function ServiceBento({ services, projects, labels, getProjectPath }: Props) {
  const [active, setActive] = useState<Service | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const originRef = useRef<HTMLElement | null>(null);

  const spotlight = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== "mouse") return;
    const tile = (event.target as HTMLElement).closest<HTMLElement>(".c-tile");
    if (!tile) return;
    const rect = tile.getBoundingClientRect();
    tile.style.setProperty("--mx", `${event.clientX - rect.left}px`);
    tile.style.setProperty("--my", `${event.clientY - rect.top}px`);
  };

  const open = (service: Service, tile: HTMLElement) => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    originRef.current = tile;
    flushSync(() => setActive(service));
    dialog.showModal();
    const panel = panelRef.current;
    if (!panel) return;
    panel.scrollTop = 0;
    if (prefersReducedMotion()) return;
    panel.animate([{ clipPath: clipFromTile(tile, panel) }, { clipPath: OPEN_CLIP }], {
      duration: 720,
      easing: "cubic-bezier(0.22, 1, 0.36, 1)",
    });
  };

  const close = (after?: () => void) => {
    const dialog = dialogRef.current;
    const panel = panelRef.current;
    const tile = originRef.current;
    if (!dialog?.open) {
      after?.();
      return;
    }
    const finish = () => {
      dialog.close();
      delete dialog.dataset.closing;
      after?.();
    };
    if (!panel || !tile || prefersReducedMotion()) return finish();

    dialog.dataset.closing = "true";
    const animation = panel.animate([{ clipPath: OPEN_CLIP }, { clipPath: clipFromTile(tile, panel) }], {
      duration: 460,
      easing: "cubic-bezier(0.64, 0, 0.78, 0)",
      fill: "forwards",
    });
    /* Promise + zapas czasowy: zdarzenie końca animacji nie przychodzi w karcie w tle. */
    let completed = false;
    const complete = () => {
      if (completed) return;
      completed = true;
      finish();
      animation.cancel();
    };
    animation.finished.then(complete, () => undefined);
    window.setTimeout(complete, 560);
  };

  const ask = (service: Service) => {
    close(() => {
      window.dispatchEvent(
        new CustomEvent("dative:contact-prefill", { detail: { message: labels.prefill(service.name) } }),
      );
      scrollToSection("kontakt");
      window.setTimeout(
        () => document.getElementById("contact-message")?.focus({ preventScroll: true }),
        prefersReducedMotion() ? 50 : 800,
      );
    });
  };

  const related = active
    ? active.portfolioSlugs
        .map((slug) => projects.find((project) => project.slug === slug))
        .filter((project): project is Project => Boolean(project))
        .slice(0, 3)
    : [];

  return (
    <section className="c-section" id="zakres">
      <div className="container">
        <div className="c-head c-reveal">
          <div>
            <div className="c-label">
              <span className="c-label__n">(02)</span>
              {labels.kicker}
            </div>
            <h2 className="c-h c-h--section">
              <span className="block">{labels.title}</span>
              <span className="block">
                <span className="c-accent">{labels.accent}</span>
              </span>
            </h2>
          </div>
          <div className="c-head__side">
            <p className="c-dim">{labels.desc}</p>
          </div>
        </div>

        <div className="c-bento c-reveal" onPointerMove={spotlight}>
          {services.map((service, index) => {
            const Icon = ICONS[service.slug] ?? Sparkles;
            const big = index === 0 || index === 5;
            return (
              <article
                key={service.slug}
                className={`c-tile c-glass c-glow${big ? " c-tile--big" : ""}`}
                data-cursor="view"
                data-cursor-label={labels.more}
              >
                <div className="c-tile__top">
                  <span className="c-tile__icon">
                    <Icon size={18} />
                  </span>
                  <span className="c-tile__cat">{service.category}</span>
                </div>
                <div>
                  <h3 className="c-tile__name">{service.name}</h3>
                  <p className="c-tile__tag">{service.tagline}</p>
                </div>
                {big ? <img className="c-tile__art" src={service.coverImage} alt="" loading="lazy" /> : null}
                <span className="c-tile__plus" aria-hidden="true">
                  <Plus size={16} />
                </span>
                <button
                  type="button"
                  className="c-tile__hit"
                  aria-haspopup="dialog"
                  onClick={(event) => open(service, event.currentTarget.parentElement as HTMLElement)}
                >
                  <span className="sr-only">
                    {labels.more}: {service.name}
                  </span>
                </button>
              </article>
            );
          })}
        </div>
      </div>

      <dialog
        ref={dialogRef}
        className="c-sheet-dialog"
        aria-labelledby="c-sheet-title"
        onCancel={(event) => {
          event.preventDefault();
          close();
        }}
        onClick={(event) => {
          if (event.target === event.currentTarget) close();
        }}
      >
        {active ? (
          <div ref={panelRef} className="c-sheet-panel">
            <button type="button" className="c-sheet-close" onClick={() => close()} aria-label={labels.close}>
              <X size={18} />
            </button>
            <div className="c-sheet-grid">
              <div className="c-sheet-media">
                <img src={active.coverImage} alt="" />
              </div>
              <div className="c-sheet-body">
                <div className="c-label">
                  <span className="c-label__n">✦</span>
                  {active.category}
                </div>
                <h2 id="c-sheet-title" className="c-h c-h--sub">
                  {active.name}
                </h2>
                <p className="c-sheet-tagline">{active.tagline}</p>
                <p className="c-sheet-desc">{active.heroDescription}</p>

                <div className="c-sheet-lists">
                  <div>
                    <h3 className="c-sheet-h">{labels.benefits}</h3>
                    <ul>
                      {active.benefits.map((item) => (
                        <li key={item}>
                          <Check size={15} aria-hidden="true" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3 className="c-sheet-h">{labels.deliverables}</h3>
                    <ul>
                      {active.deliverables.map((item) => (
                        <li key={item}>
                          <Check size={15} aria-hidden="true" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {related.length ? (
                  <div className="c-sheet-related">
                    <h3 className="c-sheet-h">{labels.related}</h3>
                    <div className="c-sheet-thumbs">
                      {related.map((project) => (
                        <Link
                          key={project.slug}
                          href={getProjectPath(project.slug)}
                          className="c-sheet-thumb"
                          data-cursor="view"
                          data-cursor-label={labels.open}
                          onClick={() => dialogRef.current?.close()}
                        >
                          <img src={project.image} alt="" loading="lazy" />
                          <span>{project.title}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                ) : null}

                <div className="c-sheet-actions">
                  <button
                    type="button"
                    className="c-btn c-btn--gold gold-button-shimmer"
                    data-magnetic="0.25"
                    onClick={() => ask(active)}
                  >
                    {labels.ask}
                    <ArrowRight size={15} />
                  </button>
                  <a href="tel:+48796106675" className="c-btn c-btn--glass" data-magnetic="0.25">
                    <Phone size={15} />
                    {labels.call}
                  </a>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </dialog>
    </section>
  );
}
