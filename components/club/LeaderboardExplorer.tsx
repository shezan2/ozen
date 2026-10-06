"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import type { Player, LeaderboardKey } from "@/lib/data";
import { getLeaders } from "@/lib/data";
import SegmentedControl, { type SegmentedOption } from "./SegmentedControl";
import LeaderboardTable from "./LeaderboardTable";

const OPTIONS: SegmentedOption<LeaderboardKey>[] = [
  { value: "goals", label: "Goals" },
  { value: "assists", label: "Assists" },
  { value: "involvements", label: "Goal Involvements" },
  { value: "appearances", label: "Appearances" },
];

export default function LeaderboardExplorer({ players }: { players: Player[] }) {
  const [statKey, setStatKey] = useState<LeaderboardKey>("goals");

  const ranked = useMemo(() => getLeaders(players, statKey), [players, statKey]);

  return (
    <div className="flex flex-col gap-8">
      <SegmentedControl options={OPTIONS} value={statKey} onChange={setStatKey} layoutId="leaderboard-filter" />

      <AnimatePresence mode="wait">
        <motion.div
          key={statKey}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
        >
          <LeaderboardTable players={ranked} statKey={statKey} />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
