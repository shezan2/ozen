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
              "flex flex-col items-center gap-4 rounded-2xl border p-5 text-center sm:p-7",
              isFirst
                ? "border-gold/40 bg-gradient-to-b from-gold/10 to-white shadow-[0_16px_40px_rgba(169,129,47,0.16)] sm:-translate-y-5"
                : "border-line bg-white"
            )}
          >
            <span
              className={cn(
                "flex size-8 items-center justify-center rounded-full text-sm font-bold",
                isFirst ? "bg-gold text-noir" : "bg-paper text-ink-dim ring-1 ring-line"
              )}
            >
              {rank}
            </span>
            <PlayerAvatar name={player.name} size={isFirst ? 76 : 60} />
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-semibold tracking-tight text-ink sm:text-base">
                {player.name}
              </span>
              <span className="text-xs font-medium uppercase tracking-[0.08em] text-gold-deep">
                {POSITION_SHORT[player.position]}
              </span>
            </div>
            <div className="flex flex-col">
              <span className={cn("tabular font-bold text-ink", isFirst ? "text-4xl" : "text-2xl")}>
                {valueOf(player, statKey)}
              </span>
              <span className="text-xs text-ink-faint">{VALUE_LABEL[statKey]}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
