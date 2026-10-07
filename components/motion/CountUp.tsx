"use client";

import { useEffect, useRef } from "react";
import { animate, motion, useInView, useMotionValue, useTransform } from "motion/react";
import { useIntroDone } from "./Intro";
import { EASE_OUT } from "@/lib/motion";

/** Signed numbers read like a goal difference: +4, −13, 0. */
export function formatValue(n: number, signed: boolean) {
  if (!signed || n === 0) return String(n);
  return n > 0 ? `+${n}` : `−${Math.abs(n)}`;
}

/** A number that counts to its value when it comes into view, and glides between values after. */
export default function CountUp({
  value,
  signed = false,
  duration = 1.6,
  className,
}: {
  value: number;
  signed?: boolean;
  duration?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });
  const ready = useIntroDone();
  const count = useMotionValue(0);
  const text = useTransform(count, (v) => formatValue(Math.round(v), signed));

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      count.set(value);
      return;
    }
    if (!inView || !ready) return;
    const controls = animate(count, value, { duration, ease: EASE_OUT });
    return () => controls.stop();
  }, [inView, ready, value, duration, count]);

  return (
    <span ref={ref} className={className}>
      <span className="sr-only">{formatValue(value, signed)}</span>
      <motion.span aria-hidden>{text}</motion.span>
    </span>
  );
}
