import type { Match } from "@/lib/data";
import { getTeamRecord, getForm } from "@/lib/data";
import CountUp from "@/components/motion/CountUp";
import Reveal from "@/components/motion/Reveal";
import FormGuide from "./FormGuide";
import { cn } from "@/lib/utils";

/** The club's season line, as a standings table would give it. */
export default function SeasonRecord({ matches }: { matches: Match[] }) {
  const r = getTeamRecord(matches);
  const form = getForm(matches, 5);

  const cols: { label: string; value: number; signed?: boolean }[] = [
    { label: "Played", value: r.played },
    { label: "Won", value: r.won },
    { label: "Drawn", value: r.drawn },
    { label: "Lost", value: r.lost },
    { label: "Goals for", value: r.goalsFor },
    { label: "Goals against", value: r.goalsAgainst },
    { label: "Goal difference", value: r.goalDifference, signed: true },
  ];

  return (
    <Reveal>
      <div className="glass overflow-hidden rounded-[1.75rem] backdrop-blur-2xl">
        <dl className="-mt-px -ml-px grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7">
          {cols.map((c, i) => (
            <div
              key={c.label}
              className={cn(
                "flex flex-col gap-3 border-t border-l border-line px-6 py-7",
                // The odd seventh cell spans the spare width so the two- and four-column grids close square.
                i === cols.length - 1 && "col-span-2 lg:col-span-1"
              )}
            >
              <dt className="text-sm text-silver">{c.label}</dt>
              <dd className="figure text-5xl leading-none text-chalk">
                <CountUp value={c.value} signed={c.signed} />
              </dd>
            </div>
          ))}
          <div className="col-span-2 flex flex-wrap items-center justify-between gap-3 border-t border-l border-line px-6 py-6 sm:col-span-4 lg:col-span-7">
            <dt className="text-sm text-silver">Last five results</dt>
            <dd>
              <FormGuide results={form} />
            </dd>
          </div>
        </dl>
      </div>
    </Reveal>
  );
}
