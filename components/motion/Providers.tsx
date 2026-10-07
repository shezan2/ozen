"use client";

import { useEffect, type ReactNode } from "react";
import { MotionConfig } from "motion/react";
import Lenis from "lenis";
import { setLenis } from "@/lib/lenis";
import { IntroProvider } from "./Intro";

export default function Providers({ children }: { children: ReactNode }) {
  // Inertial smooth scrolling; Lenis disables itself for reduced-motion users.
  useEffect(() => {
    const lenis = new Lenis({ autoRaf: true, lerp: 0.085, stopInertiaOnNavigate: true });
    setLenis(lenis);
    return () => {
      lenis.destroy();
      setLenis(null);
    };
  }, []);

  // One delegated listener feeds pointer position to every .spotlight surface.
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      const el = (e.target as Element | null)?.closest?.<HTMLElement>(".spotlight");
      if (!el) return;
      const r = el.getBoundingClientRect();
      el.style.setProperty("--mx", `${e.clientX - r.left}px`);
      el.style.setProperty("--my", `${e.clientY - r.top}px`);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  return (
    <MotionConfig reducedMotion="user">
      <IntroProvider>{children}</IntroProvider>
    </MotionConfig>
  );
}
