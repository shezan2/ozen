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
    <div className={cn("transition-colors duration-500", open && "bg-white/[0.03]")}>
      <button
        onClick={() => hasDetail && setOpen((v) => !v)}
        aria-expanded={hasDetail ? open : undefined}
        disabled={!hasDetail}
        className={cn(
          "grid w-full grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-x-3 gap-y-4 px-5 py-6 text-left sm:px-8 md:grid-cols-[8.5rem_minmax(0,1fr)_auto_minmax(0,1fr)_9rem_auto] md:gap-x-6 xl:grid-cols-[11rem_minmax(0,1fr)_auto_minmax(0,1fr)_10rem_auto]",
          hasDetail && "group cursor-pointer transition-colors duration-500 hover:bg-white/[0.03]"
        )}
      >
        <span className="col-span-3 flex items-baseline justify-between text-sm md:col-span-1 md:flex-col md:gap-1">
          <span className="text-chalk">Matchday {matchday}</span>
          <span className="text-mist">
            {match.date.split(", ").map((part, i) => (
              <Fragment key={i}>
                {i > 0 && ", "}
                <span className="whitespace-nowrap">{part}</span>
              </Fragment>
            ))}
          </span>
        </span>

        <span className="flex min-w-0 items-center justify-end gap-3">
          <span className="text-right font-display text-lg leading-tight break-words text-chalk sm:text-2xl">Chèvre Noir</span>
          <Crest decorative size={36} className="size-8 shrink-0 sm:size-9" />
        </span>

        <span className="figure rounded-full bg-white/[0.06] px-4 py-1.5 text-center text-2xl whitespace-nowrap text-chalk ring-1 ring-white/10 ring-inset sm:text-3xl">
          {s ? `${s.for}–${s.against}` : "v"}
        </span>

        <span className="flex min-w-0 items-center gap-3">
          <OpponentCrest name={match.opponent} size={30} />
          <span className="font-display text-lg leading-tight break-words text-chalk sm:text-2xl">{match.opponent}</span>
        </span>

        <span className="col-span-2 truncate text-sm text-mist md:col-span-1">{match.location || "Venue not recorded"}</span>

        <span className="flex items-center justify-end gap-3">
          <ResultChip result={match.result} />
          <span
            aria-hidden
            className={cn(
              "flex size-9 items-center justify-center rounded-full ring-1 ring-white/10 ring-inset transition-[transform,background-color] duration-500 ease-out-expo group-hover:bg-white/[0.06]",
              open && "rotate-180",
              !hasDetail && "invisible"
            )}
          >
            <ChevronDown className="size-4 text-silver" />
          </span>
        </span>
      </button>

      <AnimatePresence initial={false}>
        {open && hasDetail && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.6, ease: EASE_OUT }}
            className="overflow-hidden"
          >
            <motion.div
              initial={{ y: 12, filter: "blur(6px)" }}
              animate={{ y: 0, filter: "blur(0px)" }}
              transition={{ duration: 0.7, ease: EASE_OUT, delay: 0.08 }}
              className="grid gap-8 px-5 pt-2 pb-8 sm:grid-cols-2 sm:px-8 md:pl-[11rem]"
            >
              {(match.summary || match.motm) && (
                <div className="flex flex-col gap-2 sm:col-span-2">
                  {match.summary && <p className="max-w-2xl font-display text-xl leading-snug text-chalk sm:text-2xl">{match.summary}</p>}
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
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function EventList({ title, events }: { title: string; events: { player: string; count: number }[] }) {
  return (
    <div className="flex flex-col gap-3">
      <h4 className="text-sm text-silver">{title}</h4>
      <ul className="flex flex-col">
        {events.map((e) => (
          <li key={e.player} className="flex justify-between border-b border-line py-2.5 text-[15px] text-chalk last:border-0">
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
      <h4 className="text-sm text-silver">{title}</h4>
      <ul className="flex flex-wrap gap-2">
        {names.map((n) => (
          <li key={n} className="rounded-full bg-white/[0.05] px-3.5 py-1.5 text-sm text-chalk ring-1 ring-white/10 ring-inset">
            {n}
          </li>
        ))}
      </ul>
    </div>
  );
}
