import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils";

/** An endless strip that pauses under the cursor. The second copy is inert. */
export default function Marquee({ children, duration = 60, className }: { children: ReactNode; duration?: number; className?: string }) {
  return (
    <div className={cn("marquee overflow-hidden", className)}>
      <div className="marquee-track flex w-max" style={{ "--marquee-duration": `${duration}s` } as CSSProperties}>
        <div className="flex shrink-0">{children}</div>
        <div className="flex shrink-0" aria-hidden inert>
          {children}
        </div>
      </div>
    </div>
  );
}
