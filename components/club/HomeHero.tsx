"use client";

import { useRef } from "react";
import { ArrowDown } from "lucide-react";
import { motion, useScroll, useSpring, useTransform } from "motion/react";
import Crest from "./Crest";
import Magnetic from "@/components/motion/Magnetic";
import PillLink from "@/components/ui/PillLink";
import { useIntroDone } from "@/components/motion/Intro";
import { scrollToTarget } from "@/lib/lenis";
import { EASE_OUT } from "@/lib/motion";
import { club } from "@/lib/site";
import { cn } from "@/lib/utils";

const TILT = { stiffness: 110, damping: 18, mass: 0.6 };

/** The stage: the club's name set across the floodlit pitch with the crest held between the words. */
export default function HomeHero({ nextSectionId }: { nextSectionId: string }) {
  const ref = useRef<HTMLElement>(null);
  const ready = useIntroDone();

  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const lockupY = useTransform(scrollYProgress, [0, 1], ["0%", "-22%"]);
  const crestScale = useTransform(scrollYProgress, [0, 1], [1, 0.84]);
  const fade = useTransform(scrollYProgress, [0, 0.75], [1, 0]);

  const rotateX = useSpring(0, TILT);
  const rotateY = useSpring(0, TILT);
  const onPointerMove = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    rotateY.set((e.clientX / window.innerWidth - 0.5) * 18);
    rotateX.set(-(e.clientY / window.innerHeight - 0.5) * 14);
  };
  const onPointerLeave = () => {
    rotateX.set(0);
    rotateY.set(0);
  };

  return (
    <section
      ref={ref}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      className="relative flex h-[100svh] min-h-[640px] flex-col overflow-hidden"
    >
      <h1 className="sr-only">{club.fullName}</h1>

      <motion.div
        aria-hidden
        style={{ opacity: fade }}
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_44%_64%_at_50%_-8%,rgba(43,79,176,0.6),rgba(43,79,176,0.12)_55%,transparent_78%)]"
      />

      <motion.div style={{ y: lockupY, opacity: fade }} className="relative flex flex-1 items-center justify-center px-4 pt-20">
        {/* The crest holds the page's centre line; the words flank it. */}
        <div
          aria-hidden
          className="grid w-full grid-cols-1 items-center justify-items-center gap-5 sm:grid-cols-[1fr_auto_1fr] sm:gap-[2vw]"
        >
          <Word text="Chèvre" ready={ready} delay={0.35} className="sm:justify-self-end" />

          <motion.div style={{ scale: crestScale }} className="relative w-[clamp(150px,15vw,230px)] shrink-0">
            <CrestRing ready={ready} />
            <motion.div
              initial={{ opacity: 0, scale: 0.82, filter: "blur(16px)" }}
              animate={ready ? { opacity: 1, scale: 1, filter: "blur(0px)" } : undefined}
              transition={{ duration: 1.5, ease: EASE_OUT, delay: 0.15 }}
              style={{ transformPerspective: 900 }}
            >
              <motion.div style={{ rotateX, rotateY }}>
                <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}>
                  <Crest size={500} priority className="size-full drop-shadow-[0_30px_60px_rgba(43,79,176,0.5)]" />
                </motion.div>
              </motion.div>
            </motion.div>
            <div className="absolute -bottom-[22%] left-1/2 h-[14%] w-[95%] -translate-x-1/2 rounded-[50%] bg-[radial-gradient(closest-side,rgba(43,79,176,0.6),transparent)] blur-md" />
          </motion.div>

          <Word text="Noir" ready={ready} delay={0.5} className="sm:justify-self-start" />
        </div>
      </motion.div>

      <motion.div
        className="relative mx-auto flex w-full max-w-[88rem] items-end justify-between gap-8 px-5 pb-8 sm:px-10 sm:pb-10"
        initial={{ opacity: 0, y: 24 }}
        animate={ready ? { opacity: 1, y: 0 } : undefined}
        transition={{ duration: 1.1, ease: EASE_OUT, delay: 0.9 }}
      >
        <div className="flex max-w-md flex-col gap-6">
          <p className="text-[15px] leading-relaxed text-silver">
            The official home of {club.fullName}. Every player, every match and every goal of the {club.season} season.
          </p>
          <div className="flex flex-wrap gap-3">
            <Magnetic>
              <PillLink href="/squad">View the squad</PillLink>
            </Magnetic>
            <Magnetic>
              <PillLink href="/matches" variant="glass">
                View results
              </PillLink>
            </Magnetic>
          </div>
        </div>
        <Magnetic strength={0.4} className="max-sm:hidden">
          <button
            onClick={() => {
              const next = document.getElementById(nextSectionId);
              if (next) scrollToTarget(next);
            }}
            aria-label="Scroll to the latest result"
            className="glass flex size-14 items-center justify-center rounded-full text-chalk backdrop-blur-xl transition-colors hover:border-line-strong"
          >
            <ArrowDown className="size-5" />
          </button>
        </Magnetic>
      </motion.div>
    </section>
  );
}

function Word({ text, ready, delay, className }: { text: string; ready: boolean; delay: number; className?: string }) {
  return (
    <span
      className={cn(
        "reveal-mask font-display text-[clamp(4rem,8.4vw,9.5rem)] leading-none tracking-[0.01em] text-chalk uppercase lg:opsz-36",
        className
      )}
    >
      <motion.span
        className="block"
        initial={{ y: "110%" }}
        animate={ready ? { y: "0%" } : undefined}
        transition={{ duration: 1.3, ease: EASE_OUT, delay }}
      >
        {text}
      </motion.span>
    </span>
  );
}

/** The badge's gold ring, with a point of light travelling slowly around it. */
function CrestRing({ ready }: { ready: boolean }) {
  return (
    <motion.svg
      aria-hidden
      viewBox="0 0 200 200"
      className="pointer-events-none absolute -inset-[14%] size-[128%] overflow-visible"
      initial={{ opacity: 0 }}
      animate={ready ? { opacity: 1 } : undefined}
      transition={{ duration: 1.6, delay: 0.6 }}
    >
      <circle cx="100" cy="100" r="98" fill="none" stroke="var(--gold)" strokeOpacity="0.35" strokeWidth="0.5" />
      <motion.g
        animate={{ rotate: 360 }}
        transition={{ duration: 14, repeat: Infinity, ease: "linear" }}
      >
        <circle
          cx="100"
          cy="100"
          r="98"
          fill="none"
          stroke="var(--gold)"
          strokeWidth="1"
          strokeLinecap="round"
          strokeDasharray="34 582"
        />
      </motion.g>
    </motion.svg>
  );
}
