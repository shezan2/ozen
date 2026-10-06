"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronDown } from "lucide-react";
import type { Match } from "@/lib/data";
import { parseScore } from "@/lib/data";
import { ResultStamp } from "./ResultBadge";
import { cn } from "@/lib/utils";

export default function MatchCard({ match, matchday }: { match: Match; matchday: number }) {
  const [open, setOpen] = useState(false);
  const score = parseScore(match);
  const hasDetail = Boolean(
    match.summary || match.motm || match.lineup?.length || match.goals?.length || match.assists?.length
  );

  return (
    <div className="border-b border-line">
      <button
        onClick={() => hasDetail && setOpen((v) => !v)}
        className={cn("flex w-full flex-col gap-2 py-4 text-left sm:flex-row sm:items-center sm:gap-5", hasDetail ? "cursor-pointer" : "cursor-default")}
        aria-expanded={open}
        disabled={!hasDetail}
      >
        <span className="tabular w-14 shrink-0 text-xs text-ink-faint">MD{matchday}</span>
        <span className="w-28 shrink-0 text-xs text-ink-faint">{match.date}</span>

        <span className="flex-1 font-serif text-base text-ink">vs {match.opponent}</span>

        {match.location && <span className="hidden w-36 shrink-0 truncate text-xs text-ink-faint md:block">{match.location}</span>}

        <div className="flex items-center gap-4">
          {score && (
            <span className="tabular w-14 text-right text-lg font-medium text-ink">
              {score.for}–{score.against}
            </span>
          )}
          <ResultStamp result={match.result} className="scale-90" />
          <ChevronDown
            className={cn(
              "size-4 text-ink-faint transition-transform duration-300",
              open && "rotate-180",
              !hasDetail && "opacity-0"
            )}
          />
        </div>
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
            <div className="flex flex-col gap-4 pb-5 pl-0 sm:pl-[4.5rem]">
              {match.summary && <p className="max-w-xl text-sm leading-relaxed text-ink-dim">{match.summary}</p>}

              {match.motm && (
                <p className="text-sm text-ink-dim">
                  Man of the match — <span className="font-medium text-ink">{match.motm}</span>
                </p>
              )}

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                {match.goals && match.goals.length > 0 && <EventList title="Goals" events={match.goals} />}
                {match.assists && match.assists.length > 0 && <EventList title="Assists" events={match.assists} />}
              </div>

              {match.lineup && match.lineup.length > 0 && (
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs text-ink-faint">Starting XI</span>
                  <p className="text-sm text-ink-dim">{match.lineup.join(", ")}</p>
                </div>
              )}

              {match.subs && match.subs.length > 0 && (
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs text-ink-faint">Substitutes</span>
                  <p className="text-sm text-ink-faint">{match.subs.join(", ")}</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function EventList({ title, events }: { title: string; events: { player: string; count: number }[] }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-xs text-ink-faint">{title}</span>
      <ul className="flex flex-col gap-1">
        {events.map((e) => (
          <li key={e.player} className="flex items-center justify-between text-sm">
            <span className="text-ink">{e.player}</span>
            {e.count > 1 && <span className="tabular text-ink-dim">×{e.count}</span>}
          </li>
        ))}
      </ul>
    </div>
  );
}
