import type { ElementType, ReactNode } from "react";
import { cn } from "@/lib/utils";

type LineRevealProps = {
  /** One entry per line. Each is a complete phrase, never a single word. */
  lines: ReactNode[];
  className?: string;
  as?: ElementType;
};

/**
 * Wipes a heading in line by line, armed by `ScrollAnimator`.
 *
 * Each child is a whole line, so the heading still reads as one continuous
 * phrase to a screen reader and the full text is in the server HTML whether or
 * not JavaScript runs.
 */
export default function LineReveal({ lines, className, as }: LineRevealProps) {
  const Tag = (as ?? "h2") as ElementType;

  return (
    <Tag className={cn("lines", className)} data-animate="lines">
      {lines.map((line, index) => (
        <span key={index}>
          <span>{line}</span>
        </span>
      ))}
    </Tag>
  );
}
