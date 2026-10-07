import type { ReactNode } from "react";
import type { Match } from "@/lib/data";
import { parseScore } from "@/lib/data";
import Crest from "./Crest";
import OpponentCrest from "./OpponentCrest";
import PillLink from "@/components/ui/PillLink";

/** The latest result as a scoreboard: score above, the story of the match below. */
export default function MatchCentre({ match }: { match: Match }) {
  const s = parseScore(match);
  const scorers = match.goals?.map((g) => (g.count > 1 ? `${g.player} ×${g.count}` : g.player)).join(", ");

  return (
    <article>
      <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-3 bg-navy px-4 py-10 sm:gap-8 sm:px-12 sm:py-16">
        <Team crest={<Crest decorative size={160} className="size-16 sm:size-28 lg:size-32" />} name="Chèvre Noir" />

        <div className="flex flex-col items-center gap-3">
          {s ? (
            <p className="figure flex items-baseline text-[clamp(4.5rem,13vw,11rem)] text-white">
              <span className="sr-only">
                {s.for}–{s.against}
              </span>
              <span aria-hidden>{s.for}</span>
              <span aria-hidden className="px-[0.08em] text-mist">
                –
              </span>
              <span aria-hidden>{s.against}</span>
            </p>
          ) : (
            <p className="figure text-6xl text-silver">v</p>
          )}
          <p className="text-sm font-semibold text-silver">{match.result === "Upcoming" ? "Kick-off" : "Full time"}</p>
        </div>

        <Team
          crest={<OpponentCrest name={match.opponent} size={128} className="h-[74px] w-16 sm:h-[129px] sm:w-28" />}
          name={match.opponent}
        />
      </div>

      <div className="flex flex-col gap-6 bg-navy-2 px-5 py-7 sm:flex-row sm:items-center sm:justify-between sm:px-12">
        <div className="flex flex-col gap-1.5 text-[15px]">
          {match.summary && <p className="text-white">{match.summary}</p>}
          {scorers && <p className="text-silver">Scorers: {scorers}</p>}
        </div>
        <PillLink href="/matches" className="self-start sm:self-auto">
          All results
        </PillLink>
      </div>
    </article>
  );
}

function Team({ crest, name }: { crest: ReactNode; name: string }) {
  return (
    <div className="flex flex-col items-center gap-4 text-center">
      {crest}
      <span className="display text-[clamp(1.5rem,3.6vw,3rem)] leading-[0.9] text-white">{name}</span>
    </div>
  );
}
