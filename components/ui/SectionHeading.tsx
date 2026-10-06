import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  eyebrow: string;
  title: ReactNode;
  description?: string;
  onNavy?: boolean;
  className?: string;
}

export default function SectionHeading({ eyebrow, title, description, onNavy = false, className = "" }: SectionHeadingProps) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <p className={cn("text-xs font-medium", onNavy ? "text-paper-ink-faint" : "text-ink-faint")}>{eyebrow}</p>
      <h2 className={cn("font-serif text-3xl font-semibold tracking-tight sm:text-4xl", onNavy ? "text-paper-ink" : "text-ink")}>
        {title}
      </h2>
      {description && (
        <p className={cn("max-w-xl text-base leading-relaxed", onNavy ? "text-paper-ink-dim" : "text-ink-dim")}>{description}</p>
      )}
    </div>
  );
}
