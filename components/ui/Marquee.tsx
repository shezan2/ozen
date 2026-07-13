import type { ReactNode } from "react";

interface MarqueeProps {
  children: ReactNode;
  className?: string;
  /** Seconds for one full loop. */
  duration?: number;
}

/** Infinite horizontal marquee — content is duplicated for a seamless loop. */
export default function Marquee({ children, className = "", duration = 42 }: MarqueeProps) {
  return (
    <div
      className={`group/marquee relative overflow-hidden ${className}`}
      style={{
        maskImage:
          "linear-gradient(90deg, transparent, black 8%, black 92%, transparent)",
        WebkitMaskImage:
          "linear-gradient(90deg, transparent, black 8%, black 92%, transparent)",
      }}
    >
      <div
        className="flex w-max animate-marquee gap-6 pr-6 group-hover/marquee:[animation-play-state:paused] motion-reduce:animate-none"
        style={{ animationDuration: `${duration}s` }}
      >
        {children}
        <div aria-hidden className="flex gap-6 pr-6">
          {children}
        </div>
      </div>
    </div>
  );
}
