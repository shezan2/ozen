"use client";

import { motion, useMotionValue, useSpring, useReducedMotion } from "motion/react";
import { type ReactNode, type MouseEvent } from "react";

interface MagneticProps {
  children: ReactNode;
  className?: string;
  strength?: number;
}

/** Wrapper that makes its child drift toward the cursor — subtle, premium. */
export default function MagneticButton({ children, className, strength = 0.3 }: MagneticProps) {
  const reduced = useReducedMotion();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 200, damping: 16, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 200, damping: 16, mass: 0.4 });

  const onMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (reduced) return;
    const rect = e.currentTarget.getBoundingClientRect();
    x.set((e.clientX - rect.left - rect.width / 2) * strength);
    y.set((e.clientY - rect.top - rect.height / 2) * strength);
  };

  const onMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      className={`inline-block ${className ?? ""}`}
      style={{ x: sx, y: sy }}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
    >
      {children}
    </motion.div>
  );
}
