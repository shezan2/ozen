"use client";

import { useEffect, useRef } from "react";
import { animate, stagger } from "animejs";
import { getSlots, toIsoDate } from "@/lib/booking";

interface TimeSlotsProps {
  date: Date;
  selected: string | null;
  onSelect: (slot: string) => void;
}

export default function TimeSlots({ date, selected, onSelect }: TimeSlotsProps) {
  const gridRef = useRef<HTMLDivElement>(null);
  const slots = getSlots();

  // anime.js stagger every time the chosen date changes.
  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    animate(grid.children, {
      opacity: [0, 1],
      translateY: [10, 0],
      duration: 380,
      delay: stagger(24),
      ease: "outQuart",
    });
  }, [date]);

  return (
    <div className="mt-8 border-t border-line pt-8">
      <p className="font-mono text-[0.65rem] uppercase tracking-[0.25em] text-ink-dim">
        Available times <span className="text-ink-faint">· {toIsoDate(date)}</span>
      </p>
      <div ref={gridRef} className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-4">
        {slots.map((slot) => {
          const isSelected = slot === selected;
          return (
            <button
              key={slot}
              type="button"
              onClick={() => onSelect(slot)}
              aria-pressed={isSelected}
              className={`rounded-lg border py-2.5 font-mono text-sm transition-colors ${
                isSelected
                  ? "border-iris bg-iris text-canvas"
                  : "border-line text-ink-dim hover:border-iris/50 hover:text-ink"
              }`}
            >
              {slot}
            </button>
          );
        })}
      </div>
    </div>
  );
}
