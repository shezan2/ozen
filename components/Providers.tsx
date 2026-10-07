"use client";

import type { ReactNode } from "react";
import { MotionConfig } from "motion/react";

/** Honour the visitor's reduced-motion setting in every animated control. */
export default function Providers({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
