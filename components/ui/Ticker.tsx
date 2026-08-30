import { cn } from "@/lib/utils";

type TickerProps = {
  items: readonly string[];
  tone?: "ink" | "lime";
  className?: string;
};

/**
 * A slow horizontal ticker of the real client figures.
 *
 * The row is duplicated so the loop is seamless; the copy is hidden from
 * assistive tech so the figures are announced once, not twice. Pauses on hover
 * and stops entirely under `prefers-reduced-motion`.
 */
export default function Ticker({ items, tone = "ink", className }: TickerProps) {
  const row = (
    <ul className="flex shrink-0 items-center">
      {items.map((item) => (
        <li key={item} className="flex items-center">
          <span className="display-tight px-6 py-4 text-lg whitespace-nowrap sm:px-9 sm:text-2xl">
            {item}
          </span>
          <span
            className={cn("size-1.5", tone === "ink" ? "bg-lime" : "bg-ink")}
            aria-hidden
          />
        </li>
      ))}
    </ul>
  );

  return (
    <div
      className={cn(
       "overflow-hidden",
        tone === "ink" ? "border-y border-line-dark bg-ink text-white" : "bg-lime text-ink",
        className,
      )}
    >
      <div className="marquee">
        {row}
        <div aria-hidden>{row}</div>
      </div>
    </div>
  );
}
