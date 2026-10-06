"use client";

import { useRef, type ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

/** Horizontally scrolling row with step buttons, as club sites use for fixtures and squad strips. */
export default function Rail({ label, children, className }: { label: string; children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  const step = (dir: 1 | -1) => {
    const el = ref.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: "smooth" });
  };

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      <div ref={ref} role="region" aria-label={label} tabIndex={0} className="rail gap-3 pb-3">
        {children}
      </div>
      <div className="hidden justify-end gap-2 sm:flex">
        <button
          onClick={() => step(-1)}
          aria-label={`Scroll ${label} back`}
          className="inline-flex size-10 items-center justify-center border border-line-strong text-silver transition-colors hover:border-chalk hover:text-chalk"
        >
          <ChevronLeft className="size-5" />
        </button>
        <button
          onClick={() => step(1)}
          aria-label={`Scroll ${label} forward`}
          className="inline-flex size-10 items-center justify-center border border-line-strong text-silver transition-colors hover:border-chalk hover:text-chalk"
        >
          <ChevronRight className="size-5" />
        </button>
      </div>
    </div>
  );
}
