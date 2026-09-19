"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import type { Match } from "@/lib/data";
import SegmentedControl, { type SegmentedOption } from "./SegmentedControl";
import MatchCard from "./MatchCard";

type Filter = "All" | Match["result"];

const FILTER_LABEL: Record<Match["result"], string> = {
  W: "Wins",
  D: "Draws",
  L: "Losses",
  Upcoming: "Upcoming",
};

export default function MatchesExplorer({ matches }: { matches: Match[] }) {
  const [filter, setFilter] = useState<Filter>("All");

  const withMatchday = useMemo(
    () => matches.map((m, i) => ({ match: m, matchday: i + 1 })).reverse(),
    [matches]
  );

  const options: SegmentedOption<Filter>[] = useMemo(() => {
    const present = Array.from(new Set(matches.map((m) => m.result)));
    return [
      { value: "All", label: "All", count: matches.length },
      ...present.map((result) => ({
        value: result,
        label: FILTER_LABEL[result],
        count: matches.filter((m) => m.result === result).length,
      })),
    ];
  }, [matches]);

  const visible = filter === "All" ? withMatchday : withMatchday.filter((m) => m.match.result === filter);

  return (
    <div className="flex flex-col gap-8">
      <SegmentedControl options={options} value={filter} onChange={setFilter} layoutId="matches-filter" />

      <div className="flex flex-col gap-4">
        <AnimatePresence mode="popLayout" initial={false}>
          {visible.map(({ match, matchday }) => (
            <motion.div
              key={match.id}
              layout
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            >
              <MatchCard match={match} matchday={matchday} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
