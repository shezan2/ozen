import { cn } from "@/lib/utils";
import type { Match } from "@/lib/data";

const LABEL: Record<Match["result"], string> = {
  W: "Win",
  D: "Draw",
  L: "Loss",
  Upcoming: "Upcoming",
};

const COLOR: Record<Match["result"], string> = {
  W: "bg-win text-white",
  D: "bg-draw text-white",
  L: "bg-loss text-white",
  Upcoming: "bg-blue text-paper-ink",
};

interface ResultBadgeProps {
  result: Match["result"];
  className?: string;
}

export function ResultBadge({ result, className }: ResultBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-1 text-xs font-bold uppercase tracking-wide",
        COLOR[result],
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
  Upcoming: "bg-blue text-paper-ink",
};

export function ResultDot({ result, className }: ResultBadgeProps) {
  return (
    <span
      title={LABEL[result]}
      className={cn(
        "inline-flex size-6 items-center justify-center rounded-full text-[0.7rem] font-bold",
        DOT_COLOR[result],
        className
      )}
    >
      {result === "Upcoming" ? "•" : result}
    </span>
  );
}
