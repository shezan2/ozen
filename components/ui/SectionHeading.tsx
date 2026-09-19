import type { ReactNode } from "react";
import Reveal from "./Reveal";
import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  eyebrow: string;
  title: ReactNode;
  description?: string;
  align?: "left" | "center";
  onNavy?: boolean;
  className?: string;
}

export default function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  onNavy = false,
  className = "",
}: SectionHeadingProps) {
  const alignCls = align === "center" ? "items-center text-center" : "items-start text-left";
  return (
    <Reveal className={cn("flex flex-col gap-4", alignCls, className)}>
      <p className={onNavy ? "eyebrow-on-navy" : "eyebrow"}>{eyebrow}</p>
      <h2
        className={cn(
          "text-4xl font-semibold leading-[1.08] tracking-tight sm:text-5xl",
          onNavy ? "text-paper-ink" : "text-ink"
        )}
      >
        {title}
      </h2>
      {description && (
        <p
          className={cn(
            "max-w-2xl text-base leading-relaxed sm:text-lg",
            onNavy ? "text-paper-ink-dim" : "text-ink-dim"
          )}
        >
          {description}
        </p>
      )}
    </Reveal>
  );
}
