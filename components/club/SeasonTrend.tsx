"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { TrendPoint } from "@/lib/data";
import { cn } from "@/lib/utils";
import { formatValue } from "@/components/motion/CountUp";

// The chart is drawn at its container's real width, so labels keep their size on a phone.
const DEFAULT_W = 760;
const PAD_L = 34;
const PAD_R = 52; // room for the end-of-line label
const PAD_T = 24;
const PAD_B = 30;

const RESULT_VAR: Record<TrendPoint["result"], string> = {
  W: "var(--win)",
  D: "var(--draw)",
  L: "var(--loss)",
  Upcoming: "var(--silver)",
};

const RESULT_LABEL: Record<TrendPoint["result"], string> = {
  W: "Win",
  D: "Draw",
  L: "Loss",
  Upcoming: "Upcoming",
};

export default function SeasonTrend({ points }: { points: TrendPoint[] }) {
  const [hover, setHover] = useState<number | null>(null);
  const [W, setW] = useState(DEFAULT_W);
  const wrapRef = useRef<HTMLDivElement>(null);
  const gradientId = useId();

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => setW(Math.max(280, Math.round(entry.contentRect.width))));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  if (points.length < 2) return null;

  const values = points.map((p) => p.cumulative);
  const dataMin = Math.min(...values, 0);
  const dataMax = Math.max(...values, 0);
  const span = Math.max(dataMax - dataMin, 4);
  const yMin = dataMin - span * 0.18;
  const yMax = dataMax + span * 0.22;

  const H = W < 560 ? 240 : 280;
  const plotW = W - PAD_L - PAD_R;
  const plotH = H - PAD_T - PAD_B;

  const x = (i: number) => PAD_L + (points.length === 1 ? 0 : (i / (points.length - 1)) * plotW);
  const y = (v: number) => PAD_T + (1 - (v - yMin) / (yMax - yMin)) * plotH;
  const yZero = y(0);

  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${x(i)} ${y(p.cumulative)}`).join(" ");
  const areaPath = `M ${x(0)} ${yZero} L ${points.map((p, i) => `${x(i)} ${y(p.cumulative)}`).join(" L ")} L ${x(
    points.length - 1
  )} ${yZero} Z`;

  const last = points[points.length - 1];
  const active = hover !== null ? points[hover] : null;
  const activeX = hover !== null ? x(hover) : 0;

  return (
    <div className="flex flex-col gap-4">
      <div ref={wrapRef} className="relative">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full overflow-visible"
          role="img"
          aria-label={`Cumulative goal difference across the season, ending at ${last.cumulative}`}
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--floodlight)" stopOpacity="0.45" />
              <stop offset="100%" stopColor="var(--floodlight)" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Zero baseline */}
          <line x1={PAD_L} y1={yZero} x2={W - PAD_R} y2={yZero} stroke="var(--line-strong)" strokeWidth={1} />
          <text x={PAD_L - 8} y={yZero} textAnchor="end" dominantBaseline="middle" className="fill-mist text-[11px]">
            0
          </text>

          {/* Crosshair */}
          {active && (
            <line
              x1={activeX}
              y1={PAD_T}
              x2={activeX}
              y2={H - PAD_B}
              stroke="var(--chalk)"
              strokeOpacity={0.25}
              strokeWidth={1}
            />
          )}

          <path d={areaPath} fill={`url(#${gradientId})`} />
          <path d={linePath} fill="none" stroke="var(--chalk)" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />

          {/* The season's running total, labelled where the line ends */}
          <text
            x={x(points.length - 1) + 12}
            y={y(last.cumulative)}
            dominantBaseline="middle"
            className={cn("figure fill-chalk text-[20px] transition-opacity duration-300", hover !== null && "opacity-30")}
          >
            {formatValue(last.cumulative, true)}
          </text>

          {points.map((p, i) => (
            <g key={p.matchday}>
              <text
                x={x(i)}
                y={H - PAD_B + 18}
                textAnchor="middle"
                className={cn("text-[11px] transition-colors", hover === i ? "fill-chalk" : "fill-mist")}
              >
                {p.matchday}
              </text>
              {hover === i && (
                <circle cx={x(i)} cy={y(p.cumulative)} r={13} fill={RESULT_VAR[p.result]} fillOpacity={0.18} />
              )}
              <circle
                cx={x(i)}
                cy={y(p.cumulative)}
                r={hover === i ? 6.5 : 5}
                fill={RESULT_VAR[p.result]}
                stroke="var(--chart-surface)"
                strokeWidth={2}
                className="transition-[r] duration-300 ease-out-expo"
              />
              {/* Generous, invisible hit target */}
              <circle
                cx={x(i)}
                cy={y(p.cumulative)}
                r={14}
                fill="transparent"
                tabIndex={0}
                role="button"
                aria-label={`Matchday ${p.matchday} vs ${p.opponent}, ${RESULT_LABEL[p.result]} ${p.score}. Cumulative goal difference ${p.cumulative}.`}
                onMouseEnter={() => setHover(i)}
                onMouseLeave={() => setHover((h) => (h === i ? null : h))}
                onFocus={() => setHover(i)}
                onBlur={() => setHover((h) => (h === i ? null : h))}
                className="cursor-pointer outline-none"
                style={{ pointerEvents: "all" }}
              />
            </g>
          ))}
        </svg>

        {active && (
          <div
            className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full glass rounded-2xl px-4 py-3 text-center backdrop-blur-xl"
            style={{
              left: `${(activeX / W) * 100}%`,
              top: `${(y(active.cumulative) / H) * 100}%`,
              marginTop: "-10px",
            }}
          >
            <p className="text-[11px] whitespace-nowrap text-mist">Matchday {active.matchday}</p>
            <p className="mt-0.5 font-display text-lg leading-tight whitespace-nowrap text-chalk">{active.opponent}</p>
            <p className="mt-2 flex items-center justify-center gap-2.5 text-xs whitespace-nowrap text-silver">
              <span>
                {RESULT_LABEL[active.result]} <span className="figure text-chalk">{active.score.replace(/\s*-\s*/, "–")}</span>
              </span>
              <span aria-hidden className="h-3 w-px bg-white/15" />
              <span>
                Goal difference <span className="figure text-chalk">{formatValue(active.cumulative, true)}</span>
              </span>
            </p>
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
        {(["W", "D", "L"] as const).map((r) => (
          <span key={r} className="flex items-center gap-1.5 text-xs font-medium text-silver">
            <span className="size-2.5 rounded-full" style={{ background: RESULT_VAR[r] }} aria-hidden />
            {RESULT_LABEL[r]}
          </span>
        ))}
      </div>

      <div className="sr-only">
        <table>
          <caption>Match-by-match cumulative goal difference</caption>
          <thead>
            <tr>
              <th scope="col">Matchday</th>
              <th scope="col">Opponent</th>
              <th scope="col">Result</th>
              <th scope="col">Score</th>
              <th scope="col">Cumulative goal difference</th>
            </tr>
          </thead>
          <tbody>
            {points.map((p) => (
              <tr key={p.matchday}>
                <td>{p.matchday}</td>
                <td>{p.opponent}</td>
                <td>{RESULT_LABEL[p.result]}</td>
                <td>{p.score}</td>
                <td>{p.cumulative}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
