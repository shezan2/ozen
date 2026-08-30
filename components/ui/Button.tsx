import type { ComponentPropsWithoutRef } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

type Variant = "lime" | "ink" | "outline" | "onInk" | "white";
type Size = "md" | "lg";

/* Flat-edged, heavy, high contrast — the same register as the label blocks. */
const base =
 "group inline-flex items-center justify-center gap-2.5 font-bold tracking-tight transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-60";

const variants: Record<Variant, string> = {
  lime: "bg-lime text-ink hover:bg-lime-bright",
  ink: "bg-ink text-white hover:bg-ink-raised",
  outline: "border-2 border-ink text-ink hover:bg-ink hover:text-white",
  onInk: "border-2 border-white/30 text-white hover:border-lime hover:text-lime",
  white: "bg-white text-ink hover:bg-surface-off",
};

const sizes: Record<Size, string> = {
  md: "h-12 px-6 text-[0.9375rem]",
  lg: "h-14 px-7 text-base sm:h-16 sm:px-9 sm:text-lg",
};

export function buttonStyles(variant: Variant = "lime", size: Size = "md", className?: string) {
  return cn(base, variants[variant], sizes[size], className);
}

type ButtonLinkProps = {
  href: string;
  variant?: Variant;
  size?: Size;
  external?: boolean;
} & Omit<ComponentPropsWithoutRef<"a">, "href">;

export function ButtonLink({
  href,
  variant = "lime",
  size = "md",
  external = false,
  className,
  children,
  ...rest
}: ButtonLinkProps) {
  const classes = buttonStyles(variant, size, className);

  if (external) {
    return (
      <a href={href} className={classes} rel="noopener noreferrer" target="_blank" {...rest}>
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={classes} {...rest}>
      {children}
    </Link>
  );
}

type ButtonProps = {
  variant?: Variant;
  size?: Size;
} & ComponentPropsWithoutRef<"button">;

export function Button({ variant = "lime", size = "md", className, ...rest }: ButtonProps) {
  return <button className={buttonStyles(variant, size, className)} {...rest} />;
}
