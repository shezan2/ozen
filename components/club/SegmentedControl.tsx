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
    <div className={cn("max-w-full", className)}>
      <div
        role="tablist"
        className="flex w-max max-w-full gap-1 overflow-x-auto rounded-full bg-navy p-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {options.map((opt) => {
          const active = opt.value === value;
          return (
            <button
              key={opt.value}
              role="tab"
              aria-selected={active}
              onClick={() => onChange(opt.value)}
              className="relative shrink-0 rounded-full px-4 py-2.5 text-[15px] font-semibold whitespace-nowrap sm:px-5"
            >
              {active && (
                <motion.span
                  layoutId={layoutId}
                  className="absolute inset-0 rounded-full bg-white"
                  transition={{ type: "spring", stiffness: 500, damping: 40 }}
                />
              )}
              <span className={cn("relative transition-colors duration-200", active ? "text-noir" : "text-silver hover:text-white")}>
                {opt.label}
                {typeof opt.count === "number" && (
                  <span className={cn("tabular ml-2", active ? "text-noir/55" : "text-mist")}>{opt.count}</span>
                )}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
