import Link from "next/link";
import type { Match } from "@/lib/data";
import { parseScore } from "@/lib/data";
import { ResultStamp } from "./ResultBadge";

export default function MatchCentre({ match }: { match: Match }) {
  const score = parseScore(match);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
        <h2 className="text-xs font-medium tracking-wide text-ink-faint uppercase">Latest result</h2>
        <span className="text-xs text-ink-faint">
          {match.date}
          {match.location ? ` · ${match.location}` : ""}
        </span>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4 sm:gap-6">
          <span className="font-serif text-xl text-ink sm:text-2xl">Chèvre Noir</span>
          {score ? (
            <span className="tabular font-serif text-4xl font-semibold text-ink sm:text-5xl">
              {score.for}–{score.against}
            </span>
          ) : (
            <span className="text-lg text-ink-dim">vs</span>
          )}
          <span className="font-serif text-xl text-ink sm:text-2xl">{match.opponent}</span>
        </div>
        <ResultStamp result={match.result} />
      </div>

      {match.summary && <p className="max-w-xl text-sm leading-relaxed text-ink-dim">{match.summary}</p>}

      {match.motm && (
        <p className="text-sm text-ink-dim">
          Man of the match — <span className="font-medium text-ink">{match.motm}</span>
        </p>
      )}

      <Link href="/matches" className="w-fit border-b border-ink-dim pb-0.5 text-sm text-ink-dim transition-colors hover:border-navy hover:text-navy">
        Full match centre
      </Link>
    </div>
  );
}
