/** Pure date/slot helpers for the booking calendar — no React, unit-testable. */

export interface DayCell {
  date: Date;
  inMonth: boolean;
  disabled: boolean;
}

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

/**
 * 42-cell month grid (6 weeks, Monday-first).
 * Past days and weekends are disabled; today counts as bookable.
 */
export function getMonthGrid(year: number, month: number): DayCell[] {
  const today = startOfDay(new Date());
  const first = new Date(year, month, 1);
  // Monday-first offset: getDay() is 0=Sun..6=Sat.
  const offset = (first.getDay() + 6) % 7;
  const cells: DayCell[] = [];
  for (let i = 0; i < 42; i++) {
    const date = new Date(year, month, 1 - offset + i);
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
    const isPast = date < today;
    cells.push({
      date,
      inMonth: date.getMonth() === month,
      disabled: isPast || isWeekend,
    });
  }
  return cells;
}

/** 30-minute slots, 09:00–16:30 local time. */
export function getSlots(): string[] {
  const slots: string[] = [];
  for (let h = 9; h < 17; h++) {
    slots.push(`${String(h).padStart(2, "0")}:00`);
    slots.push(`${String(h).padStart(2, "0")}:30`);
  }
  return slots;
}

export function formatDateLong(date: Date): string {
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function formatMonthTitle(year: number, month: number): string {
  return new Date(year, month, 1).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
}

/** ISO date (YYYY-MM-DD) in local time, for form payloads. */
export function toIsoDate(date: Date): string {
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${m}-${d}`;
}

/** Booking window: current month through +2 months. */
export function canGoPrev(year: number, month: number): boolean {
  const now = new Date();
  return year * 12 + month > now.getFullYear() * 12 + now.getMonth();
}

export function canGoNext(year: number, month: number): boolean {
  const now = new Date();
  return year * 12 + month < now.getFullYear() * 12 + now.getMonth() + 2;
}
