import { cn } from "@/lib/utils";
import type { Match } from "@/lib/data";

const LABEL: Record<Match["result"], string> = {
  W: "Win",
  D: "Draw",
  L: "Loss",
  Upcoming: "Upcoming",
};

const TONE: Record<Match["result"], string> = {
  W: "bg-win/15 text-win ring-win/35",
  D: "bg-draw/15 text-draw ring-draw/35",
  L: "bg-loss/15 text-loss ring-loss/35",
  Upcoming: "bg-white/5 text-silver ring-white/15",
};

/** Round W / D / L marker, tinted by result. */
export function ResultChip({ result, className }: { result: Match["result"]; className?: string }) {
  return (
    <span
      title={LABEL[result]}
      aria-label={LABEL[result]}
      className={cn(
        "inline-flex size-7 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold ring-1 ring-inset",
        TONE[result],
        className
      )}
    >
      {result === "Upcoming" ? "–" : result}
    </span>
  );
}
