"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  canGoNext,
  canGoPrev,
  formatMonthTitle,
  getMonthGrid,
  isSameDay,
} from "@/lib/booking";

const WEEKDAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

interface CalendarProps {
  year: number;
  month: number;
  onMonthChange: (year: number, month: number) => void;
  selected: Date | null;
  onSelect: (date: Date) => void;
}

export default function Calendar({ year, month, onMonthChange, selected, onSelect }: CalendarProps) {
  const reduced = useReducedMotion();
  const cells = getMonthGrid(year, month);
  const prevOk = canGoPrev(year, month);
  const nextOk = canGoNext(year, month);

  const move = (delta: number) => {
    const d = new Date(year, month + delta, 1);
    onMonthChange(d.getFullYear(), d.getMonth());
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <h3 className="font-display text-xl font-medium tracking-tight text-ink">
          {formatMonthTitle(year, month)}
        </h3>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => move(-1)}
            disabled={!prevOk}
            aria-label="Previous month"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-line text-ink-dim transition-colors hover:border-iris/50 hover:text-ink disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:border-line disabled:hover:text-ink-dim"
          >
            <svg viewBox="0 0 16 16" fill="none" className="h-3.5 w-3.5">
              <path d="M10 3 5 8l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => move(1)}
            disabled={!nextOk}
            aria-label="Next month"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-line text-ink-dim transition-colors hover:border-iris/50 hover:text-ink disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:border-line disabled:hover:text-ink-dim"
          >
            <svg viewBox="0 0 16 16" fill="none" className="h-3.5 w-3.5">
              <path d="m6 3 5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-7 gap-1 text-center">
        {WEEKDAYS.map((d) => (
          <span key={d} className="pb-2 font-mono text-[0.6rem] uppercase tracking-[0.2em] text-ink-faint">
            {d}
          </span>
        ))}
      </div>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={`${year}-${month}`}
          initial={reduced ? false : { opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          exit={reduced ? undefined : { opacity: 0, x: -12 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="grid grid-cols-7 gap-1"
        >
          {cells.map((cell) => {
            const isSelected = selected !== null && isSameDay(cell.date, selected);
            return (
              <button
                key={cell.date.toISOString()}
                type="button"
                disabled={cell.disabled || !cell.inMonth}
                onClick={() => onSelect(cell.date)}
                aria-label={cell.date.toDateString()}
                aria-pressed={isSelected}
                className={`relative flex aspect-square items-center justify-center rounded-lg font-mono text-sm transition-colors ${
                  !cell.inMonth
                    ? "invisible"
                    : cell.disabled
                      ? "cursor-not-allowed text-ink-faint/50"
                      : isSelected
                        ? "text-canvas"
                        : "text-ink-dim hover:border-iris/40 hover:text-ink border border-transparent hover:border"
                }`}
              >
                {isSelected && (
                  <motion.span
                    layoutId="selected-day"
                    transition={{ duration: reduced ? 0 : 0.35, ease: [0.22, 1, 0.36, 1] }}
                    className="absolute inset-0 rounded-lg bg-iris"
                    aria-hidden
                  />
                )}
                <span className="relative z-10">{cell.date.getDate()}</span>
              </button>
            );
          })}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
