import type { Player } from "@/lib/data";
import PlayerPortrait from "./PlayerPortrait";

export default function PlayerCard({ player }: { player: Player }) {
  const featured = player.appearances > 0;

  return (
    <article className="flex flex-col bg-field-2">
      <div className="relative aspect-[15/17] overflow-hidden">
        <PlayerPortrait className="absolute inset-0 h-full w-full" />
        {!featured && (
          <span className="absolute top-3 right-3 bg-ring-black/70 px-2 py-1 text-xs text-silver">Yet to feature</span>
        )}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-field-2/95 via-field-2/40 to-transparent px-4 pt-12 pb-3">
          <h3 className="type-display text-3xl sm:text-4xl">{player.name}</h3>
          <p className="mt-1 text-sm text-silver">{player.position}</p>
        </div>
      </div>
      <dl className="grid grid-cols-3 border-t border-line text-center">
        <Stat label="Apps" value={player.appearances} />
        <Stat label="Goals" value={player.goals} />
        <Stat label="Assists" value={player.assists} />
      </dl>
    </article>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex flex-col-reverse gap-0.5 py-3 [&+&]:border-l [&+&]:border-line">
      <dt className="text-xs text-silver-dim">{label}</dt>
      <dd className="type-name tabular text-2xl">{value}</dd>
    </div>
  );
}
