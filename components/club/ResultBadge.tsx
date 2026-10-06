import { cn } from "@/lib/utils";
import type { Match } from "@/lib/data";

const LABEL: Record<Match["result"], string> = {
  W: "Win",
  D: "Draw",
  L: "Loss",
  Upcoming: "Upcoming",
};

const BG: Record<Match["result"], string> = {
  W: "bg-win",
  D: "bg-draw",
  L: "bg-loss",
  Upcoming: "bg-field-3",
};

interface ResultProps {
  result: Match["result"];
  className?: string;
}

/** Square result tile with the W / D / L letter — the standard pro fixtures marker. */
export function ResultChip({ result, className }: ResultProps) {
  return (
    <span
      title={LABEL[result]}
      aria-label={LABEL[result]}
      className={cn(
        "type-name inline-flex size-7 shrink-0 items-center justify-center text-sm text-field",
        BG[result],
        result === "Upcoming" && "text-chalk",
        className
      )}
    >
      {result === "Upcoming" ? "–" : result}
    </span>
  );
}
