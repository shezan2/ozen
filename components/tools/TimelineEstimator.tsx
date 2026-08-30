"use client";

import { useId, useMemo, useState } from "react";
import { estimateTimeline } from "@/lib/calculators";
import { disclaimers } from "@/lib/content";
import { siteConfig, whatsAppLink } from "@/lib/site-config";
import { buttonStyles } from "@/components/ui/Button";

const SESSION_OPTIONS = [1, 2, 3, 4, 5];

export default function TimelineEstimator() {
  const ids = useId();
  const [current, setCurrent] = useState("88");
  const [goal, setGoal] = useState("80");
  const [sessions, setSessions] = useState(3);

  const result = useMemo(
    () =>
      estimateTimeline({
        currentKg: Number.parseFloat(current),
        goalKg: Number.parseFloat(goal),
        sessionsPerWeek: sessions,
      }),
    [current, goal, sessions],
  );

  return (
    <div className="on-ink overflow-hidden rounded-3xl bg-ink text-white">
      <div className="grid lg:grid-cols-2">
        {/* ---------------------------------------------------------- inputs */}
        <div className="border-b border-line-dark p-7 sm:p-10 lg:border-r lg:border-b-0">
          <p className="eyebrow text-lime">Realistic timeline</p>
          <h3 className="display mt-4 text-[clamp(1.75rem,1.3rem+1.8vw,2.5rem)]">
            How long does 5–10kg actually take?
          </h3>
          <p className="mt-4 text-sm leading-relaxed text-white/65">
            At a rate you can hold — roughly half a percent to one percent of bodyweight a week,
            with the faster end only realistic if the training is actually there.
          </p>

          <div className="mt-8 grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor={`${ids}-current`} className="block text-sm font-medium text-white/80">
                Weight now
              </label>
              <div className="mt-2 flex items-center rounded-xl border border-white/20 bg-white/6 focus-within:border-lime">
                <input
                  id={`${ids}-current`}
                  type="number"
                  inputMode="decimal"
                  min={40}
                  max={250}
                  step={0.5}
                  value={current}
                  onChange={(e) => setCurrent(e.target.value)}
                  className="h-12 w-full bg-transparent px-4 text-lg font-semibold text-white outline-none"
                />
                <span className="pr-4 text-sm text-white/50">kg</span>
              </div>
            </div>

            <div>
              <label htmlFor={`${ids}-goal`} className="block text-sm font-medium text-white/80">
                Weight you want
              </label>
              <div className="mt-2 flex items-center rounded-xl border border-white/20 bg-white/6 focus-within:border-lime">
                <input
                  id={`${ids}-goal`}
                  type="number"
                  inputMode="decimal"
                  min={35}
                  max={250}
                  step={0.5}
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  className="h-12 w-full bg-transparent px-4 text-lg font-semibold text-white outline-none"
                />
                <span className="pr-4 text-sm text-white/50">kg</span>
              </div>
            </div>
          </div>

          <fieldset className="mt-6">
            <legend className="text-sm font-medium text-white/80">
              Training sessions you can genuinely commit to each week
            </legend>
            <div className="mt-3 flex flex-wrap gap-2">
              {SESSION_OPTIONS.map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setSessions(n)}
                  aria-pressed={sessions === n}
                  className={
                    sessions === n
                      ? "h-11 min-w-11 rounded-full bg-lime px-4 text-sm font-bold text-ink"
                      : "h-11 min-w-11 rounded-full border border-white/25 px-4 text-sm font-semibold text-white/75 hover:border-white/50"
                  }
                >
                  {n}
                </button>
              ))}
            </div>
          </fieldset>
        </div>

        {/* --------------------------------------------------------- results */}
        <div className="flex flex-col justify-between p-7 sm:p-10">
          <div aria-live="polite">
            {result.kind === "estimate" ? (
              <>
                <p className="eyebrow text-white/60">Estimated range</p>
                <p className="display mt-4 text-[clamp(2.5rem,1.6rem+4vw,4.25rem)] text-lime">
                  {result.weeksFast}–{result.weeksSlow}
                  <span className="ml-3 align-baseline text-[0.28em] font-semibold tracking-[0.16em] text-white uppercase">
                    weeks
                  </span>
                </p>
                <p className="mt-3 text-lg text-white/80">
                  Roughly {result.monthsFast} to {result.monthsSlow} months to lose{" "}
                  <strong className="font-semibold text-white">{result.kgToLose}kg</strong>, at{" "}
                  {result.weeklyLossSlowKg}–{result.weeklyLossFastKg}kg a week on{" "}
                  {result.sessionsPerWeek} session{result.sessionsPerWeek === 1 ? "" : "s"} a week.
                </p>
                <p className="mt-5 border-l-2 border-lime pl-4 text-sm leading-relaxed text-white/65">
                  This is a range, not a promise. The wide end is what happens when a work trip, a
                  sick kid or a bad month lands in the middle — which it will. Planning for the
                  slower number is how people finish.
                </p>
              </>
            ) : (
              <>
                <p className="eyebrow text-white/60">
                  {result.kind === "invalid" ? "Check the numbers" : "Worth a conversation"}
                </p>
                <p className="mt-4 text-lg leading-relaxed text-white/80">{result.message}</p>
              </>
            )}
          </div>

          <div className="mt-8">
            <p className="text-xs leading-relaxed text-white/60">{disclaimers.calculator}</p>
            <a
              href={whatsAppLink()}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonStyles("lime", "lg", "mt-5 w-full sm:w-auto")}
            >
              Message {siteConfig.contact.whatsappKeyword} and talk it through
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
