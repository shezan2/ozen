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
    <div
      role="tablist"
      className={cn("inline-flex flex-wrap items-stretch gap-0.5 rounded-full bg-surface p-1", className)}
    >
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(opt.value)}
            className="relative rounded-full px-4 py-1.5 text-[13px] font-medium transition-colors"
          >
            {active && (
              <motion.span
                layoutId={layoutId}
                className="absolute inset-0 rounded-full bg-white shadow-[0_1px_4px_rgba(0,0,0,0.12)]"
                transition={{ type: "spring", stiffness: 500, damping: 38 }}
              />
            )}
            <span className={cn("relative z-10 flex items-center gap-1.5", active ? "text-ink" : "text-ink-dim hover:text-ink")}>
              {opt.label}
              {typeof opt.count === "number" && <span className="tabular text-ink-faint">{opt.count}</span>}
            </span>
          </button>
        );
      })}
    </div>
  );
}
