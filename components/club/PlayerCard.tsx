import type { Player } from "@/lib/data";
import { cn } from "@/lib/utils";

/** A player set like shirt lettering: position, name, and the season's numbers. */
export default function PlayerCard({ player, tone = "navy" }: { player: Player; tone?: "navy" | "noir" }) {
  const featured = player.appearances > 0;

  return (
    <article
      className={cn(
        "flex h-full min-h-[13.5rem] flex-col justify-between gap-8 p-4 min-[375px]:p-5 sm:min-h-[15rem] sm:p-6",
        tone === "navy" ? "bg-navy" : "bg-noir"
      )}
    >
      <div className="flex flex-col gap-3">
        <div className="flex min-h-7 flex-wrap items-center justify-between gap-2">
          <span className="text-sm font-semibold text-silver">{player.position}</span>
          {!featured && (
            <span
              className={cn(
                "rounded-full px-2.5 py-1 text-xs font-semibold text-silver",
                tone === "navy" ? "bg-navy-2" : "bg-navy"
              )}
            >
              Yet to feature
            </span>
          )}
        </div>
        <h3 className="display text-[clamp(2rem,3vw,2.6rem)] leading-[0.88] break-words text-white">{player.name}</h3>
      </div>

      <dl className="grid grid-cols-3 gap-1 min-[375px]:gap-2">
        <Stat label="Apps" value={player.appearances} />
        <Stat label="Goals" value={player.goals} />
        <Stat label="Assists" value={player.assists} />
      </dl>
    </article>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex flex-col-reverse gap-1.5">
      <dt className="text-[11px] font-semibold text-mist min-[375px]:text-xs">{label}</dt>
      <dd className="figure text-[2.6rem] text-white">{value}</dd>
    </div>
  );
}
