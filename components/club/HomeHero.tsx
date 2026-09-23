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
  hidden: { opacity: 0, scale: 0.7, rotate: -8 },
  show: {
    opacity: 1,
    scale: 1,
    rotate: 0,
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] as const },
  },
};

export default function HomeHero({ form }: { form: Match["result"][] }) {
  return (
    <section className="clip-diagonal-b hero-gradient relative overflow-hidden pt-28 pb-36 sm:pt-32 sm:pb-48">
      {/* Slowly drifting colour blobs — the "constantly moving" gradient */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="animate-drift-a absolute -left-1/4 -top-1/3 h-[70%] w-[70%] rounded-full bg-blue/40 blur-[100px]" />
        <div className="animate-drift-b absolute -right-1/4 -top-1/4 h-[65%] w-[65%] rounded-full bg-blue-bright/25 blur-[110px]" />
        <div className="animate-drift-c absolute -bottom-1/3 left-1/4 h-[70%] w-[70%] rounded-full bg-blue-deep/50 blur-[110px]" />
      </div>

      {/* Intro light sweep */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 w-1/4 -skew-x-12 bg-white/25 mix-blend-overlay"
        initial={{ x: "-140%" }}
        animate={{ x: "500%" }}
        transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
      />

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="relative mx-auto flex max-w-4xl flex-col items-center gap-6 px-5 text-center sm:px-8"
      >
        <motion.div
          variants={crestReveal}
          className="relative flex shrink-0 items-center justify-center"
          style={{ width: 182, height: 182 }}
        >
          <div aria-hidden className="absolute inset-0 -z-10 m-auto rotate-45 bg-blue" style={{ width: 128, height: 128 }} />
          <Crest size={100} priority />
        </motion.div>

        <motion.p variants={item} className="eyebrow-on-navy">
          Founded {club.founded} · {club.season} Season
        </motion.p>

        <motion.h1
          variants={item}
          className="font-display text-6xl leading-[0.92] uppercase tracking-tight text-paper-ink sm:text-8xl md:text-9xl"
        >
          {/* Anton's grave-accent glyph sits too high at this display size — spelled out for screen readers via aria-label instead. */}
          <span aria-label="Chèvre Noir">
            Chevre <span className="blue-text">Noir</span>
          </span>
        </motion.h1>

        <motion.p variants={item} className="max-w-xl text-lg leading-relaxed text-paper-ink-dim">
          {club.motto}. Every squad member, every match, every stat — the complete record of our season.
        </motion.p>

        <motion.div variants={item} className="mt-2 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/squad"
            className="bg-blue px-8 py-3.5 text-sm font-bold uppercase tracking-wide text-paper-ink transition-transform duration-200 hover:-translate-y-0.5 hover:bg-blue-deep"
          >
            View Squad
          </Link>
          <Link
            href="/matches"
            className="border-2 border-paper-ink px-8 py-3.5 text-sm font-bold uppercase tracking-wide text-paper-ink transition-colors duration-200 hover:bg-white/10"
          >
            Fixtures &amp; Results
          </Link>
        </motion.div>

        {form.length > 0 && (
          <motion.div variants={item} className="mt-6 flex flex-col items-center gap-3">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-paper-ink-faint">Recent Form</span>
            <FormGuide results={form} />
          </motion.div>
        )}
      </motion.div>
    </section>
  );
}
