import { cn } from "@/lib/utils";

const PALETTE = ["#52525b", "#44403c", "#3f3f46", "#4b5563", "#57534e", "#404040"];

function hashName(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return h;
}

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

interface OpponentBadgeProps {
  name: string;
  size?: number;
  className?: string;
}

/** Generated placeholder crest for opposition clubs — a shield silhouette in a
 * deterministic neutral tone, standing in until real badge artwork exists. */
export default function OpponentBadge({ name, size = 40, className }: OpponentBadgeProps) {
  const color = PALETTE[hashName(name) % PALETTE.length];
  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center text-white/90 ring-1 ring-inset ring-white/15",
        className
      )}
      style={{
        width: size,
        height: size,
        background: `linear-gradient(155deg, ${color}, color-mix(in srgb, ${color} 55%, black))`,
        clipPath: "polygon(50% 0%, 100% 18%, 100% 62%, 50% 100%, 0% 62%, 0% 18%)",
        fontSize: size * 0.34,
      }}
    >
      <span className="font-bold tracking-tight">{opponentInitials(name)}</span>
    </div>
  );
}
