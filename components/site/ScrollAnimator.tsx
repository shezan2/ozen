"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * One controller for every scroll animation on the site.
 *
 * The alternative — a client component per animated block — meant dozens of
 * client boundaries, each with its own hydration cost and serialised children.
 * Instead the sections stay pure server components that just mark themselves
 * with `data-animate`, and this single mounted component arms them.
 *
 * Elements already on screen are left alone rather than hidden and re-shown, so
 * the server HTML is always what the visitor sees first, and nothing is hidden
 * when JavaScript is off or has yet to run.
 */
export default function ScrollAnimator() {
  const pathname = usePathname();

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (typeof IntersectionObserver === "undefined") return;

    const frames = new Set<number>();

    const countTo = (el: HTMLElement) => {
      const to = Number(el.dataset.countTo ?? "0");
      const from = Number(el.dataset.countFrom ?? "0");
      const duration = 1100;
      const start = performance.now();
      const tick = (now: number) => {
        const t = Math.min(1, (now - start) / duration);
        el.textContent = String(Math.round(from + (to - from) * (1 - (1 - t) ** 3)));
        if (t < 1) frames.add(requestAnimationFrame(tick));
      };
      frames.add(requestAnimationFrame(tick));
    };

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const el = entry.target as HTMLElement;
          observer.unobserve(el);

          if (el.dataset.animate === "lines") el.dataset.lines = "in";
          else if (el.dataset.animate === "count") countTo(el);
          else el.dataset.reveal = "in";
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.05 },
    );

    const fold = window.innerHeight * 0.92;

    for (const el of document.querySelectorAll<HTMLElement>("[data-animate]")) {
      if (el.getBoundingClientRect().top < fold) continue;

      if (el.dataset.animate === "lines") {
        el.dataset.lines = "armed";
      } else if (el.dataset.animate === "count") {
        // The true figure is what the server rendered; stash it, then count to it.
        el.dataset.countTo = (el.textContent ?? "").trim();
        el.textContent = el.dataset.countFrom ?? "0";
      } else {
        el.dataset.reveal = "armed";
      }

      observer.observe(el);
    }

    return () => {
      observer.disconnect();
      for (const frame of frames) cancelAnimationFrame(frame);
    };
  }, [pathname]);

  return null;
}
