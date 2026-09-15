import { useEffect, useRef } from "react";

/*
 * Własny kursor + magnetyczne przyciski (tylko mysz, bez ograniczenia ruchu – decyduje rodzic).
 * - kropka idzie 1:1 za wskaźnikiem, pierścień dogania ją z bezwładnością
 * - kontekst z atrybutów: data-cursor="view|drag|copy" + data-cursor-label="Zobacz"
 *   zamienia pierścień w złoty krążek z etykietą; linki i przyciski go powiększają
 * - [data-magnetic="0.35"] przyciąga element do kursora (siła opcjonalna)
 * - pola formularza przywracają zwykły kursor tekstowy
 * Komponent może odświeżyć etykietę zdarzeniem window "c-cursor-refresh".
 */

export function ConceptCursor() {
  const rootRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const ring = ringRef.current;
    const dot = dotRef.current;
    const label = labelRef.current;
    if (!root || !ring || !dot || !label) return;

    const html = document.documentElement;
    html.classList.add("c-has-cursor");

    let x = -200;
    let y = -200;
    let ringX = -200;
    let ringY = -200;
    let raf = 0;
    let lastTarget: Element | null = null;
    let magnet: HTMLElement | null = null;
    const magnetOffsets = new WeakMap<HTMLElement, { x: number; y: number }>();

    const setState = (state: string, text = "") => {
      if (ring.dataset.state !== state) ring.dataset.state = state;
      if (label.textContent !== text) label.textContent = text;
    };

    const resolveState = (target: Element | null) => {
      if (!target) return setState("");
      const custom = target.closest<HTMLElement>("[data-cursor]");
      if (custom) return setState(custom.dataset.cursor ?? "link", custom.dataset.cursorLabel ?? "");
      if (target.closest("input, textarea, select, [contenteditable='true']")) return setState("text");
      if (target.closest("a, button, summary, label, [role='button'], [role='option']")) return setState("link");
      return setState("");
    };

    const follow = () => {
      ringX += (x - ringX) * 0.2;
      ringY += (y - ringY) * 0.2;
      ring.style.transform = `translate3d(${ringX.toFixed(2)}px, ${ringY.toFixed(2)}px, 0)`;
      raf = Math.abs(x - ringX) + Math.abs(y - ringY) > 0.2 ? requestAnimationFrame(follow) : 0;
    };

    const releaseMagnet = () => {
      if (!magnet) return;
      magnet.style.setProperty("--mx", "0px");
      magnet.style.setProperty("--my", "0px");
      magnetOffsets.set(magnet, { x: 0, y: 0 });
      magnet = null;
    };

    const pullMagnet = (target: Element | null) => {
      const next = target?.closest<HTMLElement>("[data-magnetic]") ?? null;
      if (next !== magnet) releaseMagnet();
      if (!next) return;
      magnet = next;
      const rect = next.getBoundingClientRect();
      const previous = magnetOffsets.get(next) ?? { x: 0, y: 0 };
      const strength = Number(next.dataset.magnetic) || 0.35;
      const offsetX = (x - (rect.left + rect.width / 2 - previous.x)) * strength;
      const offsetY = (y - (rect.top + rect.height / 2 - previous.y)) * strength;
      magnetOffsets.set(next, { x: offsetX, y: offsetY });
      next.style.setProperty("--mx", `${offsetX.toFixed(1)}px`);
      next.style.setProperty("--my", `${offsetY.toFixed(1)}px`);
    };

    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      x = event.clientX;
      y = event.clientY;
      if (root.dataset.shown !== "true") {
        ringX = x;
        ringY = y;
        root.dataset.shown = "true";
      }
      dot.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      if (!raf) raf = requestAnimationFrame(follow);
      const target = event.target instanceof Element ? event.target : null;
      if (target !== lastTarget) {
        lastTarget = target;
        resolveState(target);
      }
      pullMagnet(target);
    };

    const onPointerDown = () => (ring.dataset.pressed = "true");
    const onPointerUp = () => delete ring.dataset.pressed;
    const onLeave = () => {
      root.dataset.shown = "false";
      releaseMagnet();
    };
    const onRefresh = () => resolveState(lastTarget);

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerdown", onPointerDown, { passive: true });
    window.addEventListener("pointerup", onPointerUp, { passive: true });
    window.addEventListener("c-cursor-refresh", onRefresh);
    html.addEventListener("mouseleave", onLeave);

    return () => {
      cancelAnimationFrame(raf);
      releaseMagnet();
      html.classList.remove("c-has-cursor");
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("c-cursor-refresh", onRefresh);
      html.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  return (
    <div ref={rootRef} className="c-cursor" aria-hidden="true">
      <div ref={ringRef} className="c-cursor__ring" data-state="">
        <div className="c-cursor__shape">
          <span ref={labelRef} className="c-cursor__label" />
        </div>
      </div>
      <div ref={dotRef} className="c-cursor__dot">
        <div className="c-cursor__dot-shape" />
      </div>
    </div>
  );
}
