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
      className={cn(
        "inline-flex flex-wrap items-center gap-1 rounded-full border border-line bg-white/80 p-1 shadow-sm",
        className
      )}
    >
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(opt.value)}
            className={cn(
              "relative rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
              active ? "text-noir" : "text-ink-dim hover:text-ink"
            )}
          >
            {active && (
              <motion.span
                layoutId={layoutId}
                className="absolute inset-0 rounded-full bg-paper shadow-[0_1px_2px_rgba(0,0,0,0.08),0_1px_8px_rgba(0,0,0,0.06)] ring-1 ring-line"
                transition={{ type: "spring", stiffness: 500, damping: 38 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-1.5">
              {opt.label}
              {typeof opt.count === "number" && (
                <span
                  className={cn(
                    "rounded-full px-1.5 py-px text-[0.7rem] tabular",
                    active ? "bg-noir/8 text-ink-dim" : "bg-noir/5 text-ink-faint"
                  )}
                >
                  {opt.count}
                </span>
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
}
