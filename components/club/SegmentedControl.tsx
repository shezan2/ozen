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
    <div role="tablist" className={cn("flex flex-wrap items-stretch gap-x-6 gap-y-1 border-b border-line", className)}>
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(opt.value)}
            className="relative py-2.5 text-sm"
          >
            <span className={active ? "font-medium text-ink" : "text-ink-faint hover:text-ink-dim"}>
              {opt.label}
              {typeof opt.count === "number" && <span className="tabular"> {opt.count}</span>}
            </span>
            {active && (
              <motion.span
                layoutId={layoutId}
                className="absolute inset-x-0 -bottom-px h-[1.5px] bg-navy"
                transition={{ type: "spring", stiffness: 500, damping: 38 }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
