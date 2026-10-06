import type { Player, LeaderboardKey } from "@/lib/data";
import { POSITION_SHORT } from "@/lib/data";
import { cn } from "@/lib/utils";

const COLUMNS: { key: LeaderboardKey; label: string; title: string }[] = [
  { key: "appearances", label: "App", title: "Appearances" },
  { key: "goals", label: "Gls", title: "Goals" },
  { key: "assists", label: "Ast", title: "Assists" },
  { key: "involvements", label: "G+A", title: "Goal involvements" },
];

function valueOf(p: Player, key: LeaderboardKey) {
  return key === "involvements" ? p.goals + p.assists : p[key];
}

export default function LeaderboardTable({ players, statKey }: { players: Player[]; statKey: LeaderboardKey }) {
  return (
    <div className="overflow-x-auto bg-field-2">
      <table className="w-full min-w-[22rem] border-collapse text-left">
        <thead>
          <tr className="border-b border-line text-xs text-silver-dim">
            <th scope="col" className="w-12 py-3 pl-4 font-normal sm:pl-6">
              #
            </th>
            <th scope="col" className="py-3 font-normal">
              Player
            </th>
            <th scope="col" className="hidden py-3 font-normal sm:table-cell">
              Position
            </th>
            {COLUMNS.map((c) => (
              <th
                key={c.key}
                scope="col"
                className={cn("w-14 py-3 text-center font-normal last:pr-4 sm:last:pr-6", c.key === statKey && "text-chalk")}
              >
                <abbr title={c.title} className="no-underline">
                  {c.label}
                </abbr>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {players.map((p, i) => (
            <tr key={p.id} className="border-b border-line last:border-0">
              <td className={cn("type-name tabular py-3.5 pl-4 text-base sm:pl-6", i === 0 ? "text-gold" : "text-silver-dim")}>
                {i + 1}
              </td>
              <th scope="row" className="type-name py-3.5 text-lg font-bold">
                {p.name}
              </th>
              <td className="hidden py-3.5 text-sm text-silver sm:table-cell">{POSITION_SHORT[p.position]}</td>
              {COLUMNS.map((c) => (
                <td
                  key={c.key}
                  className={cn(
                    "tabular py-3.5 text-center last:pr-4 sm:last:pr-6",
                    c.key === statKey ? "type-name text-xl" : "text-sm text-silver"
                  )}
                >
                  {valueOf(p, c.key)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
