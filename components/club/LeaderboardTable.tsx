"use client";

import { motion } from "motion/react";
import type { Player, LeaderboardKey } from "@/lib/data";
import { POSITION_SHORT } from "@/lib/data";
import { cn } from "@/lib/utils";

const COLUMNS: { key: LeaderboardKey; label: string; title: string }[] = [
  { key: "appearances", label: "Apps", title: "Appearances" },
  { key: "goals", label: "Goals", title: "Goals" },
  { key: "assists", label: "Assists", title: "Assists" },
  { key: "involvements", label: "G+A", title: "Goal involvements" },
];

function valueOf(p: Player, key: LeaderboardKey) {
  return key === "involvements" ? p.goals + p.assists : p[key];
}

/** Ranked table; rows glide to their new places when the ranking changes. */
export default function LeaderboardTable({ players, statKey }: { players: Player[]; statKey: LeaderboardKey }) {
  return (
    <div className="glass overflow-x-auto rounded-[1.75rem] backdrop-blur-xl">
      <table className="w-full min-w-[20rem] border-collapse text-left">
        <thead>
          <tr className="border-b border-line text-xs text-silver sm:text-sm">
            <th scope="col" className="w-14 py-5 pl-4 font-normal sm:w-24 sm:pl-8">
              Rank
            </th>
            <th scope="col" className="py-5 pr-4 font-normal">
              Player
            </th>
            <th scope="col" className="hidden w-32 py-5 font-normal sm:table-cell">
              Position
            </th>
            {COLUMNS.map((c) => (
              <th
                key={c.key}
                scope="col"
                className={cn(
                  "w-12 py-5 text-right font-normal transition-colors duration-300 last:pr-4 sm:w-24 sm:last:pr-8",
                  c.key === statKey && "text-chalk"
                )}
              >
                <abbr title={c.title} className="no-underline">
                  {c.label}
                </abbr>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {players.map((p, i) => (
            <motion.tr
              key={p.id}
              layout="position"
              transition={{ type: "spring", stiffness: 260, damping: 32 }}
              className="border-b border-line transition-colors duration-300 last:border-0 hover:bg-white/[0.03]"
            >
              <td className="py-4 pl-4 sm:pl-8">
                <span
                  className={cn(
                    "tabular flex size-7 items-center justify-center rounded-full text-xs sm:size-8 sm:text-sm",
                    i === 0 ? "text-gold ring-1 ring-gold/70" : "text-mist"
                  )}
                >
                  {i + 1}
                </span>
              </td>
              <th scope="row" className="py-4 pr-3 font-display text-lg font-normal text-chalk sm:pr-4 sm:text-xl">
                {p.name}
              </th>
              <td className="hidden py-4 text-sm text-silver sm:table-cell">{POSITION_SHORT[p.position]}</td>
              {COLUMNS.map((c) => (
                <td
                  key={c.key}
                  className={cn(
                    "tabular py-4 text-right last:pr-4 sm:last:pr-8",
                    c.key === statKey ? "figure text-2xl text-chalk" : "text-sm text-silver sm:text-[15px]"
                  )}
                >
                  {valueOf(p, c.key)}
                </td>
              ))}
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
