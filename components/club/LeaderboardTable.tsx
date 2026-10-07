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

/** Ranked table on one flat block; the sorted column runs in club blue instead of rules between rows.
 *  Rows glide to their new places when the ranking changes. */
export default function LeaderboardTable({ players, statKey }: { players: Player[]; statKey: LeaderboardKey }) {
  return (
    <div className="overflow-x-auto bg-navy">
      <table className="w-full min-w-[20rem] border-collapse text-left">
        <thead>
          <tr className="text-xs font-semibold text-silver sm:text-sm">
            <th scope="col" className="w-14 py-4 pl-4 font-semibold sm:w-20 sm:pl-6">
              Rank
            </th>
            <th scope="col" className="py-4 pr-3 font-semibold">
              Player
            </th>
            <th scope="col" className="hidden w-20 py-4 font-semibold sm:table-cell">
              Position
            </th>
            {COLUMNS.map((c) => (
              <th
                key={c.key}
                scope="col"
                className={cn(
                  "w-12 py-4 pr-3 text-right font-semibold transition-colors duration-200 last:pr-4 sm:w-20 sm:pr-4 sm:last:pr-6",
                  c.key === statKey && "bg-blue text-white"
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
              transition={{ type: "spring", stiffness: 300, damping: 34 }}
              className="transition-colors duration-200 hover:bg-navy-2"
            >
              <td className="py-3.5 pl-4 sm:pl-6">
                {i === 0 ? (
                  <span
                    aria-label="Rank 1"
                    className="tabular flex size-7 items-center justify-center rounded-full bg-gold text-xs font-bold text-noir sm:size-8 sm:text-sm"
                  >
                    1
                  </span>
                ) : (
                  <span className="tabular flex size-7 items-center justify-center text-xs text-mist sm:size-8 sm:text-sm">{i + 1}</span>
                )}
              </td>
              <th scope="row" className="display py-3.5 pr-3 text-[1.35rem] leading-none text-white sm:text-[1.6rem]">
                {p.name}
              </th>
              <td className="hidden py-3.5 text-sm text-silver sm:table-cell">{POSITION_SHORT[p.position]}</td>
              {COLUMNS.map((c) => (
                <td
                  key={c.key}
                  className={cn(
                    "tabular py-3.5 pr-3 text-right transition-colors duration-200 last:pr-4 sm:pr-4 sm:last:pr-6",
                    c.key === statKey ? "bg-blue text-lg font-bold text-white" : "text-sm text-silver sm:text-[15px]"
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
