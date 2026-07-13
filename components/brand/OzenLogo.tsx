"use client";

import { useEffect, useId, useRef } from "react";
import { animate, stagger } from "animejs";

interface OzenLogoProps {
  /** Rendered width/height of the square mark in px. */
  size?: number;
  withWordmark?: boolean;
  /** Stroke-draw the mark on mount. */
  animated?: boolean;
  /** Slow continuous rotation of the inner gem (hero only). */
  idle?: boolean;
  className?: string;
}

/**
 * The Ozen mark, recreated as pure SVG: a wireframe hexagon holding an
 * isometric cube with three facet diagonals. Transparent by construction,
 * inherits `currentColor` for the frame; the gem strokes carry a subtle
 * spectral gradient.
 */
export default function OzenLogo({
  size = 40,
  withWordmark = false,
  animated = false,
  idle = false,
  className = "",
}: OzenLogoProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const wordRef = useRef<HTMLSpanElement>(null);
  const gradId = useId();

  useEffect(() => {
    if (!animated) return;
    const svg = svgRef.current;
    if (!svg) return;
    const paths = Array.from(svg.querySelectorAll<SVGPathElement>("path"));
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    for (const p of paths) {
      const len = p.getTotalLength();
      p.style.strokeDasharray = `${len}`;
      p.style.strokeDashoffset = `${len}`;
    }
    animate(paths, {
      strokeDashoffset: 0,
      duration: 1600,
      delay: stagger(120),
      ease: "inOutQuart",
    });
    if (wordRef.current) {
      wordRef.current.style.opacity = "0";
      animate(wordRef.current, {
        opacity: [0, 1],
        translateY: [14, 0],
        duration: 900,
        delay: 1400,
        ease: "outQuart",
      });
    }
  }, [animated]);

  return (
    <span className={`inline-flex flex-col items-center gap-[0.35em] ${className}`}>
      <svg
        ref={svgRef}
        width={size}
        height={size}
        viewBox="0 0 120 120"
        fill="none"
        aria-hidden
        className="block"
      >
        <defs>
          <linearGradient id={gradId} x1="20" y1="30" x2="100" y2="95" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="var(--spectral-a)" />
            <stop offset="100%" stopColor="var(--spectral-b)" />
          </linearGradient>
        </defs>

        {/* Outer hexagon frame — inherits currentColor */}
        <path
          d="M60 16 L21.9 38 L21.9 82 L60 104 L98.1 82 L98.1 38 Z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
        {/* Vertex connectors */}
        <path
          d="M60 16 L60 34 M21.9 38 L37.5 47 M21.9 82 L37.5 73 M60 104 L60 86 M98.1 82 L82.5 73 M98.1 38 L82.5 47"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          opacity="0.75"
          vectorEffect="non-scaling-stroke"
        />
        {/* Facet diagonals */}
        <path
          d="M60 16 L37.5 47 M21.9 82 L60 86 M98.1 38 L82.5 73"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinecap="round"
          opacity="0.45"
          vectorEffect="non-scaling-stroke"
        />
        {/* Inner gem — spectral gradient, optionally rotating */}
        <g
          className={idle ? "animate-spin-slow" : undefined}
          style={idle ? { transformOrigin: "60px 60px" } : undefined}
        >
          <path
            d="M60 34 L37.5 47 L37.5 73 L60 86 L82.5 73 L82.5 47 Z"
            stroke={`url(#${gradId})`}
            strokeWidth="2"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />
          <path
            d="M37.5 47 L60 60 L82.5 47 M60 60 L60 86"
            stroke={`url(#${gradId})`}
            strokeWidth="1.5"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />
        </g>
      </svg>

      {withWordmark && (
        <span
          ref={wordRef}
          className="font-display font-medium lowercase tracking-tight text-ink"
          style={{ fontSize: size * 0.42, lineHeight: 1 }}
        >
          ozen
        </span>
      )}
    </span>
  );
}
