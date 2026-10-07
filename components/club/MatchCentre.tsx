import type { Match } from "@/lib/data";
import { parseScore } from "@/lib/data";
import Crest from "./Crest";
import OpponentCrest from "./OpponentCrest";
import CountUp from "@/components/motion/CountUp";
import Reveal from "@/components/motion/Reveal";
import PillLink from "@/components/ui/PillLink";

/** The latest result, held on a pane of glass under the floodlight. */
export default function MatchCentre({ match }: { match: Match }) {
  const s = parseScore(match);
  const scorers = match.goals?.map((g) => (g.count > 1 ? `${g.player} ×${g.count}` : g.player)).join(", ");

  return (
    <Reveal>
      <article className="glass spotlight overflow-hidden rounded-[2rem] backdrop-blur-2xl">
        <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-3 px-5 py-14 sm:gap-8 sm:px-14 sm:py-20">
          <div className="flex flex-col items-center gap-5 text-center">
            <Crest decorative size={140} className="size-16 sm:size-28 lg:size-32" />
            <span className="font-display text-2xl leading-tight text-chalk sm:text-4xl">Chèvre Noir</span>
          </div>

          <div className="flex flex-col items-center gap-3">
            {s ? (
              <p className="figure flex items-baseline text-[clamp(4.5rem,11vw,10rem)] leading-none text-chalk">
                <CountUp value={s.for} />
                <span aria-hidden className="px-[0.12em] text-mist">
                  –
                </span>
                <CountUp value={s.against} />
              </p>
            ) : (
              <p className="figure text-6xl text-silver">v</p>
            )}
            <p className="text-sm text-silver">{match.result === "Upcoming" ? "Kick-off" : "Full time"}</p>
          </div>

          <div className="flex flex-col items-center gap-5 text-center">
            <OpponentCrest name={match.opponent} size={112} className="h-[74px] w-16 sm:h-[129px] sm:w-28" />
            <span className="font-display text-2xl leading-tight text-chalk sm:text-4xl">{match.opponent}</span>
          </div>
        </div>

        <div className="flex flex-col gap-6 border-t border-line px-6 py-7 sm:flex-row sm:items-center sm:justify-between sm:px-14">
          <div className="flex flex-col gap-1.5 text-[15px]">
            {match.summary && <p className="text-chalk">{match.summary}</p>}
            {scorers && <p className="text-silver">Scorers: {scorers}</p>}
          </div>
          <PillLink href="/matches" variant="glass" className="self-start sm:self-auto">
            All results
          </PillLink>
        </div>
      </article>
    </Reveal>
  );
}
