import type { Player } from "@/lib/data";
import { getLeaders } from "@/lib/data";
import CountUp from "@/components/motion/CountUp";
import { RevealGroup, RevealItem } from "@/components/motion/Reveal";

const BOARDS: { key: "goals" | "assists" | "appearances"; title: string }[] = [
  { key: "goals", title: "Goals" },
  { key: "assists", title: "Assists" },
  { key: "appearances", title: "Appearances" },
];

export default function StatLeaders({ players }: { players: Player[] }) {
  return (
    <RevealGroup className="grid gap-4 md:grid-cols-3">
      {BOARDS.map(({ key, title }) => {
        const [leader, ...chasers] = getLeaders(players, key).slice(0, 3);
        return (
          <RevealItem key={key} className="glass spotlight flex flex-col rounded-[1.75rem] p-7 backdrop-blur-xl sm:p-8">
            <h3 className="text-sm text-silver">{title}</h3>
            <div className="mt-12 flex items-end justify-between gap-4">
              <div className="flex min-w-0 flex-col gap-2">
                <span
                  aria-label="Rank 1"
                  className="flex size-7 items-center justify-center rounded-full text-xs text-gold ring-1 ring-gold/70"
                >
                  1
                </span>
                <p className="truncate font-display text-4xl text-chalk">{leader.name}</p>
              </div>
              <CountUp value={leader[key]} className="figure text-7xl leading-none text-chalk" />
            </div>
            <ol className="mt-8 border-t border-line">
              {chasers.map((p, i) => (
                <li key={p.id} className="flex items-center justify-between border-b border-line py-3.5 text-[15px] last:border-0">
                  <span className="flex items-center gap-4">
                    <span className="tabular w-6 text-center text-mist">{i + 2}</span>
                    <span className="text-chalk">{p.name}</span>
                  </span>
                  <span className="tabular text-silver">{p[key]}</span>
                </li>
              ))}
            </ol>
          </RevealItem>
        );
      })}
    </RevealGroup>
  );
}
