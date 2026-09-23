import type { Player, LeaderboardKey } from "@/lib/data";
import { POSITION_SHORT } from "@/lib/data";
import PlayerAvatar from "./PlayerAvatar";
import { cn } from "@/lib/utils";

const VALUE_LABEL: Record<LeaderboardKey, string> = {
  goals: "Goals",
  assists: "Assists",
  appearances: "Appearances",
  involvements: "G+A",
};

function valueOf(p: Player, key: LeaderboardKey) {
  return key === "involvements" ? p.goals + p.assists : p[key];
}

const ORDER = [1, 0, 2]; // display order: 2nd, 1st, 3rd

export default function Podium({ players, statKey }: { players: Player[]; statKey: LeaderboardKey }) {
  const top3 = players.slice(0, 3);
  if (top3.length < 3) return null;

  return (
    <div className="grid grid-cols-3 items-end gap-3 sm:gap-6">
      {ORDER.map((idx) => {
        const player = top3[idx];
        const rank = idx + 1;
        const isFirst = rank === 1;
        return (
          <div
            key={player.id}
            className={cn(
              "flex flex-col items-center gap-4 border-2 p-5 text-center sm:p-7",
              isFirst ? "border-noir bg-blue shadow-[8px_8px_0_0_var(--noir)] sm:-translate-y-5" : "border-noir bg-white"
            )}
          >
            <span
              className={cn(
                "font-display flex size-9 items-center justify-center text-base",
                isFirst ? "bg-noir text-blue-bright" : "bg-paper text-ink-dim ring-2 ring-inset ring-noir/10"
              )}
            >
              {rank}
            </span>
            <PlayerAvatar name={player.name} size={isFirst ? 76 : 60} />
            <div className="flex flex-col gap-0.5">
              <span className={cn("text-sm font-bold uppercase tracking-tight sm:text-base", isFirst ? "text-paper-ink" : "text-ink")}>
                {player.name}
              </span>
              <span className={cn("text-xs font-bold uppercase tracking-[0.08em]", isFirst ? "text-blue-bright" : "text-blue-deep")}>
                {POSITION_SHORT[player.position]}
              </span>
            </div>
            <div className="flex flex-col">
              <span className={cn("font-display", isFirst ? "text-5xl text-paper-ink" : "text-3xl text-ink")}>
                {valueOf(player, statKey)}
              </span>
              <span className={cn("text-xs font-bold uppercase", isFirst ? "text-paper-ink/70" : "text-ink-faint")}>
                {VALUE_LABEL[statKey]}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
