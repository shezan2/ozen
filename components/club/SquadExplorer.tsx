"use client";

import { useMemo, useState } from "react";
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
      ...groups.map((g) => ({ value: g.position, label: POSITION_PLURAL[g.position], count: g.players.length })),
    ],
    [groups, players.length]
  );

  const visible = filter === "All" ? groups : groups.filter((g) => g.position === filter);

  return (
    <div className="flex flex-col gap-12">
      <SegmentedControl options={options} value={filter} onChange={setFilter} layoutId="squad-filter" />

      {visible.map((group) => (
        <section key={group.position} className="flex flex-col gap-6">
          <h2 className="type-title text-3xl sm:text-4xl">{POSITION_PLURAL[group.position]}</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {group.players.map((p) => (
              <PlayerCard key={p.id} player={p} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
