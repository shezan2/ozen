import type { ComponentPropsWithoutRef } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

type Variant = "lime" | "ink" | "outline" | "onInk";
type Size = "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 rounded-full font-semibold tracking-tight transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-60";

const variants: Record<Variant, string> = {
  // Lime is the results colour — ink text on lime clears AA comfortably.
  lime: "bg-lime text-ink hover:bg-lime-bright",
  ink: "bg-ink text-white hover:bg-ink-raised",
  outline: "border-2 border-ink text-ink hover:bg-ink hover:text-white",
  onInk: "border-2 border-white/35 text-white hover:border-lime hover:text-lime",
};

const sizes: Record<Size, string> = {
  md: "h-12 px-6 text-[0.9375rem]",
  lg: "h-14 px-8 text-base",
};

export function buttonStyles(variant: Variant = "lime", size: Size = "md", className?: string) {
  return cn(base, variants[variant], sizes[size], className);
}

type ButtonLinkProps = {
  href: string;
  variant?: Variant;
  size?: Size;
  /** Set for links that leave the site. */
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
