"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronDown, MapPin, Star } from "lucide-react";
import type { Match } from "@/lib/data";
import { parseScore } from "@/lib/data";
import { ResultBadge } from "./ResultBadge";
import OpponentBadge from "./OpponentBadge";
import { cn } from "@/lib/utils";

export default function MatchCard({ match, matchday }: { match: Match; matchday: number }) {
  const [open, setOpen] = useState(false);
  const score = parseScore(match);
  const hasDetail = Boolean(
    match.summary || match.motm || match.lineup?.length || match.goals?.length || match.assists?.length
  );

  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-white transition-shadow duration-300 hover:shadow-[0_12px_32px_rgba(0,0,0,0.06)]">
      <button
        onClick={() => hasDetail && setOpen((v) => !v)}
        className={cn(
          "flex w-full flex-col gap-4 p-5 text-left sm:flex-row sm:items-center sm:gap-6 sm:p-6",
          hasDetail ? "cursor-pointer" : "cursor-default"
        )}
        aria-expanded={open}
        disabled={!hasDetail}
      >
        <div className="flex items-center gap-4 sm:w-40 sm:shrink-0">
          <span className="text-xs font-semibold uppercase tracking-[0.1em] text-ink-faint">
            MD{matchday}
          </span>
          <span className="text-sm text-ink-dim">{match.date}</span>
        </div>

        <div className="flex flex-1 items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <OpponentBadge name={match.opponent} size={36} className="text-xs" />
            <div className="flex flex-col gap-1">
              <span className="text-base font-semibold tracking-tight text-ink sm:text-lg">
                vs {match.opponent}
              </span>
              {match.location && (
                <span className="flex items-center gap-1 text-xs text-ink-faint">
                  <MapPin className="size-3" />
                  {match.location}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4">
            {score && (
              <span className="tabular text-2xl font-bold tracking-tight text-ink sm:text-3xl">
                {score.for}&thinsp;–&thinsp;{score.against}
              </span>
            )}
            <ResultBadge result={match.result} />
            {hasDetail && (
              <ChevronDown
                className={cn("size-4 text-ink-faint transition-transform duration-300", open && "rotate-180")}
              />
            )}
          </div>
        </div>
      </button>

      <AnimatePresence initial={false}>
        {open && hasDetail && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden border-t border-line"
          >
            <div className="flex flex-col gap-5 p-5 sm:p-6">
              {match.summary && (
                <p className="text-sm leading-relaxed text-ink-dim">{match.summary}</p>
              )}

              {match.motm && (
                <div className="flex items-center gap-2 rounded-xl bg-gold/10 px-4 py-3 ring-1 ring-inset ring-gold/25">
                  <Star className="size-4 fill-gold text-gold" />
                  <span className="text-sm font-medium text-ink">
                    Man of the Match — <span className="font-semibold">{match.motm}</span>
                  </span>
                </div>
              )}

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                {match.goals && match.goals.length > 0 && (
                  <EventList title="Goals" events={match.goals} />
                )}
                {match.assists && match.assists.length > 0 && (
                  <EventList title="Assists" events={match.assists} />
                )}
              </div>

              {match.lineup && match.lineup.length > 0 && (
                <div className="flex flex-col gap-2">
                  <span className="text-xs font-semibold uppercase tracking-[0.1em] text-ink-faint">
                    Starting XI
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {match.lineup.map((name) => (
                      <span
                        key={name}
                        className="rounded-full bg-paper px-3 py-1 text-sm text-ink-dim ring-1 ring-line"
                      >
                        {name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {match.subs && match.subs.length > 0 && (
                <div className="flex flex-col gap-2">
                  <span className="text-xs font-semibold uppercase tracking-[0.1em] text-ink-faint">
                    Substitutes
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {match.subs.map((name) => (
                      <span
                        key={name}
                        className="rounded-full bg-paper px-3 py-1 text-sm text-ink-faint ring-1 ring-line"
                      >
                        {name}
                      </span>
                    ))}
                  </div>
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
    <div className="flex flex-col gap-2">
      <span className="text-xs font-semibold uppercase tracking-[0.1em] text-ink-faint">{title}</span>
      <ul className="flex flex-col gap-1.5">
        {events.map((e) => (
          <li key={e.player} className="flex items-center justify-between text-sm">
            <span className="text-ink">{e.player}</span>
            {e.count > 1 && <span className="tabular font-medium text-ink-dim">×{e.count}</span>}
          </li>
        ))}
      </ul>
    </div>
  );
}
