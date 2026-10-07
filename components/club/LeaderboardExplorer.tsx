"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import type { Player, LeaderboardKey } from "@/lib/data";
import { getLeaders } from "@/lib/data";
import SegmentedControl, { type SegmentedOption } from "./SegmentedControl";
import LeaderboardTable from "./LeaderboardTable";
import CountUp from "@/components/motion/CountUp";
import Reveal from "@/components/motion/Reveal";
import Monogram from "./Monogram";
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
    <div className="flex flex-col gap-10">
      <SegmentedControl options={OPTIONS} value={statKey} onChange={setStatKey} layoutId="leaderboard-filter" />

      {leader && (
        <Reveal>
          <section
            aria-label={`Leader for ${label}`}
            className="glass spotlight grid overflow-hidden rounded-[2rem] backdrop-blur-2xl sm:grid-cols-[minmax(0,15rem)_1fr]"
          >
            <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden border-line sm:aspect-auto sm:border-r">
              <div
                aria-hidden
                className="absolute inset-0 bg-[radial-gradient(ellipse_90%_70%_at_50%_0%,rgba(43,79,176,0.45),transparent_72%)]"
              />
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.div
                  key={leader.id}
                  initial={{ opacity: 0, scale: 0.9, filter: "blur(8px)" }}
                  animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                  exit={{ opacity: 0, scale: 1.06, filter: "blur(8px)" }}
                  transition={{ duration: 0.6, ease: EASE_OUT }}
                >
                  <Monogram name={leader.name} className="size-32 text-[4.5rem] sm:size-40 sm:text-[5.5rem]" />
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="flex flex-col justify-between gap-10 p-7 sm:flex-row sm:items-end sm:p-12">
              <div className="flex flex-col gap-4">
                <p className="flex items-center gap-3 text-sm text-silver">
                  <span className="flex size-7 items-center justify-center rounded-full text-xs text-gold ring-1 ring-gold/70">1</span>
                  Leading for {label}
                </p>
                <AnimatePresence mode="wait" initial={false}>
                  <motion.p
                    key={leader.id}
                    initial={{ opacity: 0, y: 14, filter: "blur(6px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    exit={{ opacity: 0, y: -10, filter: "blur(6px)" }}
                    transition={{ duration: 0.45, ease: EASE_OUT }}
                    className="font-display text-6xl leading-none text-chalk sm:text-7xl"
                  >
                    {leader.name}
                  </motion.p>
                </AnimatePresence>
                <p className="text-[15px] text-silver">{leader.position}</p>
              </div>
              <p className="flex items-baseline gap-3">
                <CountUp value={valueOf(leader, statKey)} className="figure text-8xl leading-none text-chalk sm:text-9xl" />
                <span className="text-[15px] text-silver">{label}</span>
              </p>
            </div>
          </section>
        </Reveal>
      )}

      <LeaderboardTable players={ranked} statKey={statKey} />
    </div>
  );
}
