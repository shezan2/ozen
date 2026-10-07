"use client";

import { ArrowDown } from "lucide-react";

/** Round button that takes you to the next section of the page. */
export default function ScrollCue({ targetId, label }: { targetId: string; label: string }) {
  return (
    <button
      onClick={() => {
        const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        document.getElementById(targetId)?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
      }}
      aria-label={label}
      className="flex size-12 shrink-0 items-center justify-center rounded-full bg-noir text-white transition-colors duration-200 hover:bg-navy"
    >
      <ArrowDown className="size-5" />
    </button>
  );
}
