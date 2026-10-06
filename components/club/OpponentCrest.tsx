import { cn } from "@/lib/utils";

function opponentInitials(name: string) {
  const words = name
    .replace(/\bFC\b/gi, "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (words.length === 0) return "?";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

/** Monochrome shield placeholder for opposition crests until real artwork is supplied. */
export default function OpponentCrest({ name, size = 48, className }: { name: string; size?: number; className?: string }) {
  return (
    <svg
      viewBox="0 0 40 46"
      width={size}
      height={size * 1.15}
      role="img"
      aria-label={`${name} crest placeholder`}
      className={cn("shrink-0", className)}
    >
      <path
        d="M20 1.5 37.5 7v15.5c0 10.6-7.3 18.6-17.5 22-10.2-3.4-17.5-11.4-17.5-22V7Z"
        fill="var(--field-3)"
        stroke="var(--silver-dim)"
        strokeWidth="1.5"
      />
      <text
        x="20"
        y="25"
        textAnchor="middle"
        dominantBaseline="middle"
        fill="var(--silver)"
        style={{ fontStretch: "75%", fontWeight: 700, fontSize: 12 }}
      >
        {opponentInitials(name)}
      </text>
    </svg>
  );
}
