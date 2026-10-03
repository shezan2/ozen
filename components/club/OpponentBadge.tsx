import { cn } from "@/lib/utils";

const PALETTE = ["#48484e", "#3a3a40", "#55555c", "#424248", "#5c5c63", "#3f3f46"];

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

/** Generated placeholder crest for opposition clubs — a soft tonal circle,
 * standing in until real badge artwork exists. */
export default function OpponentBadge({ name, size = 40, className }: OpponentBadgeProps) {
  const color = PALETTE[hashName(name) % PALETTE.length];
  return (
    <div
      className={cn("flex shrink-0 items-center justify-center rounded-full text-white/95 ring-1 ring-inset ring-black/5", className)}
      style={{
        width: size,
        height: size,
        background: `linear-gradient(155deg, ${color}, color-mix(in srgb, ${color} 60%, black))`,
        fontSize: size * 0.34,
      }}
    >
      <span className="font-semibold tracking-tight">{opponentInitials(name)}</span>
    </div>
  );
}
