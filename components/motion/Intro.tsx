"use client";

import { createContext, useContext, useEffect, useState, useSyncExternalStore, type ReactNode } from "react";
import { motion } from "motion/react";
import Crest from "@/components/club/Crest";
import { getLenis } from "@/lib/lenis";
import { EASE_IN_OUT, EASE_OUT, INTRO_STORAGE_KEY } from "@/lib/motion";

/** True once the stage is visible — entrance animations wait for it. */
const IntroContext = createContext(false);
export const useIntroDone = () => useContext(IntroContext);

const HOLD_MS = 1700;
const noSubscribe = () => () => {};

export function IntroProvider({ children }: { children: ReactNode }) {
  // Both read browser state the boot script settled before paint; the server renders the intro covering.
  const hydrated = useSyncExternalStore(noSubscribe, () => true, () => false);
  const seen = useSyncExternalStore(
    noSubscribe,
    () => document.documentElement.dataset.intro === "seen",
    () => false
  );
  const [stage, setStage] = useState<"hold" | "leaving" | "gone">("hold");

  const playing = hydrated && !seen;
  const done = seen || stage !== "hold";

  useEffect(() => {
    if (!playing) return;
    const root = document.documentElement;
    try {
      sessionStorage.setItem(INTRO_STORAGE_KEY, "1");
    } catch {}
    root.classList.add("intro-playing");
    getLenis()?.stop();

    // Any interaction skips straight to the stage.
    const events = ["pointerdown", "keydown", "wheel", "touchstart"] as const;
    const detach = () => {
      window.clearTimeout(timer);
      events.forEach((e) => window.removeEventListener(e, finish));
    };
    const finish = () => {
      detach();
      root.classList.remove("intro-playing");
      getLenis()?.start();
      setStage((s) => (s === "hold" ? "leaving" : s));
    };
    const timer = window.setTimeout(finish, HOLD_MS);
    events.forEach((e) => window.addEventListener(e, finish, { passive: true }));
    return detach;
  }, [playing]);

  return (
    <IntroContext.Provider value={done}>
      {!seen && stage !== "gone" && (
        <motion.div
          aria-hidden
          className="intro-overlay fixed inset-0 z-[120] flex items-center justify-center bg-noir"
          initial={false}
          animate={{ clipPath: stage === "leaving" ? "inset(0% 0% 100% 0%)" : "inset(0% 0% 0% 0%)" }}
          transition={{ duration: 1, ease: EASE_IN_OUT }}
          onAnimationComplete={() => stage === "leaving" && setStage("gone")}
        >
          <div
            className="pointer-events-none absolute inset-0"
            style={{ background: "radial-gradient(ellipse 45% 55% at 50% 30%, rgba(43,79,176,0.35), transparent 70%)" }}
          />
          <div className="relative flex flex-col items-center gap-10">
            <div className="relative size-44">
              <svg viewBox="0 0 176 176" className="absolute inset-0 -rotate-90">
                <motion.circle
                  cx="88"
                  cy="88"
                  r="86"
                  fill="none"
                  stroke="var(--gold)"
                  strokeWidth="1"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={playing ? { pathLength: 1, opacity: 1 } : undefined}
                  transition={{ duration: 1.4, ease: EASE_IN_OUT, delay: 0.15 }}
                />
              </svg>
              <motion.div
                className="absolute inset-6"
                initial={{ opacity: 0, scale: 0.86, filter: "blur(14px)" }}
                animate={playing ? { opacity: 1, scale: 1, filter: "blur(0px)" } : undefined}
                transition={{ duration: 1.1, ease: EASE_OUT, delay: 0.1 }}
              >
                <Crest size={128} priority className="size-full" />
              </motion.div>
            </div>
            <span className="reveal-mask font-display text-3xl text-chalk">
              <motion.span
                className="block"
                initial={{ y: "115%" }}
                animate={playing ? { y: "0%" } : undefined}
                transition={{ duration: 1, ease: EASE_OUT, delay: 0.55 }}
              >
                Chèvre Noir
              </motion.span>
            </span>
          </div>
        </motion.div>
      )}
      {children}
    </IntroContext.Provider>
  );
}
