"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

interface RevealProps {
  children: ReactNode;
  delay?: number;
  y?: number;
  once?: boolean;
  className?: string;
  amount?: number;
}

export default function Reveal({
  children,
  delay = 0,
  y = 32,
  once = true,
  className,
  amount = 0.25,
}: RevealProps) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduced ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, amount }}
      transition={{ duration: 0.9, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
