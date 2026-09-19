"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import type { Player, LeaderboardKey } from "@/lib/data";
import { getLeaders } from "@/lib/data";
import SegmentedControl, { type SegmentedOption } from "./SegmentedControl";
import Podium from "./Podium";
import LeaderboardTable from "./LeaderboardTable";

const OPTIONS: SegmentedOption<LeaderboardKey>[] = [
  { value: "goals", label: "Goals" },
  { value: "assists", label: "Assists" },
  { value: "involvements", label: "Goal Involvements" },
  { value: "appearances", label: "Appearances" },
];

function valueOf(p: Player, key: LeaderboardKey) {
  return key === "involvements" ? p.goals + p.assists : p[key];
}

export default function LeaderboardExplorer({ players }: { players: Player[] }) {
  const [statKey, setStatKey] = useState<LeaderboardKey>("goals");

  const ranked = useMemo(() => getLeaders(players, statKey), [players, statKey]);
  const qualifiers = ranked.filter((p) => valueOf(p, statKey) > 0);

  return (
    <div className="flex flex-col gap-10">
      <SegmentedControl options={OPTIONS} value={statKey} onChange={setStatKey} layoutId="leaderboard-filter" />

      <AnimatePresence mode="wait">
        <motion.div
          key={statKey}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col gap-10"
        >
          <Podium players={qualifiers} statKey={statKey} />
          <LeaderboardTable players={ranked} statKey={statKey} />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
