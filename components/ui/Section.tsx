import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type SectionProps = {
  children: ReactNode;
  id?: string;
  tone?: "surface" | "off" | "ink";
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
} as const;

export default function Section({
  children,
  id,
  tone = "surface",
  className,
  containerClassName,
  bleed = false,
  ...rest
}: SectionProps) {
  return (
    <section
      id={id}
      className={cn(tones[tone], "px-5 py-20 sm:px-8 sm:py-28", className)}
      {...rest}
    >
      {bleed ? children : <div className={cn("mx-auto max-w-6xl", containerClassName)}>{children}</div>}
    </section>
  );
}
