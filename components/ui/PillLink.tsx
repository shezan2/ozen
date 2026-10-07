import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

const VARIANT = {
  white: "bg-white text-noir hover:bg-haze",
  noir: "bg-noir text-white hover:bg-navy",
  navy: "bg-navy text-white hover:bg-navy-2",
  blue: "bg-blue text-white hover:bg-blue-2",
} as const;

export type PillVariant = keyof typeof VARIANT;

interface PillLinkProps {
  href: string;
  children: ReactNode;
  variant?: PillVariant;
  className?: string;
}

/** Flat pill button. Rounded shapes are kept for things you can press. */
export default function PillLink({ href, children, variant = "white", className }: PillLinkProps) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex h-12 shrink-0 items-center rounded-full px-6 text-[15px] font-semibold transition-colors duration-200",
        VARIANT[variant],
        className
      )}
    >
      {children}
    </Link>
  );
}
