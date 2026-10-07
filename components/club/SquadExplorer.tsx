"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import type { Player, Position } from "@/lib/data";
import { groupByPosition } from "@/lib/data";
import SegmentedControl, { type SegmentedOption } from "./SegmentedControl";
import PlayerCard from "./PlayerCard";
import { RevealGroup, RevealItem } from "@/components/motion/Reveal";
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
    <div className="flex flex-col gap-16">
      <SegmentedControl options={options} value={filter} onChange={setFilter} layoutId="squad-filter" />

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={filter}
          className="flex flex-col gap-20"
          initial={{ opacity: 0, y: 16, filter: "blur(8px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, y: -8, filter: "blur(8px)" }}
          transition={{ duration: 0.45, ease: EASE_OUT }}
        >
          {visible.map((group) => (
            <section key={group.position} className="flex flex-col gap-8">
              <div className="flex items-baseline justify-between gap-6 border-b border-line pb-5">
                <h2 className="font-display text-4xl text-chalk sm:text-5xl">{POSITION_PLURAL[group.position]}</h2>
                <span className="tabular text-sm text-silver">
                  {group.players.length} {group.players.length === 1 ? "player" : "players"}
                </span>
              </div>
              <RevealGroup className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4" stagger={0.06}>
                {group.players.map((p) => (
                  <RevealItem key={p.id}>
                    <PlayerCard player={p} />
                  </RevealItem>
                ))}
              </RevealGroup>
            </section>
          ))}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
