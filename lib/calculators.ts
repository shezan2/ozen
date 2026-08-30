/**
 * Pure calculation helpers for the two on-site tools.
 *
 * Both are deliberately conservative. They return ranges and estimates, never
 * promises, and neither is medical advice — see `disclaimers` in lib/content.ts
 * for the copy rendered alongside them.
 */

/* ------------------------------------------------------ timeline estimator */

export type TimelineInput = {
  currentKg: number;
  goalKg: number;
  sessionsPerWeek: number;
};

export type TimelineResult =
  | { kind: "invalid"; message: string }
  | { kind: "recomposition"; message: string }
  | { kind: "referral"; message: string }
  | {
      kind: "estimate";
      kgToLose: number;
      weeksFast: number;
      weeksSlow: number;
      monthsFast: number;
      monthsSlow: number;
      weeklyLossFastKg: number;
      weeklyLossSlowKg: number;
      sessionsPerWeek: number;
    };

/** The slow end of a sustainable rate: 0.5% of bodyweight a week. */
const SLOW_RATE = 0.005;

/**
 * The fast end is capped by how much training a week is actually available.
 * More sessions support a slightly faster rate while holding onto muscle;
 * one session a week does not.
 */
function fastRateFor(sessionsPerWeek: number): number {
  if (sessionsPerWeek <= 1) return 0.006;
  if (sessionsPerWeek === 2) return 0.0075;
  if (sessionsPerWeek === 3) return 0.009;
  return 0.01;
}

const WEEKS_PER_MONTH = 4.345;

export function estimateTimeline({
  currentKg,
  goalKg,
  sessionsPerWeek,
}: TimelineInput): TimelineResult {
  if (!Number.isFinite(currentKg) || !Number.isFinite(goalKg)) {
    return { kind: "invalid", message: "Enter both weights to see an estimate." };
  }
  if (currentKg < 40 || currentKg > 250 || goalKg < 35 || goalKg > 250) {
    return {
      kind: "invalid",
      message: "Enter a weight in kilograms between 40 and 250.",
    };
  }
  if (!Number.isFinite(sessionsPerWeek) || sessionsPerWeek < 1 || sessionsPerWeek > 5) {
    return { kind: "invalid", message: "Choose between 1 and 5 sessions a week." };
  }

  const kgToLose = currentKg - goalKg;

  if (kgToLose <= 0.5) {
    return {
      kind: "recomposition",
      message:
        "At that goal you are not really chasing the scale — you are chasing a change in shape at roughly the same weight. That is body recomposition, and it is the most under-sold result there is: one client went 83kg to 82kg in 1.5 months and looks like a different person. Worth a conversation rather than a number.",
    };
  }

  if (kgToLose > currentKg * 0.3) {
    return {
      kind: "referral",
      message:
        "That is a bigger change than a calculator should put a timeline on. It is genuinely achievable for plenty of people, but the plan matters far more than the arithmetic — start with your doctor, then let's talk.",
    };
  }

  // Rate is applied to the average bodyweight across the journey rather than
  // the starting weight, so long runs are not over-estimated.
  const averageKg = (currentKg + goalKg) / 2;
  const fastRate = fastRateFor(sessionsPerWeek);

  const weeklyLossFastKg = averageKg * fastRate;
  const weeklyLossSlowKg = averageKg * SLOW_RATE;

  const weeksFast = Math.ceil(kgToLose / weeklyLossFastKg);
  const weeksSlow = Math.ceil(kgToLose / weeklyLossSlowKg);

  return {
    kind: "estimate",
    kgToLose: round(kgToLose, 1),
    weeksFast,
    weeksSlow,
    monthsFast: round(weeksFast / WEEKS_PER_MONTH, 1),
    monthsSlow: round(weeksSlow / WEEKS_PER_MONTH, 1),
    weeklyLossFastKg: round(weeklyLossFastKg, 2),
    weeklyLossSlowKg: round(weeklyLossSlowKg, 2),
    sessionsPerWeek,
  };
}

/* ------------------------------------------------- calories and macros ---- */

export type Sex = "male" | "female";
export type ActivityLevel = "sedentary" | "light" | "moderate" | "very";
export type MacroGoal = "lose" | "maintain" | "build";

export type MacroInput = {
  sex: Sex;
  age: number;
  heightCm: number;
  weightKg: number;
  activity: ActivityLevel;
  goal: MacroGoal;
};

export type MacroResult =
  | { kind: "invalid"; message: string }
  | {
      kind: "estimate";
      bmr: number;
      tdee: number;
      calories: number;
      proteinG: number;
      fatG: number;
      carbsG: number;
      floored: boolean;
    };

export const activityLevels: { value: ActivityLevel; label: string; hint: string; factor: number }[] = [
  { value: "sedentary", label: "Desk-bound", hint: "Office job, little walking", factor: 1.2 },
  { value: "light", label: "Lightly active", hint: "Some walking most days", factor: 1.375 },
  { value: "moderate", label: "Moderately active", hint: "On your feet a fair bit", factor: 1.55 },
  { value: "very", label: "Very active", hint: "Physical job or a lot of walking", factor: 1.725 },
];

export const macroGoals: { value: MacroGoal; label: string }[] = [
  { value: "lose", label: "Lose fat" },
  { value: "maintain", label: "Hold steady" },
  { value: "build", label: "Build muscle" },
];

/** Conservative floors. Below these, it is a conversation, not a calculator. */
const CALORIE_FLOOR: Record<Sex, number> = { male: 1500, female: 1200 };

export function calculateMacros({
  sex,
  age,
  heightCm,
  weightKg,
  activity,
  goal,
}: MacroInput): MacroResult {
  if (!Number.isFinite(age) || age < 16 || age > 90) {
    return { kind: "invalid", message: "Enter an age between 16 and 90." };
  }
  if (!Number.isFinite(heightCm) || heightCm < 120 || heightCm > 230) {
    return { kind: "invalid", message: "Enter a height in centimetres between 120 and 230." };
  }
  if (!Number.isFinite(weightKg) || weightKg < 35 || weightKg > 250) {
    return { kind: "invalid", message: "Enter a weight in kilograms between 35 and 250." };
  }

  // Mifflin–St Jeor
  const bmr =
    10 * weightKg + 6.25 * heightCm - 5 * age + (sex === "male" ? 5 : -161);

  const factor = activityLevels.find((a) => a.value === activity)?.factor ?? 1.2;
  const tdee = bmr * factor;

  const goalMultiplier = goal === "lose" ? 0.8 : goal === "build" ? 1.1 : 1;
  const rawCalories = tdee * goalMultiplier;

  const floor = CALORIE_FLOOR[sex];
  const floored = rawCalories < floor;
  const calories = Math.round(floored ? floor : rawCalories);

  const proteinPerKg = goal === "lose" ? 2.0 : 1.8;
  const proteinG = Math.round(proteinPerKg * weightKg);
  const fatG = Math.round((calories * 0.25) / 9);
  const carbsG = Math.max(0, Math.round((calories - proteinG * 4 - fatG * 9) / 4));

  return {
    kind: "estimate",
    bmr: Math.round(bmr),
    tdee: Math.round(tdee),
    calories,
    proteinG,
    fatG,
    carbsG,
    floored,
  };
}

function round(value: number, dp: number): number {
  const factor = 10 ** dp;
  return Math.round(value * factor) / factor;
}
