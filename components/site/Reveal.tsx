"use client";

import { useEffect, useRef, type ElementType, type ReactNode } from "react";

type RevealProps = {
  children: ReactNode;
  className?: string;
  /** Stagger in milliseconds. */
  delay?: number;
  as?: ElementType;
};

/**
 * Reveals a whole block on scroll.
 *
 * Two deliberate choices:
 *  - It animates one block, never per-word or per-character spans. Splitting
 *    copy into hidden spans keeps it out of the accessible tree and hands
 *    crawlers a page of empty elements.
 *  - The hidden starting state is applied from JavaScript, and only to elements
 *    that are still below the fold. Server HTML is always fully visible, so the
 *    copy survives with JS disabled and there is no flash of hidden content.
 */
export default function Reveal({ children, className, delay = 0, as }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const Tag = (as ?? "div") as ElementType;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (typeof IntersectionObserver === "undefined") return;

    // Already on screen: leave it alone rather than hide then re-show it.
    if (el.getBoundingClientRect().top < window.innerHeight * 0.92) return;

    el.dataset.reveal = "armed";

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            el.dataset.reveal = "in";
            observer.disconnect();
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.05 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag ref={ref} className={className} style={{ "--reveal-delay": `${delay}ms` } as React.CSSProperties}>
      {children}
    </Tag>
  );
}
