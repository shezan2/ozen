import { cn } from "@/lib/utils";

interface StatCalloutProps {
  value: string | number;
  label: string;
  onNavy?: boolean;
  className?: string;
}

export default function StatCallout({ value, label, onNavy = false, className }: StatCalloutProps) {
  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <span
        className={cn(
          "font-display text-5xl leading-none sm:text-6xl",
          onNavy ? "text-paper-ink" : "text-ink"
        )}
      >
        {value}
      </span>
      <span
        className={cn(
          "text-sm font-bold uppercase tracking-wide",
          onNavy ? "text-paper-ink-dim" : "text-ink-dim"
        )}
      >
        {label}
      </span>
    </div>
  );
}
