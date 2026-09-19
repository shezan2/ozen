"use client";

import Link from "next/link";
import { motion } from "motion/react";
import Crest from "./Crest";
import FormGuide from "./FormGuide";
import type { Match } from "@/lib/data";
import { club } from "@/lib/site";

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.05 } },
};

const item = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const } },
};

export default function HomeHero({ form }: { form: Match["result"][] }) {
  return (
    <section className="relative overflow-hidden bg-noir pt-32 pb-20 sm:pt-44 sm:pb-28">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 50% -10%, rgba(231,201,136,0.14), transparent 55%), radial-gradient(circle at 85% 20%, rgba(231,201,136,0.06), transparent 45%)",
        }}
      />
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="relative mx-auto flex max-w-4xl flex-col items-center gap-7 px-5 text-center sm:px-8"
      >
        <motion.div variants={item}>
          <Crest size={104} priority className="drop-shadow-[0_8px_30px_rgba(231,201,136,0.18)]" />
        </motion.div>

        <motion.p variants={item} className="eyebrow-on-navy">
          Founded {club.founded} · {club.season} Season
        </motion.p>

        <motion.h1
          variants={item}
          className="text-5xl font-semibold tracking-tight text-paper-ink sm:text-6xl md:text-7xl"
        >
          Chèvre Noir <span className="gold-text">Football Club</span>
        </motion.h1>

        <motion.p variants={item} className="max-w-xl text-lg leading-relaxed text-paper-ink-dim">
          {club.motto}. Every squad member, every match, every stat — the complete record of our season.
        </motion.p>

        <motion.div variants={item} className="mt-2 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/squad"
            className="rounded-full bg-gold px-7 py-3 text-sm font-semibold text-noir transition-transform duration-300 hover:scale-[1.03] hover:bg-gold-bright"
          >
            View Squad
          </Link>
          <Link
            href="/matches"
            className="rounded-full border border-line-on-navy-strong px-7 py-3 text-sm font-semibold text-paper-ink transition-colors duration-300 hover:bg-white/5"
          >
            Fixtures &amp; Results
          </Link>
        </motion.div>

        {form.length > 0 && (
          <motion.div variants={item} className="mt-6 flex flex-col items-center gap-3">
            <span className="text-xs font-medium uppercase tracking-[0.14em] text-paper-ink-faint">
              Recent Form
            </span>
            <FormGuide results={form} />
          </motion.div>
        )}
      </motion.div>
    </section>
  );
}
