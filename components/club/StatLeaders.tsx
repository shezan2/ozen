import type { Player } from "@/lib/data";
import { getLeaders } from "@/lib/data";
import { cn } from "@/lib/utils";

const BOARDS: { key: "goals" | "assists" | "appearances"; title: string }[] = [
  { key: "goals", title: "Goals" },
  { key: "assists", title: "Assists" },
  { key: "appearances", title: "Appearances" },
];

export default function StatLeaders({ players }: { players: Player[] }) {
  return (
    <div className="grid gap-px bg-line md:grid-cols-3">
      {BOARDS.map(({ key, title }) => (
        <section key={key} className="flex flex-col bg-field-2 p-6">
          <h3 className="type-title text-2xl">{title}</h3>
          <ol className="mt-5 flex flex-col">
            {getLeaders(players, key)
              .slice(0, 3)
              .map((p, i) => (
                <li
                  key={p.id}
                  className={cn("flex items-baseline gap-4 border-t border-line py-3", i === 0 && "border-t-gold/60")}
                >
                  <span className={cn("type-name tabular w-4 text-base", i === 0 ? "text-gold" : "text-silver-dim")}>{i + 1}</span>
                  <span className={cn("type-name flex-1 truncate", i === 0 ? "text-3xl" : "text-xl text-silver")}>{p.name}</span>
                  <span className={cn("type-display tabular", i === 0 ? "text-5xl" : "text-2xl text-silver")}>{p[key]}</span>
                </li>
              ))}
          </ol>
        </section>
      ))}
    </div>
  );
}
