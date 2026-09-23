"use client";

import { motion } from "motion/react";
import { cn } from "@/lib/utils";

export interface SegmentedOption<T extends string> {
  value: T;
  label: string;
  count?: number;
}

interface SegmentedControlProps<T extends string> {
  options: SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
  layoutId: string;
  className?: string;
}

export default function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  layoutId,
  className,
}: SegmentedControlProps<T>) {
  return (
    <div role="tablist" className={cn("inline-flex flex-wrap items-stretch border-2 border-noir", className)}>
      {options.map((opt, i) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(opt.value)}
            className={cn(
              "relative px-4 py-2 text-sm font-bold uppercase tracking-wide transition-colors",
              i > 0 && "border-l-2 border-noir",
              active ? "text-paper-ink" : "text-ink-dim hover:text-ink"
            )}
          >
            {active && (
              <motion.span
                layoutId={layoutId}
                className="absolute inset-0 bg-blue"
                transition={{ type: "spring", stiffness: 500, damping: 38 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-1.5">
              {opt.label}
              {typeof opt.count === "number" && <span className="tabular">({opt.count})</span>}
            </span>
          </button>
        );
      })}
    </div>
  );
}
