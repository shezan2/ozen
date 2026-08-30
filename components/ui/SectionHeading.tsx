import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type SectionHeadingProps = {
  label?: string;
  title: ReactNode;
  lede?: ReactNode;
  tone?: "light" | "dark";
  className?: string;
  as?: "h2" | "h3";
};

export default function SectionHeading({
  label,
  title,
  lede,
  tone = "light",
  className,
  as: Tag = "h2",
}: SectionHeadingProps) {
  return (
    <div className={className}>
      {label ? (
        <p
          className={cn(
           "label mb-5 flex items-center gap-3",
            tone === "dark" ? "text-white/55" : "text-ink-mute",
          )}
        >
          <span className={cn("h-px w-8", tone === "dark" ? "bg-lime" : "bg-lime-deep")} aria-hidden />
          {label}
        </p>
      ) : null}
      <Tag
        className={cn(
         "display text-[clamp(2.125rem,1.2rem+3.6vw,4rem)]",
          tone === "dark" ? "text-white" : "text-ink",
        )}
      >
        {title}
      </Tag>
      {lede ? (
        <div
          className={cn("lede mt-6 max-w-2xl", tone === "dark" ? "text-white/70" : "text-ink-mute")}
        >
          {lede}
        </div>
      ) : null}
    </div>
  );
}
