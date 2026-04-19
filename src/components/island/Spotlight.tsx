import { useEffect } from 'react';

interface SpotlightProps {
  /** CSS selector for the container to light up. */
  selector?: string;
}

/**
 * Sets --spot-x / --spot-y custom properties on the target element as the
 * pointer moves, so CSS can paint a radial gradient that follows the cursor.
 *
 * Mount with client:idle on pages that need it — re-queries on every move so
 * it survives View Transitions without needing transition:persist.
 */
export default function Spotlight({ selector = '[data-spotlight]' }: SpotlightProps) {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.matchMedia('(pointer: coarse)').matches) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    function onMove(e: MouseEvent) {
      const el = document.querySelector<HTMLElement>(selector);
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      el.style.setProperty('--spot-x', `${x}%`);
      el.style.setProperty('--spot-y', `${y}%`);
    }

    window.addEventListener('mousemove', onMove, { passive: true });
    return () => window.removeEventListener('mousemove', onMove);
  }, [selector]);

  return null;
}
