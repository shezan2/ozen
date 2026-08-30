"use client";

import { useId, useMemo, useState } from "react";
import {
  activityLevels,
  calculateMacros,
  macroGoals,
  type ActivityLevel,
  type MacroGoal,
  type Sex,
} from "@/lib/calculators";
import { disclaimers } from "@/lib/content";

const fieldClass =
  "mt-2 h-12 w-full rounded-xl border border-line-strong bg-surface px-4 text-base font-medium text-ink outline-none focus:border-ink";

export default function MacroCalculator() {
  const ids = useId();
  const [sex, setSex] = useState<Sex>("male");
  const [age, setAge] = useState("38");
  const [height, setHeight] = useState("172");
  const [weight, setWeight] = useState("88");
  const [activity, setActivity] = useState<ActivityLevel>("sedentary");
  const [goal, setGoal] = useState<MacroGoal>("lose");

  const result = useMemo(
    () =>
      calculateMacros({
        sex,
        age: Number.parseFloat(age),
        heightCm: Number.parseFloat(height),
        weightKg: Number.parseFloat(weight),
        activity,
        goal,
      }),
    [sex, age, height, weight, activity, goal],
  );

  return (
    <div className="rounded-3xl border border-line bg-surface-off p-7 sm:p-10">
      <div className="grid gap-10 lg:grid-cols-[1fr_1fr]">
        <div>
          <p className="eyebrow text-lime-deep">Calories and macros</p>
          <h3 className="display mt-4 text-[clamp(1.75rem,1.3rem+1.8vw,2.5rem)]">
            A starting point, not a meal plan
          </h3>
          <p className="mt-4 text-sm leading-relaxed text-ink-mute">
            Mifflin–St Jeor for energy needs, then protein set against bodyweight and fat at a
            quarter of calories. Numbers to argue with, not numbers to obey.
          </p>

          <div className="mt-8 grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor={`${ids}-sex`} className="block text-sm font-medium text-ink">
                Sex
              </label>
              <select
                id={`${ids}-sex`}
                value={sex}
                onChange={(e) => setSex(e.target.value as Sex)}
                className={fieldClass}
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
              <p className="mt-1.5 text-xs text-ink-mute">
                The formula only has these two constants.
              </p>
            </div>

            <div>
              <label htmlFor={`${ids}-age`} className="block text-sm font-medium text-ink">
                Age
              </label>
              <input
                id={`${ids}-age`}
                type="number"
                inputMode="numeric"
                min={16}
                max={90}
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className={fieldClass}
              />
            </div>

            <div>
              <label htmlFor={`${ids}-height`} className="block text-sm font-medium text-ink">
                Height (cm)
              </label>
              <input
                id={`${ids}-height`}
                type="number"
                inputMode="numeric"
                min={120}
                max={230}
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                className={fieldClass}
              />
            </div>

            <div>
              <label htmlFor={`${ids}-weight`} className="block text-sm font-medium text-ink">
                Weight (kg)
              </label>
              <input
                id={`${ids}-weight`}
                type="number"
                inputMode="decimal"
                min={35}
                max={250}
                step={0.5}
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className={fieldClass}
              />
            </div>

            <div>
              <label htmlFor={`${ids}-activity`} className="block text-sm font-medium text-ink">
                Daily activity
              </label>
              <select
                id={`${ids}-activity`}
                value={activity}
                onChange={(e) => setActivity(e.target.value as ActivityLevel)}
                className={fieldClass}
              >
                {activityLevels.map((level) => (
                  <option key={level.value} value={level.value}>
                    {level.label} — {level.hint}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor={`${ids}-goal`} className="block text-sm font-medium text-ink">
                Goal
              </label>
              <select
                id={`${ids}-goal`}
                value={goal}
                onChange={(e) => setGoal(e.target.value as MacroGoal)}
                className={fieldClass}
              >
                {macroGoals.map((g) => (
                  <option key={g.value} value={g.value}>
                    {g.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="flex flex-col justify-between" aria-live="polite">
          {result.kind === "estimate" ? (
            <div>
              <div className="rounded-2xl bg-ink p-6 text-white sm:p-8">
                <p className="eyebrow text-lime">Daily target</p>
                <p className="display mt-3 text-[clamp(2.75rem,2rem+3vw,4rem)]">
                  {result.calories.toLocaleString()}
                  <span className="ml-2 text-[0.28em] font-semibold tracking-[0.16em] uppercase">
                    kcal
                  </span>
                </p>
                <p className="mt-2 text-sm text-white/60">
                  BMR {result.bmr.toLocaleString()} · maintenance about{" "}
                  {result.tdee.toLocaleString()} kcal
                </p>
              </div>

              <dl className="mt-4 grid grid-cols-3 gap-3">
                {[
                  { label: "Protein", value: result.proteinG },
                  { label: "Carbs", value: result.carbsG },
                  { label: "Fat", value: result.fatG },
                ].map((macro) => (
                  <div key={macro.label} className="rounded-2xl border border-line bg-surface p-4">
                    <dt className="text-xs font-semibold tracking-[0.12em] text-ink-mute uppercase">
                      {macro.label}
                    </dt>
                    <dd className="display mt-2 text-2xl text-ink">
                      {macro.value}
                      <span className="ml-0.5 text-sm font-semibold text-ink-mute">g</span>
                    </dd>
                  </div>
                ))}
              </dl>

              {result.floored ? (
                <p className="mt-4 rounded-xl border border-gold/50 bg-gold/10 p-4 text-sm leading-relaxed text-gold-deep">
                  Those inputs push the estimate below a sensible floor, so it has been held there.
                  Eating under that is a conversation for a doctor or dietitian, not a calculator.
                </p>
              ) : null}
            </div>
          ) : (
            <p className="rounded-2xl border border-line bg-surface p-6 text-base text-ink-mute">
              {result.message}
            </p>
          )}

          <p className="mt-6 text-xs leading-relaxed text-ink-mute">
            {disclaimers.calculator} {disclaimers.nutrition}
          </p>
        </div>
      </div>
    </div>
  );
}
