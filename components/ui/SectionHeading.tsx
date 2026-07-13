import type { ReactNode } from "react";
import Reveal from "./Reveal";

interface SectionHeadingProps {
  eyebrow: string;
  title: ReactNode;
  description?: string;
  align?: "left" | "center";
  className?: string;
}

export default function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  className = "",
}: SectionHeadingProps) {
  const alignCls = align === "center" ? "items-center text-center" : "items-start text-left";
  return (
    <Reveal className={`flex flex-col gap-5 ${alignCls} ${className}`}>
      <div className="flex items-center gap-4">
        <span className="hairline w-10" aria-hidden />
        <p className="eyebrow">{eyebrow}</p>
        {align === "center" && <span className="hairline w-10" aria-hidden />}
      </div>
      <h2 className="font-display text-4xl font-medium leading-[1.08] tracking-tight text-ink sm:text-5xl lg:text-6xl">
        {title}
      </h2>
      {description && (
        <p className="max-w-2xl text-base leading-relaxed text-ink-dim sm:text-lg">{description}</p>
      )}
    </Reveal>
  );
}
