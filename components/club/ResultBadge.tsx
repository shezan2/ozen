import { cn } from "@/lib/utils";
import type { Match } from "@/lib/data";

const LABEL: Record<Match["result"], string> = {
  W: "Win",
  D: "Draw",
  L: "Loss",
  Upcoming: "Upcoming",
};

const COLOR: Record<Match["result"], string> = {
  W: "bg-win/10 text-win ring-1 ring-inset ring-win/25",
  D: "bg-draw/10 text-draw ring-1 ring-inset ring-draw/25",
  L: "bg-loss/10 text-loss ring-1 ring-inset ring-loss/25",
  Upcoming: "bg-gold/10 text-gold-deep ring-1 ring-inset ring-gold/30",
};

interface ResultBadgeProps {
  result: Match["result"];
  className?: string;
}

export function ResultBadge({ result, className }: ResultBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
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
  Upcoming: "bg-gold text-noir",
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
