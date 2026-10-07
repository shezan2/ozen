import type { Player } from "@/lib/data";
import { POSITION_SHORT } from "@/lib/data";
import Monogram from "./Monogram";

export default function PlayerCard({ player }: { player: Player }) {
  const featured = player.appearances > 0;

  return (
    <article className="glass spotlight group flex h-full flex-col overflow-hidden rounded-[1.5rem] backdrop-blur-xl">
      <div className="relative flex aspect-[3/4] flex-col justify-between p-4 sm:aspect-[4/5] sm:p-5">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_55%_at_50%_0%,rgba(43,79,176,0.32),transparent_72%)]"
        />
        <div className="flex items-center justify-between text-xs">
          <span className="text-silver">{POSITION_SHORT[player.position]}</span>
          {!featured && <span className="rounded-full bg-white/10 px-2.5 py-1 text-chalk">Yet to feature</span>}
        </div>
        <Monogram
          name={player.name}
          className="mx-auto size-[4.5rem] text-[2.5rem] group-hover:scale-[1.04] group-hover:ring-gold/80 sm:size-28 sm:text-[4rem]"
        />
        <div>
          <h3 className="font-display text-[1.45rem] leading-none break-words text-chalk sm:text-[2rem]">{player.name}</h3>
          <p className="mt-2 text-sm text-silver">{player.position}</p>
        </div>
      </div>
      <dl className="grid grid-cols-3 border-t border-line">
        <Stat label="Apps" value={player.appearances} />
        <Stat label="Goals" value={player.goals} />
        <Stat label="Assists" value={player.assists} />
      </dl>
    </article>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex flex-col-reverse items-center gap-1 py-4 [&+&]:border-l [&+&]:border-line">
      <dt className="text-xs text-silver">{label}</dt>
      <dd className="figure text-2xl leading-none text-chalk">{value}</dd>
    </div>
  );
}
