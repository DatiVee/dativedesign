import {
  useEffect,
  useRef,
  type FocusEvent as ReactFocusEvent,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { flushSync } from "react-dom";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";
import { Link, useLocation } from "wouter";
import type { Project } from "@/data/siteContent";
import { clamp, damp, supportsViewTransitions, useDesktop, useFinePointer, useReducedMotion, waitFor } from "./fx";

/*
 * Realizacje.
 * Desktop: sekcja przypięta do ekranu, przewijanie w dół przesuwa galerię w bok
 * (z bezwładnością), zdjęcia mają paralaksę względem środka ekranu.
 * Mobile / ograniczenie ruchu: karuzela scroll-snap z natywnymi znacznikami ::scroll-marker.
 * Karty: przechylenie 3D + odblask pod kursorem, złoty glow, a klik uruchamia
 * View Transition – zdjęcie z karty płynnie zamienia się w zdjęcie na stronie realizacji.
 */

type Labels = {
  kicker: string;
  title: string;
  accent: string;
  desc: string;
  hint: string;
  all: string;
  open: string;
  prev: string;
  next: string;
  count: string;
  endTitle: string;
};

type Props = {
  projects: Project[];
  labels: Labels;
  portfolioPath: string;
  getProjectPath: (slug: string) => string;
};

const preloadDetail = () => {
  void import("@/pages/PortfolioDetail");
};

export function WorkShowcase({ projects, labels, portfolioPath, getProjectPath }: Props) {
  const desktop = useDesktop();
  const reduced = useReducedMotion();
  const finePointer = useFinePointer();
  const pinned = desktop && !reduced;
  const [, navigate] = useLocation();

  const sectionRef = useRef<HTMLElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const revealRef = useRef<(card: HTMLElement) => void>(() => undefined);

  useEffect(() => {
    const section = sectionRef.current;
    const pin = pinRef.current;
    const viewport = viewportRef.current;
    const track = trackRef.current;
    if (!section || !pin || !viewport || !track) return;

    if (!pinned) {
      track.style.transform = "";
      section.style.removeProperty("--travel");
      revealRef.current = () => undefined;
      return;
    }

    let travel = 0;
    let stickyTop = 0;
    let viewportWidth = 0;
    let current = -1;
    let raf = 0;
    let last = performance.now();
    let cards: { el: HTMLElement; center: number }[] = [];

    const measure = () => {
      viewportWidth = viewport.clientWidth;
      travel = Math.max(0, track.scrollWidth - viewportWidth);
      stickyTop = parseFloat(getComputedStyle(pin).top) || 0;
      section.style.setProperty("--travel", `${travel}px`);
      cards = Array.from(track.children as HTMLCollectionOf<HTMLElement>).map((el) => ({
        el,
        center: el.offsetLeft + el.offsetWidth / 2,
      }));
    };

    const targetProgress = () =>
      travel > 0 ? clamp((stickyTop - section.getBoundingClientRect().top) / travel, 0, 1) : 0;

    const render = (progress: number) => {
      const shift = progress * travel;
      track.style.transform = `translate3d(${(-shift).toFixed(2)}px, 0, 0)`;
      section.style.setProperty("--progress", progress.toFixed(4));
      for (const card of cards) {
        const relative = (card.center - shift - viewportWidth / 2) / viewportWidth;
        card.el.style.setProperty("--par", clamp(relative, -1.5, 1.5).toFixed(3));
      }
    };

    const frame = (now: number) => {
      const dt = Math.min(0.064, (now - last) / 1000);
      last = now;
      const target = targetProgress();
      current = current < 0 ? target : damp(current, target, 0.14, dt);
      if (Math.abs(target - current) < 0.0004) {
        current = target;
        raf = 0;
      } else {
        raf = requestAnimationFrame(frame);
      }
      render(current);
    };

    const kick = () => {
      if (raf) return;
      last = performance.now();
      raf = requestAnimationFrame(frame);
    };

    /* Tab z klawiatury na karcie poza ekranem: przewiń stronę tak, żeby karta była na środku. */
    revealRef.current = (card) => {
      const entry = cards.find((item) => item.el === card);
      if (!entry || travel <= 0) return;
      const progress = clamp((entry.center - viewportWidth / 2) / travel, 0, 1);
      const sectionTop = section.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({ top: sectionTop - stickyTop + progress * travel, behavior: "auto" });
    };

    const resize = new ResizeObserver(() => {
      measure();
      kick();
    });
    measure();
    current = targetProgress();
    render(current);
    resize.observe(track);
    resize.observe(viewport);
    window.addEventListener("scroll", kick, { passive: true });

    return () => {
      cancelAnimationFrame(raf);
      resize.disconnect();
      window.removeEventListener("scroll", kick);
      track.style.transform = "";
      section.style.removeProperty("--travel");
      section.style.removeProperty("--progress");
    };
  }, [pinned, projects.length]);

  const scrollCarousel = (direction: 1 | -1) => {
    const track = trackRef.current;
    const card = track?.firstElementChild as HTMLElement | null;
    if (!track) return;
    track.scrollBy({ left: direction * (card ? card.offsetWidth + 14 : track.clientWidth * 0.8), behavior: "smooth" });
  };

  const onCardMove = (event: ReactPointerEvent<HTMLElement>) => {
    if (!finePointer || reduced || event.pointerType !== "mouse") return;
    const card = event.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;
    card.style.setProperty("--rx", `${((0.5 - y) * 9).toFixed(2)}deg`);
    card.style.setProperty("--ry", `${((x - 0.5) * 11).toFixed(2)}deg`);
    card.style.setProperty("--gx", `${(x * 100).toFixed(1)}%`);
    card.style.setProperty("--gy", `${(y * 100).toFixed(1)}%`);
  };

  const onCardLeave = (event: ReactPointerEvent<HTMLElement>) => {
    event.currentTarget.style.setProperty("--rx", "0deg");
    event.currentTarget.style.setProperty("--ry", "0deg");
  };

  const onCardFocus = (event: ReactFocusEvent<HTMLElement>) => {
    preloadDetail();
    if (pinned && event.currentTarget.matches(":focus-visible")) revealRef.current(event.currentTarget);
  };

  const openProject = (event: ReactMouseEvent<HTMLAnchorElement>, slug: string) => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    if (!supportsViewTransitions()) return;
    event.preventDefault();

    const image = event.currentTarget.querySelector<HTMLImageElement>(".c-card__img");
    image?.style.setProperty("view-transition-name", "c-project");
    const href = getProjectPath(slug);

    const transition = document.startViewTransition(async () => {
      image?.style.removeProperty("view-transition-name");
      flushSync(() => navigate(href));
      await waitFor(() => {
        const hero = document.querySelector<HTMLImageElement>('[data-vt="project-hero"]');
        return hero?.complete ? hero : null;
      }, 1500);
    });
    /* Przejście bywa pomijane (np. karta w tle) – przeglądarka odrzuca wtedy transition.ready; to nie błąd. */
    transition.ready.catch(() => undefined);
  };

  return (
    <section ref={sectionRef} id="realizacje" className="c-work" data-mode={pinned ? "pinned" : "carousel"}>
      <div ref={pinRef} className="c-work__pin">
        <div className="container">
          <div className="c-head c-reveal">
            <div>
              <div className="c-label">
                <span className="c-label__n">(01)</span>
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
              {pinned ? (
                <span className="c-work__hint">
                  <span className="c-work__hint-line" aria-hidden="true" />
                  {labels.hint}
                </span>
              ) : (
                <div className="c-arrows">
                  <button type="button" className="c-arrow" onClick={() => scrollCarousel(-1)} aria-label={labels.prev}>
                    <ArrowLeft size={18} />
                  </button>
                  <button type="button" className="c-arrow" onClick={() => scrollCarousel(1)} aria-label={labels.next}>
                    <ArrowRight size={18} />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div ref={viewportRef} className="c-work__viewport">
          <div ref={trackRef} className="c-track">
            {projects.map((project, index) => (
              <Link
                key={project.slug}
                href={getProjectPath(project.slug)}
                className="c-card c-glow"
                data-cursor="view"
                data-cursor-label={labels.open}
                aria-label={`${labels.open}: ${project.title}`}
                onClick={(event) => openProject(event, project.slug)}
                onPointerEnter={preloadDetail}
                onPointerMove={onCardMove}
                onPointerLeave={onCardLeave}
                onFocus={onCardFocus}
              >
                <div className="c-card__media">
                  <img className="c-card__img" src={project.image} alt="" loading={index < 3 ? "eager" : "lazy"} />
                </div>
                <div className="c-card__glare" aria-hidden="true" />
                <div className="c-card__body">
                  <div className="c-label">
                    <span className="c-label__n">{String(index + 1).padStart(2, "0")}</span>
                    {project.category}
                  </div>
                  <h3 className="c-card__title">{project.title}</h3>
                  <p className="c-card__summary">{project.summary}</p>
                  <span className="c-card__cta">
                    {labels.open}
                    <ArrowUpRight size={14} />
                  </span>
                </div>
              </Link>
            ))}

            <Link
              href={portfolioPath}
              className="c-card c-card--end c-glow"
              data-cursor="view"
              data-cursor-label={labels.all}
              onFocus={onCardFocus}
            >
              <span className="c-label">
                <span className="c-label__n">{String(projects.length).padStart(2, "0")}+</span>
                {labels.count}
              </span>
              <span className="c-card__end-title">{labels.endTitle}</span>
              <span className="c-card__end-arrow" aria-hidden="true">
                <ArrowUpRight size={30} />
              </span>
            </Link>
          </div>
        </div>

        <div className="container">
          <div className="c-progress" aria-hidden="true" />
          <div className="c-work__foot">
            <Link href={portfolioPath} className="c-link">
              {labels.all}
              <ArrowRight size={14} />
            </Link>
            <span className="c-label">
              <span className="c-label__n">{String(projects.length).padStart(2, "0")}</span>
              {labels.count}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
