import { cn } from "@/lib/utils";

/** Portrait slot for a player: the kit's tonal chevron print behind a
 * silhouette placeholder, until squad photography is supplied. */
export default function PlayerPortrait({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 300 340" preserveAspectRatio="xMidYMax slice" aria-hidden className={cn("block", className)}>
      <rect width="300" height="340" fill="var(--field-2)" />
      {/* Heraldic chevron, pointing up — the club's kit print */}
      <path d="M-20 300 150 120 320 300 320 360 150 180 -20 360Z" fill="var(--field-3)" />
      <path d="M-20 220 150 40 320 220 320 250 150 70 -20 250Z" fill="var(--field-3)" opacity="0.55" />
      {/* Head-and-shoulders silhouette */}
      <g fill="#24315a">
        <ellipse cx="150" cy="140" rx="42" ry="50" />
        <path d="M126 176c6 22 42 22 48 0l6 34h-60Z" />
        <path d="M34 340c4-66 44-118 116-126 72 8 112 60 116 126Z" />
      </g>
    </svg>
  );
}
