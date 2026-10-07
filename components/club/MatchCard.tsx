"use client";

import { Fragment, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronDown } from "lucide-react";
import type { Match } from "@/lib/data";
import { parseScore } from "@/lib/data";
import Crest from "./Crest";
import OpponentCrest from "./OpponentCrest";
import { ResultChip } from "./ResultBadge";
import { EASE_OUT } from "@/lib/motion";
import { cn } from "@/lib/utils";

export default function MatchCard({ match, matchday }: { match: Match; matchday: number }) {
  const [open, setOpen] = useState(false);
  const s = parseScore(match);
  const hasDetail = Boolean(
    match.summary || match.motm || match.lineup?.length || match.goals?.length || match.assists?.length
  );

  return (
    <div className={cn("bg-navy transition-colors duration-200", open && "bg-navy-2")}>
      <button
        onClick={() => hasDetail && setOpen((v) => !v)}
        aria-expanded={hasDetail ? open : undefined}
        disabled={!hasDetail}
        className={cn(
          "grid w-full grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-x-3 gap-y-5 px-4 py-5 text-left sm:px-8 sm:py-6 lg:grid-cols-[8.5rem_minmax(0,1fr)_auto_minmax(0,1fr)_9rem_auto] lg:gap-x-6 xl:grid-cols-[11rem_minmax(0,1fr)_auto_minmax(0,1fr)_10rem_auto]",
          hasDetail && "group cursor-pointer transition-colors duration-200 hover:bg-navy-2"
        )}
      >
        <span className="col-span-3 flex items-baseline justify-between gap-3 text-sm lg:col-span-1 lg:flex-col lg:gap-1">
          <span className="font-semibold text-white">Matchday {matchday}</span>
          <span className="text-silver">
            {match.date.split(", ").map((part, i) => (
              <Fragment key={i}>
                {i > 0 && ", "}
                <span className="whitespace-nowrap">{part}</span>
              </Fragment>
            ))}
          </span>
        </span>

        <span className="flex min-w-0 items-center justify-end gap-3">
          <span className="display min-w-0 text-right text-[1.2rem] leading-[0.9] break-words text-white min-[375px]:text-[1.35rem] sm:text-[1.75rem]">
            Chèvre Noir
          </span>
          <Crest decorative size={40} className="hidden size-9 shrink-0 sm:block" />
        </span>

        <span className="figure bg-noir px-2.5 py-2 text-center text-[2.1rem] whitespace-nowrap text-white sm:px-4 sm:text-[2.75rem]">
          {s ? `${s.for}–${s.against}` : "v"}
        </span>

        <span className="flex min-w-0 items-center gap-3">
          <OpponentCrest name={match.opponent} size={30} className="hidden sm:block" />
          <span className="display min-w-0 text-[1.2rem] leading-[0.9] break-words text-white min-[375px]:text-[1.35rem] sm:text-[1.75rem]">
            {match.opponent}
          </span>
        </span>

        <span className="col-span-2 truncate text-sm text-silver lg:col-span-1">{match.location || "Venue not recorded"}</span>

        <span className="flex items-center justify-end gap-3">
          <ResultChip result={match.result} />
          <span
            aria-hidden
            className={cn(
              "flex size-9 items-center justify-center rounded-full bg-noir transition-transform duration-300",
              open && "rotate-180",
              !hasDetail && "invisible"
            )}
          >
            <ChevronDown className="size-4 text-white" />
          </span>
        </span>
      </button>

      <AnimatePresence initial={false}>
        {open && hasDetail && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: EASE_OUT }}
            className="overflow-hidden"
          >
            <div className="grid gap-8 px-4 pt-2 pb-8 sm:grid-cols-2 sm:px-8 lg:pl-[calc(8.5rem+3.5rem)] xl:pl-[calc(11rem+3.5rem)]">
              {(match.summary || match.motm) && (
                <div className="flex flex-col gap-2 sm:col-span-2">
                  {match.summary && <p className="max-w-2xl text-lg leading-snug font-semibold text-white">{match.summary}</p>}
                  {match.motm && (
                    <p className="text-sm text-silver">
                      Player of the match: <span className="font-semibold text-white">{match.motm}</span>
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
    <div className="flex flex-col gap-3">
      <h4 className="text-sm font-semibold text-silver">{title}</h4>
      <ul className="flex flex-col gap-2">
        {events.map((e) => (
          <li key={e.player} className="flex max-w-xs justify-between text-[15px] text-white">
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
    <div className={cn("flex flex-col gap-3", className)}>
      <h4 className="text-sm font-semibold text-silver">{title}</h4>
      <ul className="flex flex-wrap gap-2">
        {names.map((n) => (
          <li key={n} className="rounded-full bg-noir px-3.5 py-1.5 text-sm text-white">
            {n}
          </li>
        ))}
      </ul>
    </div>
  );
}
