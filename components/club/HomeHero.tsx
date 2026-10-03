"use client";

import Link from "next/link";
import { motion } from "motion/react";
import Crest from "./Crest";
import FormGuide from "./FormGuide";
import type { Match } from "@/lib/data";
import { club } from "@/lib/site";

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
};

const item = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const } },
};

const crestReveal = {
  hidden: { opacity: 0, scale: 0.8 },
  show: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] as const },
  },
};

export default function HomeHero({ form }: { form: Match["result"][] }) {
  return (
    <section className="hero-gradient relative overflow-hidden pt-32 pb-28 sm:pt-40 sm:pb-36">
      {/* Slowly drifting colour wash — a calm, continuous aurora, never static */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="animate-drift-a absolute -left-1/4 -top-1/3 h-[70%] w-[70%] rounded-full bg-blue/40 blur-[100px]" />
        <div className="animate-drift-b absolute -right-1/4 -top-1/4 h-[65%] w-[65%] rounded-full bg-blue-bright/25 blur-[110px]" />
        <div className="animate-drift-c absolute -bottom-1/3 left-1/4 h-[70%] w-[70%] rounded-full bg-blue-deep/50 blur-[110px]" />
      </div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="relative mx-auto flex max-w-3xl flex-col items-center gap-6 px-5 text-center sm:px-8"
      >
        <motion.div
          variants={crestReveal}
          className="flex size-24 shrink-0 items-center justify-center rounded-full bg-white/10 shadow-[0_20px_60px_-15px_rgba(34,70,160,0.65)] ring-1 ring-white/15 backdrop-blur-sm sm:size-28"
        >
          <Crest size={64} priority />
        </motion.div>

        <motion.p variants={item} className="eyebrow-on-navy">
          Founded {club.founded} · {club.season} Season
        </motion.p>

        <motion.h1
          variants={item}
          className="text-6xl leading-[1.02] font-semibold tracking-tight text-paper-ink sm:text-7xl md:text-8xl"
        >
          Chèvre <span className="text-blue-bright">Noir</span>
        </motion.h1>

        <motion.p variants={item} className="max-w-xl text-lg leading-relaxed text-paper-ink-dim">
          {club.motto}. Every squad member, every match, every stat — the complete record of our season.
        </motion.p>

        <motion.div variants={item} className="mt-2 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/squad"
            className="rounded-full bg-blue px-7 py-3 text-sm font-semibold text-white transition-colors duration-200 hover:bg-blue-deep"
          >
            View Squad
          </Link>
          <Link
            href="/matches"
            className="rounded-full bg-white/10 px-7 py-3 text-sm font-semibold text-paper-ink ring-1 ring-white/25 backdrop-blur-sm transition-colors duration-200 hover:bg-white/15"
          >
            Fixtures &amp; Results
          </Link>
        </motion.div>

        {form.length > 0 && (
          <motion.div variants={item} className="mt-6 flex flex-col items-center gap-3">
            <span className="text-xs font-medium tracking-wide text-paper-ink-faint uppercase">Recent Form</span>
            <FormGuide results={form} />
          </motion.div>
        )}
      </motion.div>
    </section>
  );
}
