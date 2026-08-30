import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type SectionProps = {
  children: ReactNode;
  id?: string;
  tone?: "surface" | "off" | "ink" | "lime";
  /** Vertical rhythm. Sections deliberately do not all breathe the same. */
  size?: "tight" | "base" | "tall";
  className?: string;
  containerClassName?: string;
  /** Drop the max-width container for full-bleed sections. */
  bleed?: boolean;
 "aria-labelledby"?: string;
};

const tones = {
  surface: "bg-surface text-ink",
  off: "bg-surface-off text-ink",
  ink: "on-ink bg-ink text-white",
  lime: "bg-lime text-ink",
} as const;

const sizes = {
  tight: "py-14 sm:py-16",
  base: "py-20 sm:py-28",
  tall: "py-24 sm:py-36",
} as const;

export default function Section({
  children,
  id,
  tone = "surface",
  size = "base",
  className,
  containerClassName,
  bleed = false,
  ...rest
}: SectionProps) {
  return (
    <section id={id} className={cn(tones[tone], sizes[size], "px-5 sm:px-8", className)} {...rest}>
      {bleed ? children : <div className={cn("mx-auto max-w-6xl", containerClassName)}>{children}</div>}
    </section>
  );
}
