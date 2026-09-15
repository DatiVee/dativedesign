import { useRef, useState, type CSSProperties, type KeyboardEvent as ReactKeyboardEvent, type PointerEvent as ReactPointerEvent } from "react";
import { flushSync } from "react-dom";
import { ArrowLeft, ArrowRight, Star } from "lucide-react";
import type { Testimonial } from "@/data/siteContent";
import { prefersReducedMotion } from "./fx";

/*
 * Talia opinii do przeciągania (mysz i dotyk, Pointer Events).
 * Górną kartę przeciągasz w bok – po przekroczeniu progu (albo szybkim rzucie) odlatuje
 * na spód talii, karty pod spodem podjeżdżają. Strzałki i klawiatura (← →) robią to samo.
 * touch-action: pan-y – pionowe przewijanie strony na telefonie dalej działa.
 */

type Labels = { prev: string; next: string; drag: string };

export function ReviewDeck({ reviews, labels }: { reviews: Testimonial[]; labels: Labels }) {
  const [order, setOrder] = useState(() => reviews.map((_, index) => index));
  const deckRef = useRef<HTMLDivElement>(null);
  const topRef = useRef<HTMLElement | null>(null);
  const busyRef = useRef(false);
  const dragRef = useRef({ pointerId: -1, startX: 0, x: 0, startedAt: 0 });

  const cycle = (direction: 1 | -1) =>
    setOrder((current) =>
      direction === 1 ? [...current.slice(1), current[0]] : [current[current.length - 1], ...current.slice(0, -1)],
    );

  const next = (fromX = 0, direction: 1 | -1 = 1) => {
    const card = topRef.current;
    if (!card || busyRef.current) return;
    if (prefersReducedMotion()) {
      card.style.transform = "";
      cycle(1);
      return;
    }
    busyRef.current = true;
    const animation = card.animate(
      [
        { transform: `translateX(${fromX}px) rotate(${fromX * 0.04}deg)`, opacity: 1 },
        { transform: `translateX(${direction * 130}%) rotate(${direction * 20}deg)`, opacity: 0 },
      ],
      { duration: 420, easing: "cubic-bezier(0.4, 0, 1, 1)", fill: "forwards" },
    );
    /* Promise + zapas czasowy: zdarzenie końca animacji nie przychodzi w karcie w tle. */
    let completed = false;
    const complete = () => {
      if (completed) return;
      completed = true;
      card.style.transform = "";
      flushSync(() => cycle(1));
      animation.cancel();
      busyRef.current = false;
    };
    animation.finished.then(complete, () => undefined);
    window.setTimeout(complete, 520);
    if (typeof navigator.vibrate === "function") navigator.vibrate(8);
  };

  const previous = () => {
    if (busyRef.current) return;
    flushSync(() => cycle(-1));
    const card = topRef.current;
    if (!card || prefersReducedMotion()) return;
    card.animate(
      [
        { transform: "translateX(-130%) rotate(-20deg)", opacity: 0 },
        { transform: "translateX(0) rotate(0deg)", opacity: 1 },
      ],
      { duration: 520, easing: "cubic-bezier(0.22, 1, 0.36, 1)" },
    );
  };

  const onPointerDown = (event: ReactPointerEvent<HTMLElement>) => {
    if (busyRef.current || event.button !== 0) return;
    dragRef.current = { pointerId: event.pointerId, startX: event.clientX, x: 0, startedAt: performance.now() };
    event.currentTarget.setPointerCapture(event.pointerId);
    event.currentTarget.dataset.dragging = "true";
  };

  const onPointerMove = (event: ReactPointerEvent<HTMLElement>) => {
    const drag = dragRef.current;
    if (drag.pointerId !== event.pointerId) return;
    drag.x = event.clientX - drag.startX;
    event.currentTarget.style.transform = `translateX(${drag.x}px) rotate(${drag.x * 0.04}deg)`;
    deckRef.current?.style.setProperty("--drag", Math.min(1, Math.abs(drag.x) / 160).toFixed(3));
  };

  const endDrag = (event: ReactPointerEvent<HTMLElement>, cancelled = false) => {
    const drag = dragRef.current;
    if (drag.pointerId !== event.pointerId) return;
    const card = event.currentTarget;
    drag.pointerId = -1;
    delete card.dataset.dragging;
    deckRef.current?.style.setProperty("--drag", "0");
    const speed = Math.abs(drag.x) / Math.max(1, performance.now() - drag.startedAt);
    if (!cancelled && (Math.abs(drag.x) > 110 || (speed > 0.6 && Math.abs(drag.x) > 30))) {
      next(drag.x, drag.x > 0 ? 1 : -1);
    } else {
      card.style.transform = "";
    }
  };

  const onKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      next();
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      previous();
    }
  };

  const current = order[0] ?? 0;

  return (
    <div ref={deckRef} className="c-deck" role="group" aria-roledescription="carousel" tabIndex={0} onKeyDown={onKeyDown}>
      <div className="c-deck__stack">
        {reviews.map((review, index) => {
          const position = order.indexOf(index);
          const isTop = position === 0;
          return (
            <article
              key={review.id}
              ref={
                isTop
                  ? (element) => {
                      topRef.current = element;
                    }
                  : undefined
              }
              className="c-deck__card c-glass"
              style={{ "--pos": position } as CSSProperties}
              data-top={isTop || undefined}
              data-cursor={isTop ? "drag" : undefined}
              data-cursor-label={isTop ? labels.drag : undefined}
              onPointerDown={isTop ? onPointerDown : undefined}
              onPointerMove={isTop ? onPointerMove : undefined}
              onPointerUp={isTop ? (event) => endDrag(event) : undefined}
              onPointerCancel={isTop ? (event) => endDrag(event, true) : undefined}
            >
              <div className="c-stars" aria-label={`${review.rating}/5`}>
                {Array.from({ length: review.rating }).map((_, star) => (
                  <Star key={star} size={14} className="fill-current" aria-hidden="true" />
                ))}
              </div>
              <blockquote className="c-deck__quote">„{review.quote}”</blockquote>
              <footer className="c-deck__who">
                <b>{review.name}</b>
                <span>
                  {review.company} · {review.service}
                </span>
              </footer>
            </article>
          );
        })}
      </div>

      <div className="c-deck__controls">
        <button type="button" className="c-arrow" onClick={previous} aria-label={labels.prev} data-magnetic="0.3">
          <ArrowLeft size={18} />
        </button>
        <span className="c-deck__count" aria-live="polite">
          <b>{String(current + 1).padStart(2, "0")}</b> / {String(reviews.length).padStart(2, "0")}
        </span>
        <button type="button" className="c-arrow" onClick={() => next()} aria-label={labels.next} data-magnetic="0.3">
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
}
