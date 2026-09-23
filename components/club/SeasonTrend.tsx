"use client";

import { useId, useState } from "react";
import type { TrendPoint } from "@/lib/data";
import { cn } from "@/lib/utils";

const W = 760;
const H = 280;
const PAD_L = 34;
const PAD_R = 16;
const PAD_T = 24;
const PAD_B = 30;

const RESULT_VAR: Record<TrendPoint["result"], string> = {
  W: "var(--win)",
  D: "var(--draw)",
  L: "var(--loss)",
  Upcoming: "var(--blue)",
};

const RESULT_LABEL: Record<TrendPoint["result"], string> = {
  W: "Win",
  D: "Draw",
  L: "Loss",
  Upcoming: "Upcoming",
};

export default function SeasonTrend({ points }: { points: TrendPoint[] }) {
  const [hover, setHover] = useState<number | null>(null);
  const gradientId = useId();

  if (points.length < 2) return null;

  const values = points.map((p) => p.cumulative);
  const dataMin = Math.min(...values, 0);
  const dataMax = Math.max(...values, 0);
  const span = Math.max(dataMax - dataMin, 4);
  const yMin = dataMin - span * 0.18;
  const yMax = dataMax + span * 0.22;

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
      <div className="relative">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full overflow-visible"
          role="img"
          aria-label={`Cumulative goal difference across the season, ending at ${last.cumulative}`}
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--blue)" stopOpacity="0.16" />
              <stop offset="100%" stopColor="var(--blue)" stopOpacity="0.02" />
            </linearGradient>
          </defs>

          {/* Zero baseline */}
          <line x1={PAD_L} y1={yZero} x2={W - PAD_R} y2={yZero} stroke="var(--line-strong)" strokeWidth={1} />
          <text x={PAD_L - 8} y={yZero} textAnchor="end" dominantBaseline="middle" className="fill-ink-faint text-[11px]">
            0
          </text>

          {/* Crosshair */}
          {active && (
            <line
              x1={activeX}
              y1={PAD_T}
              x2={activeX}
              y2={H - PAD_B}
              stroke="var(--ink)"
              strokeOpacity={0.12}
              strokeWidth={1}
            />
          )}

          <path d={areaPath} fill={`url(#${gradientId})`} />
          <path d={linePath} fill="none" stroke="var(--blue-deep)" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />

          {points.map((p, i) => (
            <g key={p.matchday}>
              <text
                x={x(i)}
                y={H - PAD_B + 18}
                textAnchor="middle"
                className={cn("text-[10px] transition-colors", hover === i ? "fill-ink" : "fill-ink-faint")}
              >
                {p.matchday}
              </text>
              <circle
                cx={x(i)}
                cy={y(p.cumulative)}
                r={5}
                fill={RESULT_VAR[p.result]}
                stroke="var(--paper-raised)"
                strokeWidth={2}
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
            className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full border-2 border-noir bg-white px-3 py-2 text-center shadow-[4px_4px_0_0_var(--blue)]"
            style={{
              left: `${(activeX / W) * 100}%`,
              top: `${(y(active.cumulative) / H) * 100}%`,
              marginTop: "-10px",
            }}
          >
            <p className="whitespace-nowrap text-xs font-semibold text-ink">
              MD{active.matchday} vs {active.opponent}
            </p>
            <p className="whitespace-nowrap text-[11px] text-ink-dim">
              {RESULT_LABEL[active.result]} {active.score} · GD{" "}
              <span className="tabular font-semibold text-ink">{active.cumulative}</span>
            </p>
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
        {(["W", "D", "L"] as const).map((r) => (
          <span key={r} className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-ink-dim">
            <span className="size-2.5 rounded-full" style={{ background: RESULT_VAR[r] }} aria-hidden />
            {RESULT_LABEL[r]}
          </span>
        ))}
      </div>

      <table className="sr-only">
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
  );
}
