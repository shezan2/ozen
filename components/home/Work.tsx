"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";
import Reveal from "@/components/ui/Reveal";
import SectionHeading from "@/components/ui/SectionHeading";
import { work } from "@/lib/content";

export default function Work() {
  const reduced = useReducedMotion();

  return (
    <section id="work" className="border-y border-line bg-canvas-raised">
      <div className="mx-auto max-w-6xl px-5 py-28 sm:px-8 sm:py-36">
        <SectionHeading
          eyebrow="Selected work"
          title="Built by ozen. Live right now."
          description="Every site we ship is custom-designed, obsessively fast, and built to win customers — see for yourself."
        />

        <div className="mt-20 flex flex-col gap-24">
          {work.map((project, i) => (
            <Reveal key={project.slug} amount={0.2}>
              <article
                className={`grid items-center gap-10 lg:grid-cols-12 ${
                  i % 2 === 1 ? "" : ""
                }`}
              >
                {/* Browser-chrome frame */}
                <a
                  href={project.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`group block lg:col-span-7 ${i % 2 === 1 ? "lg:order-2" : ""}`}
                  aria-label={`Visit ${project.title} — opens in a new tab`}
                >
                  <div className="overflow-hidden rounded-xl border border-line bg-surface shadow-[0_24px_80px_rgba(0,0,0,0.55)] transition-colors duration-500 group-hover:border-iris/40">
                    <div className="flex items-center gap-2 border-b border-line px-4 py-3">
                      <span className="h-2.5 w-2.5 rounded-full bg-[#3a3a41]" />
                      <span className="h-2.5 w-2.5 rounded-full bg-[#3a3a41]" />
                      <span className="h-2.5 w-2.5 rounded-full bg-[#3a3a41]" />
                      <span className="ml-3 truncate rounded-md bg-canvas px-3 py-1 font-mono text-[0.65rem] tracking-wider text-ink-faint">
                        {project.displayUrl}
                      </span>
                    </div>
                    <div className="relative aspect-[16/10] overflow-hidden">
                      <motion.div
                        className="absolute inset-0"
                        whileHover={reduced ? undefined : { scale: 1.04 }}
                        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                      >
                        <Image
                          src={project.image}
                          alt={`Screenshot of the ${project.title} website`}
                          fill
                          sizes="(min-width: 1024px) 640px, 100vw"
                          className="object-cover object-top"
                        />
                      </motion.div>
                    </div>
                  </div>
                </a>

                <div className={`lg:col-span-5 ${i % 2 === 1 ? "lg:order-1" : ""}`}>
                  <span className="font-mono text-xs tracking-[0.3em] text-ink-faint">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="mt-3 font-display text-3xl font-medium tracking-tight text-ink sm:text-4xl">
                    {project.title}
                  </h3>
                  <p className="mt-4 text-base leading-relaxed text-ink-dim">{project.blurb}</p>
                  <div className="mt-6 flex flex-wrap gap-2">
                    {project.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full border border-line px-3.5 py-1.5 font-mono text-[0.65rem] uppercase tracking-[0.15em] text-ink-dim"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <a
                    href={project.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-8 inline-flex items-center gap-2 font-mono text-[0.7rem] uppercase tracking-[0.25em] text-iris transition-colors hover:text-iris-bright"
                  >
                    Visit live site <span aria-hidden>↗</span>
                  </a>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
