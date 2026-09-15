import { useEffect, useRef } from "react";
import { clamp, damp, prefersReducedMotion } from "./fx";

/*
 * Taśma z zakresem usług, sterowana prędkością przewijania:
 * sama płynie powoli, przyspiesza przy szybkim scrollu, zmienia kierunek razem z nim
 * i lekko się pochyla (skewX) proporcjonalnie do prędkości. Pauza poza ekranem.
 */

function Star() {
  return (
    <svg className="c-marquee__star" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 0c.6 6.2 5.8 11.4 12 12-6.2.6-11.4 5.8-12 12-.6-6.2-5.8-11.4-12-12C6.2 11.4 11.4 6.2 12 0z" />
    </svg>
  );
}

export function VelocityMarquee({ items }: { items: string[] }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const track = trackRef.current;
    if (!root || !track || prefersReducedMotion()) return;

    let raf = 0;
    let last = performance.now();
    let lastScroll = window.scrollY;
    let offset = 0;
    let velocity = 0;
    let direction = 1;
    let loopWidth = 0;

    const measure = () => {
      loopWidth = track.scrollWidth / 2;
    };

    const frame = (now: number) => {
      const dt = Math.max(0.001, Math.min(0.064, (now - last) / 1000));
      last = now;
      const scroll = window.scrollY;
      const delta = scroll - lastScroll;
      lastScroll = scroll;

      velocity = damp(velocity, delta / dt, 0.12, dt);
      if (Math.abs(delta) > 0.5) direction = delta > 0 ? 1 : -1;

      const speed = 55 + Math.min(Math.abs(velocity) * 0.45, 1400);
      offset += direction * speed * dt;
      if (loopWidth > 0) offset = ((offset % loopWidth) + loopWidth) % loopWidth;

      const skew = clamp(-velocity * 0.0035, -7, 7);
      track.style.transform = `translate3d(${(-offset).toFixed(2)}px, 0, 0) skewX(${skew.toFixed(2)}deg)`;
      raf = requestAnimationFrame(frame);
    };

    const start = () => {
      if (raf) return;
      last = performance.now();
      lastScroll = window.scrollY;
      raf = requestAnimationFrame(frame);
    };
    const stop = () => {
      cancelAnimationFrame(raf);
      raf = 0;
    };

    const intersection = new IntersectionObserver(([entry]) => (entry.isIntersecting ? start() : stop()));
    const resize = new ResizeObserver(measure);
    measure();
    intersection.observe(root);
    resize.observe(track);

    return () => {
      stop();
      intersection.disconnect();
      resize.disconnect();
    };
  }, [items]);

  const sequence = (copy: number) =>
    items.map((item, index) => (
      <span key={`${copy}-${index}`} className="c-marquee__item">
        <span className={index % 2 ? "c-marquee__word c-marquee__word--serif" : "c-marquee__word"}>{item}</span>
        <Star />
      </span>
    ));

  return (
    <div ref={rootRef} className="c-marquee" aria-hidden="true">
      <div ref={trackRef} className="c-marquee__track">
        {sequence(0)}
        {sequence(1)}
      </div>
    </div>
  );
}
