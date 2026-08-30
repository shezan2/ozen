import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { method } from "@/lib/content";
import Section from "@/components/ui/Section";
import SectionHeading from "@/components/ui/SectionHeading";
import Reveal from "@/components/site/Reveal";
import { ButtonLink } from "@/components/ui/Button";

export default function MethodPreview() {
  return (
    <Section tone="off">
      <div className="grid gap-12 lg:grid-cols-[1fr_1.15fr] lg:items-start lg:gap-16">
        <div className="lg:sticky lg:top-28">
          <SectionHeading eyebrow={method.eyebrow} title={method.heading} lede={method.intro} />

          <div className="relative mt-10 aspect-4/3 overflow-hidden rounded-2xl bg-surface-sunken">
            <Image
              src="/images/method-session.jpg"
              alt="A client mid-set on a dumbbell press while Myo counts reps from the side [TODO: replace with a real coaching photo]"
              fill
              sizes="(min-width: 1024px) 30rem, 92vw"
              className="object-cover"
            />
          </div>

          <ButtonLink href="/the-3-hour-method" variant="ink" size="lg" className="mt-8">
            The method in full
            <ArrowRight className="size-4" aria-hidden />
          </ButtonLink>
        </div>

        <ol className="divide-y divide-line border-y border-line">
          {method.pillars.map((pillar, index) => (
            <Reveal key={pillar.number} as="li" delay={index * 60} className="py-8 first:pt-0 last:pb-0">
              <div className="flex items-baseline gap-4">
                <span className="display text-sm text-lime-deep">{pillar.number}</span>
                <h3 className="display-tight text-xl text-ink sm:text-2xl">{pillar.title}</h3>
              </div>
              <p className="mt-3 pl-10 text-[0.9375rem] leading-relaxed text-ink-mute">{pillar.body}</p>
              {pillar.detail ? (
                <p className="mt-3 pl-10 text-xs leading-relaxed text-ink-faint">{pillar.detail}</p>
              ) : null}
            </Reveal>
          ))}
        </ol>
      </div>
    </Section>
  );
}
