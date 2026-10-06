"use client";

import { useMemo, useState } from "react";
import type { Player, LeaderboardKey } from "@/lib/data";
import { getLeaders } from "@/lib/data";
import SegmentedControl, { type SegmentedOption } from "./SegmentedControl";
import LeaderboardTable from "./LeaderboardTable";
import PlayerPortrait from "./PlayerPortrait";

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
  const label = OPTIONS.find((o) => o.value === statKey)!.label;

  return (
    <div className="flex flex-col gap-10">
      <SegmentedControl options={OPTIONS} value={statKey} onChange={setStatKey} layoutId="leaderboard-filter" />

      {leader && (
        <section aria-label={`${label} leader`} className="grid grid-cols-[7rem_1fr] border-t-2 border-gold bg-field-2 sm:grid-cols-[13rem_1fr]">
          <PlayerPortrait className="h-full w-full" />
          <div className="flex flex-col justify-between gap-6 p-5 sm:flex-row sm:items-end sm:p-8">
            <div className="flex flex-col gap-2">
              <p className="text-sm text-silver">Leading for {label.toLowerCase()}</p>
              <p className="type-display text-5xl sm:text-7xl">{leader.name}</p>
              <p className="text-sm text-silver">{leader.position}</p>
            </div>
            <p className="flex items-baseline gap-3">
              <span className="type-display tabular text-7xl sm:text-9xl">{valueOf(leader, statKey)}</span>
              <span className="text-sm text-silver">{label.toLowerCase()}</span>
            </p>
          </div>
        </section>
      )}

      <LeaderboardTable players={ranked} statKey={statKey} />
    </div>
  );
}
