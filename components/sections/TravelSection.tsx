import Image from "next/image";
import { travel } from "@/lib/content";
import Section from "@/components/ui/Section";
import SectionHeading from "@/components/ui/SectionHeading";
import Reveal from "@/components/site/Reveal";

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
    <Section tone={tone} id="travel">
      <div className="grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-16">
        <div>
          <SectionHeading eyebrow={travel.eyebrow} title={travel.heading} />
          <p className="lede mt-6 border-l-2 border-lime pl-5 text-ink">{travel.lede}</p>
          <div className="mt-7 space-y-4 text-[0.9375rem] leading-relaxed text-ink-mute">
            {travel.body.map((paragraph) => (
              <p key={paragraph.slice(0, 24)}>{paragraph}</p>
            ))}
          </div>

          <dl className="mt-9 divide-y divide-line border-y border-line">
            {travel.examples.map((example) => (
              <div key={example.context} className="grid gap-1 py-4 sm:grid-cols-[10rem_1fr] sm:gap-6">
                <dt className="text-sm font-semibold text-ink">{example.context}</dt>
                <dd className="text-sm leading-relaxed text-ink-faint">{example.detail}</dd>
              </div>
            ))}
          </dl>

          <p className="mt-6 text-xs leading-relaxed text-ink-mute">{travel.note}</p>
        </div>

        <Reveal className="relative aspect-4/5 overflow-hidden rounded-3xl bg-surface-sunken">
          <Image
            src={imageSrc}
            alt={imageAlt}
            fill
            sizes="(min-width: 1024px) 30rem, 92vw"
            className="object-cover"
          />
        </Reveal>
      </div>
    </Section>
  );
}
