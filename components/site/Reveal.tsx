import type { CSSProperties, ElementType, ReactNode } from "react";

type RevealProps = {
  children: ReactNode;
  className?: string;
  /** Stagger in milliseconds. */
  delay?: number;
  /** Direction the block travels from. */
  from?: "up" | "left" | "right";
  as?: ElementType;
};

/**
 * Marks a whole block to be revealed on scroll by `ScrollAnimator`.
 *
 * A server component on purpose: it emits attributes and nothing else, so an
 * animated section costs no client boundary and no hydration. It animates one
 * block, never per-word or per-character spans — splitting copy into hidden
 * spans keeps it out of the accessible tree and hands crawlers empty elements.
 */
export default function Reveal({ children, className, delay = 0, from = "up", as }: RevealProps) {
  const Tag = (as ?? "div") as ElementType;

  return (
    <Tag
      className={className}
      data-animate=""
      data-from={from === "up" ? undefined : from}
      style={delay ? ({ "--reveal-delay": `${delay}ms` } as CSSProperties) : undefined}
    >
      {children}
    </Tag>
  );
}
