import { cn } from "@/lib/utils";
import type { Match } from "@/lib/data";

const LABEL: Record<Match["result"], string> = {
  W: "Win",
  D: "Draw",
  L: "Loss",
  Upcoming: "Upcoming",
};

const TONE: Record<Match["result"], string> = {
  W: "bg-win text-noir",
  D: "bg-draw text-noir",
  L: "bg-loss text-noir",
  Upcoming: "bg-navy-2 text-silver",
};

/** Solid W / D / L disc; the letter carries the meaning, the colour reinforces it. */
export function ResultChip({ result, className }: { result: Match["result"]; className?: string }) {
  return (
    <span
      title={LABEL[result]}
      aria-label={LABEL[result]}
      className={cn(
        "inline-flex size-7 shrink-0 items-center justify-center rounded-full text-[11px] font-bold",
        TONE[result],
        className
      )}
    >
      {result === "Upcoming" ? "–" : result}
    </span>
  );
}
