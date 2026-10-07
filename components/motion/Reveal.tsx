"use client";

import { useRef, type ReactNode } from "react";
import { motion, useInView, useReducedMotion } from "motion/react";
import { useIntroDone } from "./Intro";
import { EASE_OUT } from "@/lib/motion";

const hidden = { opacity: 0, y: 32, filter: "blur(10px)" };
const shown = { opacity: 1, y: 0, filter: "blur(0px)" };
// Margin rather than an amount threshold, so blocks taller than the screen still trigger.
const VIEW = { once: true, margin: "0px 0px -12% 0px" } as const;

/** A block that comes into focus — rising and sharpening — the first time it's seen. */
export default function Reveal({ children, className, delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, VIEW);
  const ready = useIntroDone();
  const reduce = useReducedMotion();

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={hidden}
      animate={reduce || (inView && ready) ? shown : hidden}
      transition={reduce ? { duration: 0 } : { duration: 1.1, delay, ease: EASE_OUT }}
    >
      {children}
    </motion.div>
  );
}

/** Staggers its RevealItem children in sequence. */
export function RevealGroup({ children, className, stagger = 0.08 }: { children: ReactNode; className?: string; stagger?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, VIEW);
  const ready = useIntroDone();
  const reduce = useReducedMotion();

  return (
    <motion.div
      ref={ref}
      className={className}
      initial="hidden"
      animate={reduce || (inView && ready) ? "show" : "hidden"}
      transition={{ staggerChildren: reduce ? 0 : stagger }}
    >
      {children}
    </motion.div>
  );
}

export function RevealItem({ children, className }: { children: ReactNode; className?: string }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      variants={{ hidden, show: { ...shown, transition: reduce ? { duration: 0 } : { duration: 1, ease: EASE_OUT } } }}
    >
      {children}
    </motion.div>
  );
}
