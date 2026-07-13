"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import BlurText from "@/components/BlurText";
import OzenLogo from "@/components/brand/OzenLogo";
import StarBorder from "@/components/StarBorder";
import MagneticButton from "@/components/ui/MagneticButton";

export default function Hero() {
  const reduced = useReducedMotion();

  return (
    <section className="relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden px-5 pt-16">
      {/* Aurora glow — pure CSS (transform/opacity only), cheap on every GPU */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <div className="absolute left-1/2 top-[18%] h-[460px] w-[760px] -translate-x-1/2 animate-aurora rounded-full bg-iris/14 blur-3xl" />
        <div
          className="absolute left-[16%] top-[52%] h-[380px] w-[520px] animate-aurora rounded-full bg-spectral-a/8 blur-3xl"
          style={{ animationDelay: "-9s", animationDuration: "24s" }}
        />
        <div
          className="absolute right-[10%] top-[30%] h-[340px] w-[480px] animate-aurora rounded-full bg-iris-deep/12 blur-3xl"
          style={{ animationDelay: "-15s", animationDuration: "28s" }}
        />
      </div>
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,var(--canvas)_82%)]"
        aria-hidden
      />

      <div className="relative z-10 flex max-w-4xl flex-col items-center text-center">
        <OzenLogo size={124} animated={!reduced} idle withWordmark className="text-ink" />

        <div className="mt-8 flex flex-col items-center">
          <BlurText
            text="Websites that make your business"
            animateBy="words"
            delay={90}
            className="justify-center font-display text-4xl font-medium leading-[1.1] tracking-tight text-ink sm:text-5xl lg:text-6xl"
          />
          {/* Single element so the gradient text-clip survives (per-word filters break it) */}
          <motion.p
            initial={reduced ? false : { opacity: 0, y: 24, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ delay: 0.7, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="spectral-text font-display text-4xl font-medium leading-[1.2] tracking-tight sm:text-5xl lg:text-6xl"
          >
            impossible to ignore.
          </motion.p>
        </div>

        <motion.p
          initial={reduced ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="mt-7 max-w-xl text-base leading-relaxed text-ink-dim sm:text-lg"
        >
          Bad website? No website? We design and build premium, lightning-fast
          sites for businesses ready to look the part — one flat price, live in weeks.
        </motion.p>

        <motion.div
          initial={reduced ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="mt-10 flex flex-col items-center gap-5 sm:flex-row"
        >
          <MagneticButton>
            <StarBorder as={Link} href="/book" color="var(--iris)" speed="5s">
              Book a free call
            </StarBorder>
          </MagneticButton>
          <Link
            href="/#work"
            className="font-mono text-[0.7rem] uppercase tracking-[0.25em] text-ink-dim transition-colors hover:text-ink"
          >
            See the work ↓
          </Link>
        </motion.div>
      </div>

      <motion.div
        initial={reduced ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.2, duration: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        aria-hidden
      >
        <span className="block h-10 w-px animate-pulse-soft bg-gradient-to-b from-transparent via-iris/70 to-transparent" />
      </motion.div>
    </section>
  );
}
