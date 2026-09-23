"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
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
  const sectionRef = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end start"] });
  const wedgeY = useTransform(scrollYProgress, [0, 1], [0, reduced ? 0 : 90]);

  return (
    <section
      ref={sectionRef}
      className="clip-diagonal-b relative overflow-hidden bg-noir pt-28 pb-36 sm:pt-32 sm:pb-48"
    >
      {/* Gold diagonal wedge, bleeding off the top-right corner */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -right-1/4 -top-1/3 h-[160%] w-2/3 -skew-x-12 bg-gold sm:-right-1/3 sm:w-1/2"
        style={{ y: wedgeY }}
      />

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
          <div aria-hidden className="absolute inset-0 -z-10 m-auto rotate-45 bg-gold" style={{ width: 128, height: 128 }} />
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
            Chevre <span className="gold-text">Noir</span>
          </span>
        </motion.h1>

        <motion.p variants={item} className="max-w-xl text-lg leading-relaxed text-paper-ink-dim">
          {club.motto}. Every squad member, every match, every stat — the complete record of our season.
        </motion.p>

        <motion.div variants={item} className="mt-2 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/squad"
            className="bg-gold px-8 py-3.5 text-sm font-bold uppercase tracking-wide text-noir transition-transform duration-200 hover:-translate-y-0.5 hover:bg-gold-bright"
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
