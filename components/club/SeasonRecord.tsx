import type { Match } from "@/lib/data";
import { getTeamRecord, getForm } from "@/lib/data";
import FormGuide from "./FormGuide";
import { cn, formatSigned } from "@/lib/utils";

/** The club's season line, as a standings table would give it. */
export default function SeasonRecord({ matches }: { matches: Match[] }) {
  const r = getTeamRecord(matches);
  const form = getForm(matches, 5);

  const cols: { label: string; value: string | number }[] = [
    { label: "Played", value: r.played },
    { label: "Won", value: r.won },
    { label: "Drawn", value: r.drawn },
    { label: "Lost", value: r.lost },
    { label: "Goals for", value: r.goalsFor },
    { label: "Goals against", value: r.goalsAgainst },
    { label: "Goal difference", value: formatSigned(r.goalDifference) },
  ];

  return (
    <div className="bg-navy">
      <dl className="grid grid-cols-2 gap-x-6 gap-y-9 px-5 py-8 sm:grid-cols-4 sm:px-10 sm:py-10 lg:grid-cols-7">
        {cols.map((c, i) => (
          <div
            key={c.label}
            className={cn(
              "flex flex-col gap-3",
              // The odd seventh figure takes the spare width so the two- and four-column grids close square.
              i === cols.length - 1 && "col-span-2 lg:col-span-1"
            )}
          >
            <dt className="text-sm font-semibold text-silver">{c.label}</dt>
            <dd className="figure text-[clamp(3.25rem,5vw,4.5rem)] text-white">{c.value}</dd>
          </div>
        ))}
      </dl>
      <div className="flex flex-wrap items-center justify-between gap-4 bg-navy-2 px-5 py-5 sm:px-10">
        <p className="text-sm font-semibold text-silver">Last five results</p>
        <FormGuide results={form} />
      </div>
    </div>
  );
}
