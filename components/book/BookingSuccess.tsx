"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { animate, stagger } from "animejs";
import { formatDateLong } from "@/lib/booking";

interface BookingSuccessProps {
  name: string;
  date: Date;
  slot: string;
}

export default function BookingSuccess({ name, date, slot }: BookingSuccessProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  // Stroke-draw the circled checkmark, same technique as the logo.
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const paths = Array.from(svg.querySelectorAll<SVGPathElement>("path, circle"));
    for (const p of paths) {
      const len = (p as SVGGeometryElement).getTotalLength();
      p.style.strokeDasharray = `${len}`;
      p.style.strokeDashoffset = `${len}`;
    }
    animate(paths, {
      strokeDashoffset: 0,
      duration: 1100,
      delay: stagger(260),
      ease: "inOutQuart",
    });
  }, []);

  const firstName = name.trim().split(/\s+/)[0] || "there";

  return (
    <div className="flex flex-col items-center py-6 text-center">
      <svg ref={svgRef} viewBox="0 0 80 80" fill="none" className="h-20 w-20 text-iris" aria-hidden>
        <circle cx="40" cy="40" r="34" stroke="currentColor" strokeWidth="2" />
        <path
          d="M26 41.5 36 51 55 30"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <h3 className="mt-8 font-display text-3xl font-medium tracking-tight text-ink">
        You&apos;re booked, {firstName}.
      </h3>
      <p className="mt-3 font-mono text-sm text-iris">
        {formatDateLong(date)} · {slot}
      </p>
      <p className="mt-4 max-w-sm text-sm leading-relaxed text-ink-dim">
        We&apos;ll confirm by email within a few hours with a calendar invite and a
        video link. Talk soon.
      </p>
      <Link
        href="/"
        className="mt-10 font-mono text-[0.7rem] uppercase tracking-[0.25em] text-ink-dim transition-colors hover:text-ink"
      >
        ← Back to home
      </Link>
    </div>
  );
}
