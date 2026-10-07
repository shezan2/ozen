import type { Player } from "@/lib/data";
import { getLeaders } from "@/lib/data";
import RankOne from "./RankOne";

const BOARDS: { key: "goals" | "assists" | "appearances"; title: string }[] = [
  { key: "goals", title: "Goals" },
  { key: "assists", title: "Assists" },
  { key: "appearances", title: "Appearances" },
];

export default function StatLeaders({ players }: { players: Player[] }) {
  return (
    <div className="grid gap-3 md:grid-cols-3">
      {BOARDS.map(({ key, title }) => {
        const [leader, ...chasers] = getLeaders(players, key).slice(0, 3);
        return (
          <article key={key} className="flex flex-col gap-10 bg-navy p-6 sm:p-8">
            <h3 className="text-sm font-semibold text-silver">{title}</h3>
            <div className="flex items-end justify-between gap-4">
              <div className="flex min-w-0 flex-col gap-3">
                <RankOne />
                <p className="display truncate text-[clamp(2.25rem,3.4vw,3rem)] leading-[0.9] text-white">{leader.name}</p>
              </div>
              <p className="figure text-[clamp(4.5rem,7vw,6.5rem)] text-white">{leader[key]}</p>
            </div>
            <ol className="flex flex-col gap-3">
              {chasers.map((p, i) => (
                <li key={p.id} className="flex items-center justify-between gap-4 text-[15px]">
                  <span className="flex items-center gap-4">
                    <span className="tabular w-5 text-mist">{i + 2}</span>
                    <span className="font-semibold text-white">{p.name}</span>
                  </span>
                  <span className="tabular text-silver">{p[key]}</span>
                </li>
              ))}
            </ol>
          </article>
        );
      })}
    </div>
  );
}
