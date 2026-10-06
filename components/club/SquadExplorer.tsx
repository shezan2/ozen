"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import type { Player, Position } from "@/lib/data";
import { groupByPosition, POSITION_SHORT } from "@/lib/data";
import SegmentedControl, { type SegmentedOption } from "./SegmentedControl";

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

  const numbers = useMemo(() => {
    const map = new Map<string, number>();
    let n = 1;
    for (const g of groups) for (const p of g.players) map.set(p.id, n++);
    return map;
  }, [groups]);

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

      <div className="flex flex-col gap-12">
        <AnimatePresence mode="popLayout" initial={false}>
          {visibleGroups.map((group) => (
            <motion.section
              key={group.position}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col"
            >
              <div className="flex items-baseline gap-2.5 pb-3">
                <h3 className="font-serif text-xl font-semibold text-ink">{POSITION_PLURAL[group.position]}</h3>
                <span className="text-sm text-ink-faint">{group.players.length}</span>
              </div>

              <div className="border-t border-line">
                <div className="flex gap-4 border-b border-line py-2 text-xs font-medium text-ink-faint">
                  <span className="w-7 shrink-0">#</span>
                  <span className="flex-1">Player</span>
                  <span className="hidden w-10 shrink-0 text-right sm:block">App</span>
                  <span className="hidden w-10 shrink-0 text-right sm:block">Gls</span>
                  <span className="hidden w-10 shrink-0 text-right sm:block">Ast</span>
                </div>
                {group.players.map((player) => (
                  <div key={player.id} className="flex items-center gap-4 border-b border-line py-3 last:border-0">
                    <span className="tabular w-7 shrink-0 text-sm text-ink-faint">{numbers.get(player.id)}</span>
                    <div className="flex min-w-0 flex-1 flex-col gap-0.5 sm:flex-row sm:items-baseline sm:gap-2.5">
                      <span className="truncate font-serif text-base font-medium text-ink">{player.name}</span>
                      <span className="text-xs text-ink-faint sm:hidden">{POSITION_SHORT[player.position]}</span>
                    </div>
                    <span className="tabular hidden w-10 shrink-0 text-right text-sm text-ink-dim sm:block">
                      {player.appearances || "—"}
                    </span>
                    <span className="tabular hidden w-10 shrink-0 text-right text-sm text-ink-dim sm:block">
                      {player.appearances ? player.goals : "—"}
                    </span>
                    <span className="tabular hidden w-10 shrink-0 text-right text-sm text-ink-dim sm:block">
                      {player.appearances ? player.assists : "—"}
                    </span>
                  </div>
                ))}
              </div>
            </motion.section>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
