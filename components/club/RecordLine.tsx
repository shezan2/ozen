import { cn } from "@/lib/utils";

interface RecordItem {
  label: string;
  value: string | number;
  accent?: "win" | "draw" | "loss";
}

export default function RecordLine({ items, onNavy = false, className }: { items: RecordItem[]; onNavy?: boolean; className?: string }) {
  const accentClass = (a?: RecordItem["accent"]) =>
    a === "win" ? "text-win" : a === "draw" ? "text-draw" : a === "loss" ? "text-loss" : onNavy ? "text-paper-ink" : "text-ink";

  return (
    <div className={cn("flex flex-wrap items-baseline gap-x-6 gap-y-2", className)}>
      {items.map((it) => (
        <div key={it.label} className="flex items-baseline gap-1.5">
          <span className={cn("tabular text-lg font-semibold", accentClass(it.accent))}>{it.value}</span>
          <span className={cn("text-xs", onNavy ? "text-paper-ink-faint" : "text-ink-faint")}>{it.label}</span>
        </div>
      ))}
    </div>
  );
}
