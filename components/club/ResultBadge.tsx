import { cn } from "@/lib/utils";
import type { Match } from "@/lib/data";

const LABEL: Record<Match["result"], string> = {
  W: "Win",
  D: "Draw",
  L: "Loss",
  Upcoming: "Upcoming",
};

const INK: Record<Match["result"], string> = {
  W: "var(--win)",
  D: "var(--draw)",
  L: "var(--loss)",
  Upcoming: "var(--navy)",
};

interface ResultStampProps {
  result: Match["result"];
  className?: string;
}

/** The site's one signature device — a rotated ink stamp, used only for match results. */
export function ResultStamp({ result, className }: ResultStampProps) {
  return (
    <span className={cn("stamp", className)} style={{ color: INK[result] }}>
      {LABEL[result]}
    </span>
  );
}

export function ResultDot({ result, className }: ResultStampProps) {
  return (
    <span
      title={LABEL[result]}
      className={cn("inline-flex size-6 items-center justify-center rounded-full text-[0.68rem] font-semibold text-paper-ink", className)}
      style={{ background: INK[result] }}
    >
      {result === "Upcoming" ? "•" : result}
    </span>
  );
}
