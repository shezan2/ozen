"use client";

import { motion } from "motion/react";
import type { Match } from "@/lib/data";
import { parseScore } from "@/lib/data";
import Crest from "./Crest";
import OpponentCrest from "./OpponentCrest";

const ease = [0.19, 1, 0.22, 1] as const;

const container = { hidden: {}, show: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } } };
const side = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.8, ease } } };
const score = { hidden: { opacity: 0, scale: 0.94 }, show: { opacity: 1, scale: 1, transition: { duration: 0.9, ease } } };

/** The homepage opens on the scoreboard: the latest result, at full size. */
export default function HomeHero({ match }: { match: Match }) {
  const s = parseScore(match);
  const scorers = match.goals?.map((g) => (g.count > 1 ? `${g.player} ×${g.count}` : g.player)).join(", ");

  return (
    <section className="floodlight border-b border-line pt-32 pb-14 sm:pt-40 sm:pb-20">
      <h1 className="sr-only">Chèvre Noir Football Club</h1>
      <div className="mx-auto flex max-w-6xl flex-col gap-10 px-5 sm:px-8">
        <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
          <h2 className="type-name text-sm tracking-[0.06em] text-chalk">Latest result</h2>
          <p className="text-sm text-silver">
            {match.date}
            {match.location && <span className="text-silver-dim"> at {match.location}</span>}
          </p>
        </div>

        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 sm:gap-8"
        >
          <motion.div variants={side} className="flex flex-col items-center gap-4 text-center">
            <Crest size={112} priority className="size-16 sm:size-28" />
            <span className="type-display text-2xl sm:text-5xl">Chèvre Noir</span>
          </motion.div>

          <motion.div variants={score} className="flex flex-col items-center">
            {s ? (
              <p className="type-display tabular text-[5.5rem] sm:text-[10rem] lg:text-[12.5rem]" aria-label={`${s.for} – ${s.against}`}>
                {s.for}
                <span className="px-[0.08em] font-light text-silver-dim">–</span>
                {s.against}
              </p>
            ) : (
              <p className="type-display text-6xl text-silver">vs</p>
            )}
            <p className="type-name mt-1 text-sm tracking-[0.06em] text-silver">
              {match.result === "Upcoming" ? "Kick-off" : "Full time"}
            </p>
          </motion.div>

          <motion.div variants={side} className="flex flex-col items-center gap-4 text-center">
            <OpponentCrest name={match.opponent} size={96} className="h-[74px] w-16 sm:h-[110px] sm:w-24" />
            <span className="type-display text-2xl sm:text-5xl">{match.opponent}</span>
          </motion.div>
        </motion.div>

        {(match.summary || scorers) && (
          <div className="flex flex-col items-center gap-1 text-center text-sm">
            {match.summary && <p className="text-chalk">{match.summary}</p>}
            {scorers && <p className="text-silver">Chèvre Noir scorers: {scorers}</p>}
          </div>
        )}
      </div>
    </section>
  );
}
