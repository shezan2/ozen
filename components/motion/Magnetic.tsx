"use client";

import { useRef, type ReactNode } from "react";
import { motion, useSpring } from "motion/react";
import { cn } from "@/lib/utils";

const SPRING = { stiffness: 220, damping: 18, mass: 0.5 };

/** Leans toward the cursor and springs back — only for a real mouse. */
export default function Magnetic({ children, strength = 0.3, className }: { children: ReactNode; strength?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useSpring(0, SPRING);
  const y = useSpring(0, SPRING);

  const onPointerMove = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse" || !ref.current) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const r = ref.current.getBoundingClientRect();
    x.set((e.clientX - (r.left + r.width / 2)) * strength);
    y.set((e.clientY - (r.top + r.height / 2)) * strength);
  };
  const reset = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div ref={ref} style={{ x, y }} onPointerMove={onPointerMove} onPointerLeave={reset} className={cn("inline-block", className)}>
      {children}
    </motion.div>
  );
}
