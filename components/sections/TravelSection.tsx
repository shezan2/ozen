import Image from "next/image";
import { travel } from "@/lib/content";
import Reveal from "@/components/site/Reveal";
import LineReveal from "@/components/site/LineReveal";
import { cn } from "@/lib/utils";

type TravelSectionProps = {
  /** The method page shows the same differentiator with its own imagery. */
  imageSrc?: string;
  imageAlt?: string;
  tone?: "surface" | "off";
};

export default function TravelSection({
  imageSrc = "/images/travel-hawker-lunch.jpg",
  imageAlt = travel.imageAlt,
  tone = "surface",
}: TravelSectionProps) {
  return (
    <section
      id="travel"
      className={cn("overflow-hidden", tone === "off" ? "bg-surface-off" : "bg-surface")}
    >
      <div className="grid items-center lg:grid-cols-[1fr_minmax(0,40%)]">
        <div className="px-5 py-20 sm:px-8 sm:py-28 lg:py-32 lg:pr-16 lg:pl-[max(2rem,calc((100vw-72rem)/2))]">
          <p className="label flex items-center gap-3 text-ink-mute">
            <span className="h-px w-8 bg-lime-deep" aria-hidden />
            {travel.label}
          </p>

          <LineReveal
            className="display mt-6 text-[clamp(2.125rem,1.2rem+3.8vw,4rem)]"
            lines={["Send the itinerary.", "Get back", "what to order."]}
          />

          <p className="lede mt-8 max-w-xl border-l-2 border-lime pl-5 text-ink">{travel.lede}</p>

          <div className="mt-8 max-w-xl space-y-4 text-[0.9375rem] leading-relaxed text-ink-mute">
            {travel.body.map((paragraph) => (
              <p key={paragraph.slice(0, 24)}>{paragraph}</p>
            ))}
          </div>

          <dl className="mt-10 max-w-2xl border-t border-line">
            {travel.examples.map((example, index) => (
              <Reveal
                key={example.context}
                delay={index * 60}
                className="grid gap-1 border-b border-line py-5 sm:grid-cols-[12rem_1fr] sm:gap-6"
              >
                <dt className="display-tight text-base text-ink">{example.context}</dt>
                <dd className="text-sm leading-relaxed text-ink-faint">{example.detail}</dd>
              </Reveal>
            ))}
          </dl>

          <p className="mt-7 max-w-xl text-xs leading-relaxed text-ink-mute">{travel.note}</p>
        </div>

        {/* Runs off the right edge of the page on desktop. */}
        <div className="relative aspect-4/3 lg:aspect-auto lg:h-full lg:min-h-[38rem]">
          <Image
            src={imageSrc}
            alt={imageAlt}
            fill
            sizes="(min-width: 1024px) 40vw, 100vw"
            className="object-cover"
          />
        </div>
      </div>
    </section>
  );
}
