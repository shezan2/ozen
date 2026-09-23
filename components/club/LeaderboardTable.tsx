import type { Player, LeaderboardKey } from "@/lib/data";
import { POSITION_SHORT } from "@/lib/data";
import PlayerAvatar from "./PlayerAvatar";
import { cn } from "@/lib/utils";

export default function LeaderboardTable({ players, statKey }: { players: Player[]; statKey: LeaderboardKey }) {
  return (
    <div className="border-2 border-noir bg-white">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="bg-noir text-left text-xs font-bold uppercase tracking-[0.08em] text-paper-ink">
            <th className="w-14 py-3 pl-5">#</th>
            <th className="py-3">Player</th>
            <th className="hidden py-3 sm:table-cell">Position</th>
            <th className="tabular py-3 text-center">App</th>
            <th className={cn("tabular py-3 text-center", statKey === "goals" && "text-blue-bright")}>Gls</th>
            <th className={cn("tabular py-3 text-center", statKey === "assists" && "text-blue-bright")}>Ast</th>
            <th className="tabular py-3 pr-5 text-center">G+A</th>
          </tr>
        </thead>
        <tbody>
          {players.map((p, i) => (
            <tr key={p.id} className="border-b border-line last:border-0 hover:bg-paper">
              <td className="py-3 pl-5 font-display text-base text-ink-faint">{i + 1}</td>
              <td className="py-3">
                <div className="flex items-center gap-3">
                  <PlayerAvatar name={p.name} size={32} />
                  <span className="font-bold uppercase text-ink">{p.name}</span>
                </div>
              </td>
              <td className="hidden py-3 text-ink-dim sm:table-cell">{POSITION_SHORT[p.position]}</td>
              <td className="tabular py-3 text-center text-ink-dim">{p.appearances}</td>
              <td
                className={cn(
                  "tabular py-3 text-center font-bold",
                  statKey === "goals" ? "text-blue-deep" : "text-ink"
                )}
              >
                {p.goals}
              </td>
              <td
                className={cn(
                  "tabular py-3 text-center font-bold",
                  statKey === "assists" ? "text-blue-deep" : "text-ink"
                )}
              >
                {p.assists}
              </td>
              <td className="tabular py-3 pr-5 text-center font-bold text-ink">{p.goals + p.assists}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
