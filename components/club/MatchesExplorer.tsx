"use client";

import { useMemo, useState } from "react";
import type { Match } from "@/lib/data";
import SegmentedControl, { type SegmentedOption } from "./SegmentedControl";
import MatchCard from "./MatchCard";

type Filter = "All" | Match["result"];

const FILTER_LABEL: Record<Match["result"], string> = {
  W: "Wins",
  D: "Draws",
  L: "Losses",
  Upcoming: "Upcoming",
};

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function monthOf(date: string) {
  return MONTHS.find((m) => date.includes(m)) ?? "Date not recorded";
}

export default function MatchesExplorer({ matches }: { matches: Match[] }) {
  const [filter, setFilter] = useState<Filter>("All");

  const options: SegmentedOption<Filter>[] = useMemo(() => {
    const present = (["W", "D", "L", "Upcoming"] as const).filter((r) => matches.some((m) => m.result === r));
    return [
      { value: "All", label: "All", count: matches.length },
      ...present.map((r) => ({ value: r, label: FILTER_LABEL[r], count: matches.filter((m) => m.result === r).length })),
    ];
  }, [matches]);

  const months = useMemo(() => {
    const groups: { month: string; items: { match: Match; matchday: number }[] }[] = [];
    matches
      .map((match, i) => ({ match, matchday: i + 1 }))
      .reverse()
      .filter(({ match }) => filter === "All" || match.result === filter)
      .forEach((item) => {
        const month = monthOf(item.match.date);
        const last = groups[groups.length - 1];
        if (last?.month === month) last.items.push(item);
        else groups.push({ month, items: [item] });
      });
    return groups;
  }, [matches, filter]);

  return (
    <div className="flex flex-col gap-12">
      <SegmentedControl options={options} value={filter} onChange={setFilter} layoutId="matches-filter" />

      {months.map(({ month, items }) => (
        <section key={month} className="flex flex-col gap-4">
          <h3 className="type-title text-2xl sm:text-3xl">{month}</h3>
          <div className="flex flex-col gap-px bg-line">
            {items.map(({ match, matchday }) => (
              <MatchCard key={match.id} match={match} matchday={matchday} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
