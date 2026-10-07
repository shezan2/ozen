"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import type { Player, LeaderboardKey } from "@/lib/data";
import { getLeaders } from "@/lib/data";
import SegmentedControl, { type SegmentedOption } from "./SegmentedControl";
import LeaderboardTable from "./LeaderboardTable";
import RankOne from "./RankOne";
import { EASE_OUT } from "@/lib/motion";

const OPTIONS: SegmentedOption<LeaderboardKey>[] = [
  { value: "goals", label: "Goals" },
  { value: "assists", label: "Assists" },
  { value: "involvements", label: "Goal involvements" },
  { value: "appearances", label: "Appearances" },
];

function valueOf(p: Player, key: LeaderboardKey) {
  return key === "involvements" ? p.goals + p.assists : p[key];
}

export default function LeaderboardExplorer({ players }: { players: Player[] }) {
  const [statKey, setStatKey] = useState<LeaderboardKey>("goals");
  const ranked = useMemo(() => getLeaders(players, statKey), [players, statKey]);
  const leader = ranked[0];
  const label = OPTIONS.find((o) => o.value === statKey)!.label.toLowerCase();

  return (
    <div className="flex flex-col gap-10 sm:gap-12">
      <SegmentedControl options={OPTIONS} value={statKey} onChange={setStatKey} layoutId="leaderboard-filter" />

      {/* Leader beside the ranking on wide screens, so names and numbers sit close together. */}
      <div className="grid gap-3 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:items-start">
        {leader && (
          <section aria-label={`Leader for ${label}`} className="bg-blue text-white lg:sticky lg:top-24">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={`${statKey}-${leader.id}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18, ease: EASE_OUT }}
                className="flex flex-col gap-10 px-6 py-8 sm:px-10 sm:py-10 lg:min-h-[32rem] lg:justify-between"
              >
                <div className="flex min-w-0 flex-col gap-4">
                  <p className="flex items-center gap-3 text-[15px] font-semibold text-haze">
                    <RankOne />
                    Leading for {label}
                  </p>
                  <p className="display text-[clamp(3.75rem,9vw,6.5rem)] leading-[0.84] break-words">{leader.name}</p>
                  <p className="text-[15px] text-haze">{leader.position}</p>
                </div>
                <p className="flex items-baseline gap-3">
                  <span className="figure text-[clamp(7rem,14vw,11rem)]">{valueOf(leader, statKey)}</span>
                  <span className="text-[15px] font-semibold text-haze">{label}</span>
                </p>
              </motion.div>
            </AnimatePresence>
          </section>
        )}

        <LeaderboardTable players={ranked} statKey={statKey} />
      </div>
    </div>
  );
}
