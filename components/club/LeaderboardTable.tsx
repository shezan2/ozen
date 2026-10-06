import type { Player, LeaderboardKey } from "@/lib/data";
import { POSITION_SHORT } from "@/lib/data";
import { cn } from "@/lib/utils";

export default function LeaderboardTable({ players, statKey }: { players: Player[]; statKey: LeaderboardKey }) {
  return (
    <div className="border-t border-line">
      <div className="flex gap-4 border-b border-line py-2 text-xs font-medium text-ink-faint">
        <span className="w-7 shrink-0">#</span>
        <span className="flex-1">Player</span>
        <span className="hidden w-14 shrink-0 text-right sm:block">Position</span>
        <span className="tabular w-10 shrink-0 text-right">App</span>
        <span className={cn("tabular w-10 shrink-0 text-right", statKey === "goals" && "text-navy")}>Gls</span>
        <span className={cn("tabular w-10 shrink-0 text-right", statKey === "assists" && "text-navy")}>Ast</span>
        <span className="tabular w-10 shrink-0 text-right">G+A</span>
      </div>
      {players.map((p, i) => {
        const first = i === 0;
        return (
          <div
            key={p.id}
            className={cn(
              "flex items-center gap-4 border-b border-line py-3 last:border-0",
              first && "border-l-2 border-l-brass pl-3"
            )}
          >
            <span className={cn("tabular w-7 shrink-0 text-sm", first ? "font-semibold text-brass-deep" : "text-ink-faint")}>
              {i + 1}
            </span>
            <div className="flex min-w-0 flex-1 flex-col gap-0.5 sm:flex-row sm:items-baseline sm:gap-2.5">
              <span className={cn("truncate font-serif text-base", first ? "font-semibold text-ink" : "font-medium text-ink")}>
                {p.name}
              </span>
              <span className="text-xs text-ink-faint sm:hidden">{POSITION_SHORT[p.position]}</span>
            </div>
            <span className="hidden w-14 shrink-0 text-right text-sm text-ink-dim sm:block">{POSITION_SHORT[p.position]}</span>
            <span className="tabular w-10 shrink-0 text-right text-sm text-ink-dim">{p.appearances}</span>
            <span className={cn("tabular w-10 shrink-0 text-right text-sm", statKey === "goals" ? "font-semibold text-navy" : "text-ink-dim")}>
              {p.goals}
            </span>
            <span className={cn("tabular w-10 shrink-0 text-right text-sm", statKey === "assists" ? "font-semibold text-navy" : "text-ink-dim")}>
              {p.assists}
            </span>
            <span className="tabular w-10 shrink-0 text-right text-sm font-medium text-ink">{p.goals + p.assists}</span>
          </div>
        );
      })}
    </div>
  );
}
