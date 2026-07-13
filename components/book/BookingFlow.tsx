"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Calendar from "./Calendar";
import TimeSlots from "./TimeSlots";
import BookingForm from "./BookingForm";
import BookingSuccess from "./BookingSuccess";
import OzenLogo from "@/components/brand/OzenLogo";
import { formatDateLong } from "@/lib/booking";

type Step = "date" | "form" | "sent";

export default function BookingFlow() {
  const reduced = useReducedMotion();
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [date, setDate] = useState<Date | null>(null);
  const [slot, setSlot] = useState<string | null>(null);
  const [step, setStep] = useState<Step>("date");
  const [bookedName, setBookedName] = useState("");

  const stepKey = step === "date" ? "date" : step === "form" ? "form" : "sent";

  return (
    <div className="grid gap-10 lg:grid-cols-12">
      {/* Sticky summary */}
      <aside className="lg:col-span-4">
        <div className="rounded-2xl border border-line bg-surface p-8 lg:sticky lg:top-24">
          <OzenLogo size={44} className="text-ink" />
          <h2 className="mt-6 font-display text-2xl font-medium tracking-tight text-ink">
            Intro call
          </h2>
          <ul className="mt-5 flex flex-col gap-3">
            <li className="flex items-center gap-3 text-sm text-ink-dim">
              <span className="h-1 w-1 rounded-full bg-iris" aria-hidden />
              30 minutes, free
            </li>
            <li className="flex items-center gap-3 text-sm text-ink-dim">
              <span className="h-1 w-1 rounded-full bg-iris" aria-hidden />
              Video call — link by email
            </li>
            <li className="flex items-center gap-3 text-sm text-ink-dim">
              <span className="h-1 w-1 rounded-full bg-iris" aria-hidden />
              No pressure, no jargon
            </li>
          </ul>

          <div className="hairline mt-7" aria-hidden />

          <dl className="mt-7 flex flex-col gap-4">
            <div>
              <dt className="font-mono text-[0.6rem] uppercase tracking-[0.25em] text-ink-faint">Date</dt>
              <dd className={`mt-1 text-sm ${date ? "text-ink" : "text-ink-faint"}`}>
                {date ? formatDateLong(date) : "Pick a day"}
              </dd>
            </div>
            <div>
              <dt className="font-mono text-[0.6rem] uppercase tracking-[0.25em] text-ink-faint">Time</dt>
              <dd className={`mt-1 text-sm ${slot ? "text-ink" : "text-ink-faint"}`}>
                {slot ?? "Pick a slot"}
              </dd>
            </div>
          </dl>
        </div>
      </aside>

      {/* Step panel */}
      <div className="lg:col-span-8">
        <div className="rounded-2xl border border-line bg-canvas-raised p-6 sm:p-10">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={stepKey}
              initial={reduced ? false : { opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={reduced ? undefined : { opacity: 0, x: -24 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            >
              {step === "date" && (
                <div>
                  <Calendar
                    year={year}
                    month={month}
                    onMonthChange={(y, m) => {
                      setYear(y);
                      setMonth(m);
                    }}
                    selected={date}
                    onSelect={(d) => {
                      setDate(d);
                      setSlot(null);
                    }}
                  />
                  {date && (
                    <TimeSlots
                      date={date}
                      selected={slot}
                      onSelect={(s) => {
                        setSlot(s);
                        setStep("form");
                      }}
                    />
                  )}
                </div>
              )}

              {step === "form" && date && slot && (
                <BookingForm
                  date={date}
                  slot={slot}
                  onBack={() => setStep("date")}
                  onDone={(name) => {
                    setBookedName(name);
                    setStep("sent");
                  }}
                />
              )}

              {step === "sent" && date && slot && (
                <BookingSuccess name={bookedName} date={date} slot={slot} />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
