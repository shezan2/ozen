import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PillLinkProps {
  href: string;
  children: ReactNode;
  variant?: "solid" | "glass";
  className?: string;
}

/** Pill CTA whose label rolls over on hover. */
export default function PillLink({ href, children, variant = "solid", className }: PillLinkProps) {
  return (
    <Link
      href={href}
      className={cn(
        "group relative inline-flex h-12 items-center rounded-full px-7 text-[15px] font-medium transition-[background-color,border-color] duration-500",
        variant === "solid" ? "bg-chalk text-noir hover:bg-white" : "glass text-chalk backdrop-blur-xl hover:border-line-strong",
        className
      )}
    >
      <span className="relative block overflow-hidden leading-6">
        <span className="block transition-transform duration-500 ease-out-expo group-hover:-translate-y-full">{children}</span>
        <span aria-hidden className="absolute inset-0 translate-y-full transition-transform duration-500 ease-out-expo group-hover:translate-y-0">
          {children}
        </span>
      </span>
    </Link>
  );
}
