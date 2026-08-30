"use client";

import type { ReactNode } from "react";
import { LazyMotion } from "motion/react";

const loadFeatures = () => import("@/components/site/motion-features").then((mod) => mod.default);

export default function LazyMotionProvider({ children }: { children: ReactNode }) {
  return <LazyMotion features={loadFeatures}>{children}</LazyMotion>;
}
