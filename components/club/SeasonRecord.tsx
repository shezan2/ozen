import type { Match } from "@/lib/data";
import { getTeamRecord, getForm } from "@/lib/data";
import Crest from "./Crest";
import FormGuide from "./FormGuide";

export function formatGoalDifference(gd: number) {
  if (gd > 0) return `+${gd}`;
  if (gd < 0) return `−${Math.abs(gd)}`;
  return "0";
}

/** The club's line from a standings table: the same columns a league table uses. */
export default function SeasonRecord({ matches }: { matches: Match[] }) {
  const r = getTeamRecord(matches);
  const form = getForm(matches, 5);

  const cols = [
    { label: "Played", short: "P", value: r.played },
    { label: "Won", short: "W", value: r.won },
    { label: "Drawn", short: "D", value: r.drawn },
    { label: "Lost", short: "L", value: r.lost },
    { label: "Goals for", short: "GF", value: r.goalsFor, wide: true },
    { label: "Goals against", short: "GA", value: r.goalsAgainst, wide: true },
    { label: "Goal difference", short: "GD", value: formatGoalDifference(r.goalDifference) },
  ];

  return (
    <div className="overflow-x-auto bg-field-2">
      <table className="w-full min-w-[20rem] border-collapse text-left">
        <thead>
          <tr className="border-b border-line text-xs text-silver-dim">
            <th scope="col" className="py-3 pr-4 pl-4 font-normal sm:pl-6">
              Club
            </th>
            {cols.map((c) => (
              <th
                key={c.short}
                scope="col"
                className={`w-12 py-3 text-center font-normal ${c.wide ? "hidden sm:table-cell" : ""}`}
              >
                <abbr title={c.label} className="no-underline">
                  {c.short}
                </abbr>
              </th>
            ))}
            <th scope="col" className="hidden py-3 pr-6 pl-4 font-normal md:table-cell">
              Form
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th scope="row" className="py-4 pr-4 pl-4 sm:pl-6">
              <span className="flex items-center gap-3">
                <Crest size={32} />
                <span className="type-name text-lg">Chèvre Noir</span>
              </span>
            </th>
            {cols.map((c) => (
              <td
                key={c.short}
                className={`type-name tabular py-4 text-center text-xl ${c.wide ? "hidden sm:table-cell" : ""}`}
              >
                {c.value}
              </td>
            ))}
            <td className="hidden py-4 pr-6 pl-4 md:table-cell">
              <FormGuide results={form} />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
