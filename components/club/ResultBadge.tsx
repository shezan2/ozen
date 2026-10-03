import { cn } from "@/lib/utils";
import type { Match } from "@/lib/data";

const LABEL: Record<Match["result"], string> = {
  W: "Win",
  D: "Draw",
  L: "Loss",
  Upcoming: "Upcoming",
};

const CHIP_COLOR: Record<Match["result"], string> = {
  W: "bg-win/10 text-win",
  D: "bg-draw/10 text-draw",
  L: "bg-loss/10 text-loss",
  Upcoming: "bg-blue/10 text-blue-deep",
};

interface ResultBadgeProps {
  result: Match["result"];
  className?: string;
}

export function ResultBadge({ result, className }: ResultBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold",
        CHIP_COLOR[result],
        className
      )}
    >
      {LABEL[result]}
    </span>
  );
}

const DOT_COLOR: Record<Match["result"], string> = {
  W: "bg-win text-white",
  D: "bg-draw text-white",
  L: "bg-loss text-white",
  Upcoming: "bg-blue text-white",
};

export function ResultDot({ result, className }: ResultBadgeProps) {
  return (
    <span
      title={LABEL[result]}
      className={cn(
        "inline-flex size-6 items-center justify-center rounded-full text-[0.7rem] font-semibold",
        DOT_COLOR[result],
        className
      )}
    >
      {result === "Upcoming" ? "•" : result}
    </span>
  );
}
