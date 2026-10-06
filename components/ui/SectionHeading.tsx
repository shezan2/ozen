import type { ReactNode } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  title: ReactNode;
  description?: string;
  as?: "h1" | "h2";
  link?: { href: string; label: string };
  className?: string;
}

export default function SectionHeading({ title, description, as: Tag = "h2", link, className }: SectionHeadingProps) {
  return (
    <div className={cn("flex flex-wrap items-end justify-between gap-x-8 gap-y-3", className)}>
      <div className="flex flex-col gap-3">
        <Tag className={cn("type-title", Tag === "h1" ? "text-6xl sm:text-8xl" : "text-4xl sm:text-5xl")}>{title}</Tag>
        {description && <p className="max-w-xl text-base leading-relaxed text-silver">{description}</p>}
      </div>
      {link && (
        <Link
          href={link.href}
          className="type-name border-b border-gold pb-1 text-sm tracking-[0.04em] text-chalk transition-colors hover:text-gold"
        >
          {link.label}
        </Link>
      )}
    </div>
  );
}
