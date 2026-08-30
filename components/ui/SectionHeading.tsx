import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type SectionHeadingProps = {
  eyebrow?: string;
  title: ReactNode;
  lede?: ReactNode;
  tone?: "light" | "dark";
  align?: "left" | "center";
  className?: string;
  /** Rendered as an h2 by default; pass "h3" for nested sections. */
  as?: "h2" | "h3";
};

export default function SectionHeading({
  eyebrow,
  title,
  lede,
  tone = "light",
  align = "left",
  className,
  as: Tag = "h2",
}: SectionHeadingProps) {
  return (
    <div className={cn(align === "center" && "mx-auto max-w-3xl text-center", className)}>
      {eyebrow ? (
        <p className={cn("eyebrow mb-4", tone === "dark" ? "text-lime" : "text-lime-deep")}>{eyebrow}</p>
      ) : null}
      <Tag
        className={cn(
          "display text-[clamp(2rem,1.3rem+3vw,3.25rem)]",
          tone === "dark" ? "text-white" : "text-ink",
        )}
      >
        {title}
      </Tag>
      {lede ? (
        <div
          className={cn(
            "lede mt-5 max-w-2xl",
            align === "center" && "mx-auto",
            tone === "dark" ? "text-white/72" : "text-ink-mute",
          )}
        >
          {lede}
        </div>
      ) : null}
    </div>
  );
}
