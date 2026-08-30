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
  /** Load this pair eagerly — set on the first pair on a page. */
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
      <div className="relative overflow-hidden rounded-2xl bg-ink-soft">
        <div className="grid grid-cols-2 gap-px bg-line-dark">
          {[before, after].map((side, index) => (
            <div key={side.src} className="relative aspect-3/4 bg-ink-raised">
              <Image
                src={side.src}
                alt={side.alt}
                fill
                sizes="(min-width: 1024px) 22rem, (min-width: 640px) 30vw, 45vw"
                loading={eager ? "eager" : "lazy"}
                fetchPriority={eager && index === 0 ? "high" : undefined}
                className="object-cover"
              />
              <span className="sticker absolute top-3 left-3 text-sm font-bold sm:text-base">
                {side.label}
              </span>
            </div>
          ))}
        </div>

        {metric ? (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center pb-4">
            <p className="sticker-lime display flex items-baseline gap-2 px-3.5 py-1.5 text-lg sm:text-xl">
              {metric.value}
              <span className="text-[0.6rem] font-semibold tracking-[0.14em] uppercase">
                {metric.label}
              </span>
            </p>
          </div>
        ) : null}
      </div>

      <figcaption className="mt-4 space-y-2">
        {caption ? <p className="text-sm font-medium text-ink">{caption}</p> : null}
        <p className="text-xs leading-relaxed text-ink-mute">{disclaimer}</p>
      </figcaption>
    </figure>
  );
}
