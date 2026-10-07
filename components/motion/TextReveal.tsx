"use client";

import { Fragment, useRef, type ElementType } from "react";
import { motion, useInView, useReducedMotion } from "motion/react";
import { useIntroDone } from "./Intro";
import { EASE_OUT } from "@/lib/motion";

interface TextRevealProps {
  text: string;
  as?: ElementType;
  className?: string;
  delay?: number;
  stagger?: number;
}

/** Type that rises word by word from behind a mask the first time it's seen. */
export default function TextReveal({ text, as: Tag = "h2", className, delay = 0, stagger = 0.07 }: TextRevealProps) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });
  const ready = useIntroDone();
  const reduce = useReducedMotion();
  const words = text.split(" ");

  return (
    <Tag ref={ref} className={className}>
      <span className="sr-only">{text}</span>
      <motion.span
        aria-hidden
        className="block"
        initial="hidden"
        animate={reduce || (inView && ready) ? "show" : "hidden"}
        transition={{ staggerChildren: stagger, delayChildren: delay }}
      >
        {words.map((word, i) => (
          <Fragment key={i}>
            {i > 0 && " "}
            <span className="reveal-mask">
              <motion.span
                className="inline-block"
                variants={{
                  hidden: { y: "115%" },
                  show: { y: "0%", transition: { duration: 1.15, ease: EASE_OUT } },
                }}
              >
                {word}
              </motion.span>
            </span>
          </Fragment>
        ))}
      </motion.span>
    </Tag>
  );
}
