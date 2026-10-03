import Link from "next/link";
import { ArrowRight, Star } from "lucide-react";
import type { Match } from "@/lib/data";
import { parseScore } from "@/lib/data";
import Crest from "./Crest";
import OpponentBadge from "./OpponentBadge";
import { ResultBadge } from "./ResultBadge";

const STATUS_LABEL: Record<Match["result"], string> = {
  W: "Full Time",
  D: "Full Time",
  L: "Full Time",
  Upcoming: "Kick Off",
};

export default function MatchCentre({ match }: { match: Match }) {
  const score = parseScore(match);

  return (
    <div className="rounded-3xl bg-white shadow-[0_30px_60px_-20px_rgba(0,0,0,0.25)] ring-1 ring-black/5">
      <div className="flex items-center justify-between border-b border-line px-6 py-4 sm:px-8">
        <span className="text-sm font-medium text-ink-dim">{STATUS_LABEL[match.result]} · Friendly</span>
        <ResultBadge result={match.result} />
      </div>

      <div className="grid grid-cols-3 items-center gap-2 px-4 py-8 sm:gap-6 sm:px-8 sm:py-12">
        <div className="flex flex-col items-center gap-3 text-center">
          <Crest size={64} className="sm:hidden" />
          <Crest size={88} className="hidden sm:block" />
          <span className="text-sm font-semibold text-ink sm:text-base">Chèvre Noir</span>
        </div>

        <div className="flex flex-col items-center gap-1">
          {score ? (
            <span className="text-5xl font-semibold tracking-tight text-ink sm:text-7xl">
              {score.for}
              <span className="text-ink-faint">–</span>
              {score.against}
            </span>
          ) : (
            <span className="text-2xl font-medium text-ink-dim">vs</span>
          )}
          {match.summary && <span className="hidden text-center text-xs text-ink-faint sm:block">{match.summary}</span>}
        </div>

        <div className="flex flex-col items-center gap-3 text-center">
          <OpponentBadge name={match.opponent} size={64} className="text-lg sm:hidden" />
          <OpponentBadge name={match.opponent} size={88} className="text-2xl hidden sm:flex" />
          <span className="text-sm font-semibold text-ink sm:text-base">{match.opponent}</span>
        </div>
      </div>

      <div className="flex flex-col gap-4 border-t border-line px-6 py-5 sm:px-8">
        <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-center text-sm text-ink-dim">
          <span>{match.date}</span>
          {match.location && (
            <>
              <span aria-hidden className="text-ink-faint">
                ·
              </span>
              <span>{match.location}</span>
            </>
          )}
        </div>

        {match.motm && (
          <div className="mx-auto flex items-center gap-2 rounded-full bg-blue/10 px-4 py-2">
            <Star className="size-3.5 fill-blue-deep text-blue-deep" />
            <span className="text-xs font-medium text-ink">
              Man of the Match — <span className="font-semibold">{match.motm}</span>
            </span>
          </div>
        )}

        <Link
          href="/matches"
          className="mx-auto inline-flex items-center gap-1.5 text-sm font-semibold text-blue-deep transition-colors hover:text-blue"
        >
          Full Match Centre
          <ArrowRight className="size-4" />
        </Link>
      </div>
    </div>
  );
}
