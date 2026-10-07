"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import type { Player, Position } from "@/lib/data";
import { groupByPosition } from "@/lib/data";
import SegmentedControl, { type SegmentedOption } from "./SegmentedControl";
import PlayerCard from "./PlayerCard";
import { EASE_OUT } from "@/lib/motion";

type Filter = "All" | Position;

const POSITION_PLURAL: Record<Position, string> = {
  Goalkeeper: "Goalkeepers",
  Defender: "Defenders",
  Midfielder: "Midfielders",
  Forward: "Forwards",
};

export default function SquadExplorer({ players }: { players: Player[] }) {
  const [filter, setFilter] = useState<Filter>("All");
  const groups = useMemo(() => groupByPosition(players), [players]);

  const options: SegmentedOption<Filter>[] = useMemo(
    () => [
      { value: "All", label: "All", count: players.length },
      ...groups.map((g) => ({ value: g.position, label: POSITION_PLURAL[g.position], count: g.players.length })),
    ],
    [groups, players.length]
  );

  const visible = filter === "All" ? groups : groups.filter((g) => g.position === filter);

  return (
    <div className="flex flex-col gap-14 sm:gap-16">
      <SegmentedControl options={options} value={filter} onChange={setFilter} layoutId="squad-filter" />

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={filter}
          className="flex flex-col gap-16 sm:gap-20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18, ease: EASE_OUT }}
        >
          {visible.map((group) => (
            <section key={group.position} className="flex flex-col gap-6 sm:gap-8">
              <div className="flex items-baseline justify-between gap-6">
                <h2 className="display text-[clamp(2.25rem,5vw,3.75rem)] text-white">{POSITION_PLURAL[group.position]}</h2>
                <span className="tabular text-sm font-semibold text-silver">
                  {group.players.length} {group.players.length === 1 ? "player" : "players"}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 lg:grid-cols-4 2xl:grid-cols-5">
                {group.players.map((p) => (
                  <PlayerCard key={p.id} player={p} />
                ))}
              </div>
            </section>
          ))}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
