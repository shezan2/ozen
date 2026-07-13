"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import SectionHeading from "@/components/ui/SectionHeading";
import { faqs } from "@/lib/content";

export default function Faq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const reduced = useReducedMotion();

  return (
    <section id="faq" className="border-t border-line bg-canvas-raised">
      <div className="mx-auto max-w-3xl px-5 py-28 sm:px-8 sm:py-36">
        <SectionHeading
          eyebrow="Questions"
          title="Answers, up front."
          align="center"
          className="items-center"
        />

        <div className="mt-14 flex flex-col divide-y divide-line border-y border-line">
          {faqs.map((faq, i) => {
            const open = openIndex === i;
            return (
              <div key={faq.question}>
                <button
                  type="button"
                  aria-expanded={open}
                  onClick={() => setOpenIndex(open ? null : i)}
                  className="flex w-full items-center justify-between gap-6 py-6 text-left transition-colors hover:text-iris-bright"
                >
                  <span className="font-display text-lg font-medium tracking-tight text-ink sm:text-xl">
                    {faq.question}
                  </span>
                  <motion.span
                    animate={{ rotate: open ? 45 : 0 }}
                    transition={{ duration: reduced ? 0 : 0.35, ease: [0.22, 1, 0.36, 1] }}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-line text-ink-dim"
                    aria-hidden
                  >
                    <svg viewBox="0 0 16 16" fill="none" className="h-3.5 w-3.5">
                      <path d="M8 2v12M2 8h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  </motion.span>
                </button>
                <AnimatePresence initial={false}>
                  {open && (
                    <motion.div
                      initial={reduced ? false : { height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={reduced ? undefined : { height: 0, opacity: 0 }}
                      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                      className="overflow-hidden"
                    >
                      <p className="pb-7 pr-14 text-sm leading-relaxed text-ink-dim sm:text-base">
                        {faq.answer}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
