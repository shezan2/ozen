import Image from "next/image";
import { cn } from "@/lib/utils";

type Side = {
  src: string;
  alt: string;
  /** Short label sitting on the image, e.g. "85kg" or "Month 1". */
  label: string;
};

type BeforeAfterProps = {
  before: Side;
  after: Side;
  /**
   * Required, deliberately. Every before/after pair on this site carries a
   * results-vary note — it is not an optional prop a page can forget to pass.
   */
  disclaimer: string;
  /** The headline result, e.g. "10kg down". */
  metric?: { value: string; label: string };
  caption?: string;
  eager?: boolean;
  className?: string;
};

export default function BeforeAfter({
  before,
  after,
  disclaimer,
  metric,
  caption,
  eager = false,
  className,
}: BeforeAfterProps) {
  return (
    <figure className={cn("on-ink", className)}>
      {/* Flat-edged and butted together with a hairline, the way the story
          graphics set a pair — not two rounded cards side by side. */}
      <div className="relative bg-ink">
        <div className="grid grid-cols-2 gap-px bg-white/20">
          {[before, after].map((side, index) => (
            <div key={side.src} className="relative aspect-3/4 bg-ink-raised">
              <Image
                src={side.src}
                alt={side.alt}
                fill
                sizes="(min-width: 1024px) 22rem, (min-width: 640px) 30vw, 46vw"
                loading={eager ? "eager" : "lazy"}
                fetchPriority={eager && index === 0 ? "high" : undefined}
                className="object-cover"
              />
              <span className="slab-white display-tight absolute top-3 left-3 text-base sm:text-lg">
                {side.label}
              </span>
            </div>
          ))}
        </div>

        {metric ? (
          <p className="slab-lime display absolute bottom-4 left-1/2 -translate-x-1/2 px-3.5 py-2 text-xl whitespace-nowrap sm:text-2xl">
            {metric.value}
            <span className="label ml-2.5">{metric.label}</span>
          </p>
        ) : null}
      </div>

      <figcaption className="mt-4 space-y-2">
        {caption ? <p className="text-sm font-semibold text-ink">{caption}</p> : null}
        <p className="text-xs leading-relaxed text-ink-mute">{disclaimer}</p>
      </figcaption>
    </figure>
  );
}
