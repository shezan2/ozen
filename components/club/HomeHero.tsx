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
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.19, 1, 0.22, 1] as const } },
};

export default function HomeHero({ form }: { form: Match["result"][] }) {
  return (
    <section className="border-b border-line pt-28 pb-14 sm:pt-36 sm:pb-20">
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="mx-auto flex max-w-5xl flex-col gap-8 px-5 sm:px-8"
      >
        <motion.div variants={item} className="flex items-center gap-4">
          <Crest size={44} priority />
          <span className="text-sm text-ink-dim">
            Est. {club.founded} · {club.season} Season
          </span>
        </motion.div>

        <motion.h1
          variants={item}
          className="font-serif text-6xl leading-[0.98] font-semibold tracking-tight text-ink sm:text-7xl md:text-8xl"
        >
          Chèvre Noir
          <br />
          Football Club
        </motion.h1>

        <motion.div variants={item} className="flex max-w-xl flex-col gap-2">
          <p className="font-serif text-xl italic text-navy">{club.motto}.</p>
          <p className="text-base leading-relaxed text-ink-dim">
            Every squad member, every match, every stat — the complete record of our season.
          </p>
        </motion.div>

        <motion.div variants={item} className="flex flex-wrap items-center gap-x-8 gap-y-3">
          <Link href="/squad" className="border-b border-ink pb-0.5 text-sm font-medium text-ink transition-colors hover:border-navy hover:text-navy">
            View squad
          </Link>
          <Link
            href="/matches"
            className="border-b border-transparent pb-0.5 text-sm text-ink-dim transition-colors hover:border-ink-dim hover:text-ink"
          >
            Fixtures &amp; results
          </Link>
        </motion.div>

        {form.length > 0 && (
          <motion.div variants={item} className="mt-2 flex flex-col gap-2.5">
            <span className="text-xs text-ink-faint">Recent form</span>
            <FormGuide results={form} />
          </motion.div>
        )}
      </motion.div>
    </section>
  );
}
