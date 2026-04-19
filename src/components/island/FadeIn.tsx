import { type CSSProperties, type ReactNode, useEffect, useRef, useState } from 'react';

interface FadeInProps {
  children: ReactNode;
  /** Stagger delay in ms before animation starts. */
  delay?: number;
  /** Translate distance in px. */
  y?: number;
  className?: string;
  as?: 'div' | 'section' | 'article' | 'header' | 'li';
  style?: CSSProperties;
}

/**
 * Lightweight IntersectionObserver-based fade-in. Avoids shipping a motion
 * library when a class transition is enough.
 */
export default function FadeIn({
  children,
  delay = 0,
  y = 16,
  className = '',
  as: Tag = 'div',
  style,
}: FadeInProps) {
  const ref = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (typeof IntersectionObserver === 'undefined') {
      setVisible(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setVisible(true);
            io.disconnect();
            break;
          }
        }
      },
      { threshold: 0.12 },
    );
    io.observe(node);
    return () => io.disconnect();
  }, []);

  const merged: CSSProperties = {
    transform: visible ? 'none' : `translate3d(0, ${y}px, 0)`,
    opacity: visible ? 1 : 0,
    transition: `opacity 600ms ease ${delay}ms, transform 600ms cubic-bezier(.2,.7,.2,1) ${delay}ms`,
    willChange: 'opacity, transform',
    ...style,
  };

  return (
    <Tag ref={ref as never} className={className} style={merged}>
      {children}
    </Tag>
  );
}
