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
              "flex flex-col items-center gap-4 rounded-2xl p-5 text-center sm:p-7",
              isFirst
                ? "bg-blue shadow-[0_20px_45px_-15px_rgba(34,70,160,0.55)] sm:-translate-y-5"
                : "bg-white shadow-sm ring-1 ring-black/5"
            )}
          >
            <span
              className={cn(
                "flex size-9 items-center justify-center rounded-full text-base font-semibold",
                isFirst ? "bg-white/15 text-white" : "bg-surface text-ink-dim"
              )}
            >
              {rank}
            </span>
            <PlayerAvatar name={player.name} size={isFirst ? 76 : 60} />
            <div className="flex flex-col gap-0.5">
              <span className={cn("text-sm font-semibold tracking-tight sm:text-base", isFirst ? "text-white" : "text-ink")}>
                {player.name}
              </span>
              <span className={cn("text-xs font-medium", isFirst ? "text-white/75" : "text-blue-deep")}>
                {POSITION_SHORT[player.position]}
              </span>
            </div>
            <div className="flex flex-col">
              <span className={cn("font-semibold tracking-tight", isFirst ? "text-5xl text-white" : "text-3xl text-ink")}>
                {valueOf(player, statKey)}
              </span>
              <span className={cn("text-xs font-medium", isFirst ? "text-white/70" : "text-ink-faint")}>
                {VALUE_LABEL[statKey]}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
