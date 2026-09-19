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
          "tabular text-4xl font-semibold tracking-tight sm:text-5xl",
          onNavy ? "text-paper-ink" : "text-ink"
        )}
      >
        {value}
      </span>
      <span
        className={cn(
          "text-sm font-medium",
          onNavy ? "text-paper-ink-dim" : "text-ink-dim"
        )}
      >
        {label}
      </span>
    </div>
  );
}
