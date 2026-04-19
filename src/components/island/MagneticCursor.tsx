import { useEffect, useRef } from 'react';

/**
 * Dot-and-ring custom cursor with magnetic snap on interactive elements.
 *
 * - Dot: tracks the mouse 1:1, uses mix-blend-mode: difference so it stays
 *   visible on any background without palette-specific tuning.
 * - Ring: follows with a spring-lerp, grows on hover over links / buttons
 *   / anything marked [data-magnetic].
 * - Disabled on touch devices and when the user prefers reduced motion.
 */
export default function MagneticCursor() {
  const dotRef = useRef<HTMLDivElement | null>(null);
  const ringRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.matchMedia('(pointer: coarse)').matches) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    let mx = window.innerWidth / 2;
    let my = window.innerHeight / 2;
    let rx = mx;
    let ry = my;
    let raf = 0;
    let shown = false;

    function reveal() {
      if (shown) return;
      shown = true;
      dot?.classList.add('is-visible');
      ring?.classList.add('is-visible');
    }

    function onMove(e: MouseEvent) {
      mx = e.clientX;
      my = e.clientY;
      if (dot) {
        dot.style.transform = `translate3d(${mx}px, ${my}px, 0) translate(-50%, -50%)`;
      }
      reveal();
    }

    function loop() {
      rx += (mx - rx) * 0.18;
      ry += (my - ry) * 0.18;
      if (ring) {
        ring.style.transform = `translate3d(${rx}px, ${ry}px, 0) translate(-50%, -50%)`;
      }
      raf = requestAnimationFrame(loop);
    }

    function onOver(e: MouseEvent) {
      const target = e.target as HTMLElement | null;
      const hit = target?.closest<HTMLElement>(
        'a, button, [role="button"], [data-magnetic], input, textarea, select, [cmdk-item]',
      );
      if (hit) {
        ring?.classList.add('is-active');
      } else {
        ring?.classList.remove('is-active');
      }
    }

    function onLeave() {
      dot?.classList.remove('is-visible');
      ring?.classList.remove('is-visible');
      shown = false;
    }

    window.addEventListener('mousemove', onMove, { passive: true });
    window.addEventListener('mouseout', (e) => {
      if (!e.relatedTarget) onLeave();
    });
    document.addEventListener('mouseover', onOver, { passive: true });
    raf = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseover', onOver);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <>
      <div ref={dotRef} className="magnetic-dot" aria-hidden="true" />
      <div ref={ringRef} className="magnetic-ring" aria-hidden="true" />
    </>
  );
}
