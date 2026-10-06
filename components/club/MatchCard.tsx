"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronDown } from "lucide-react";
import type { Match } from "@/lib/data";
import { parseScore } from "@/lib/data";
import Crest from "./Crest";
import OpponentCrest from "./OpponentCrest";
import { ResultChip } from "./ResultBadge";
import { cn } from "@/lib/utils";

export default function MatchCard({ match, matchday }: { match: Match; matchday: number }) {
  const [open, setOpen] = useState(false);
  const s = parseScore(match);
  const hasDetail = Boolean(
    match.summary || match.motm || match.lineup?.length || match.goals?.length || match.assists?.length
  );

  return (
    <div className="bg-field-2">
      <button
        onClick={() => hasDetail && setOpen((v) => !v)}
        aria-expanded={hasDetail ? open : undefined}
        disabled={!hasDetail}
        className={cn(
          "grid w-full grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-x-3 gap-y-3 px-4 py-5 text-left md:grid-cols-[9rem_minmax(0,1fr)_auto_minmax(0,1fr)_9rem_auto] md:gap-x-5 sm:px-6",
          hasDetail && "cursor-pointer transition-colors hover:bg-field-3"
        )}
      >
        <span className="col-span-3 flex items-center justify-between text-xs text-silver md:col-span-1 md:block">
          <span className="block">Matchday {matchday}</span>
          <span className="block text-silver-dim">{match.date}</span>
        </span>

        <span className="flex min-w-0 items-center justify-end gap-3">
          <span className="type-name text-right text-base leading-tight break-words sm:text-xl">Chèvre Noir</span>
          <Crest size={30} className="shrink-0" />
        </span>

        <span className="type-name tabular bg-ring-black px-3 py-1.5 text-center text-2xl whitespace-nowrap text-chalk">
          {s ? `${s.for}–${s.against}` : "vs"}
        </span>

        <span className="flex min-w-0 items-center gap-3">
          <OpponentCrest name={match.opponent} size={26} />
          <span className="type-name text-base leading-tight break-words sm:text-xl">{match.opponent}</span>
        </span>

        <span className="col-span-2 truncate text-xs text-silver-dim md:col-span-1">
          {match.location || "Venue not recorded"}
        </span>

        <span className="flex items-center justify-end gap-3">
          <ResultChip result={match.result} />
          <ChevronDown
            aria-hidden
            className={cn("size-4 text-silver transition-transform duration-300", open && "rotate-180", !hasDetail && "invisible")}
          />
        </span>
      </button>

      <AnimatePresence initial={false}>
        {open && hasDetail && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
            className="overflow-hidden"
          >
            <div className="grid gap-6 border-t border-line px-4 py-6 sm:grid-cols-2 sm:px-6">
              {(match.summary || match.motm) && (
                <div className="flex flex-col gap-2 sm:col-span-2">
                  {match.summary && <p className="max-w-2xl text-sm leading-relaxed text-chalk">{match.summary}</p>}
                  {match.motm && (
                    <p className="text-sm text-silver">
                      Player of the match: <span className="text-chalk">{match.motm}</span>
                    </p>
                  )}
                </div>
              )}
              {match.goals && match.goals.length > 0 && <EventList title="Goals" events={match.goals} />}
              {match.assists && match.assists.length > 0 && <EventList title="Assists" events={match.assists} />}
              {match.lineup && match.lineup.length > 0 && (
                <NameList title="Starting eleven" names={match.lineup} className="sm:col-span-2" />
              )}
              {match.subs && match.subs.length > 0 && <NameList title="Substitutes" names={match.subs} className="sm:col-span-2" />}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function EventList({ title, events }: { title: string; events: { player: string; count: number }[] }) {
  return (
    <div className="flex flex-col gap-2">
      <h4 className="type-name text-sm tracking-[0.04em] text-silver">{title}</h4>
      <ul className="flex flex-col gap-1">
        {events.map((e) => (
          <li key={e.player} className="flex justify-between text-sm text-chalk">
            <span>{e.player}</span>
            {e.count > 1 && <span className="tabular text-silver">×{e.count}</span>}
          </li>
        ))}
      </ul>
    </div>
  );
}

function NameList({ title, names, className }: { title: string; names: string[]; className?: string }) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <h4 className="type-name text-sm tracking-[0.04em] text-silver">{title}</h4>
      <p className="text-sm leading-relaxed text-chalk">{names.join(", ")}</p>
    </div>
  );
}
