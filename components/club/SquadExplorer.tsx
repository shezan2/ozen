"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import type { Player, Position } from "@/lib/data";
import { groupByPosition } from "@/lib/data";
import SegmentedControl, { type SegmentedOption } from "./SegmentedControl";
import PlayerCard from "./PlayerCard";

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
      ...groups.map((g) => ({
        value: g.position,
        label: POSITION_PLURAL[g.position],
        count: g.players.length,
      })),
    ],
    [groups, players.length]
  );

  const visibleGroups = filter === "All" ? groups : groups.filter((g) => g.position === filter);

  return (
    <div className="flex flex-col gap-10">
      <SegmentedControl options={options} value={filter} onChange={setFilter} layoutId="squad-filter" />

      <div className="flex flex-col gap-14">
        <AnimatePresence mode="popLayout" initial={false}>
          {visibleGroups.map((group) => (
            <motion.section
              key={group.position}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col gap-5"
            >
              <div className="flex items-baseline gap-3 border-b-2 border-noir pb-2">
                <h3 className="font-display text-2xl uppercase tracking-tight text-ink">
                  {POSITION_PLURAL[group.position]}
                </h3>
                <span className="font-display text-lg text-ink-faint">{group.players.length}</span>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {group.players.map((player) => (
                  <PlayerCard key={player.id} player={player} />
                ))}
              </div>
            </motion.section>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
