import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { method } from "@/lib/content";
import Section from "@/components/ui/Section";
import Reveal from "@/components/site/Reveal";
import LineReveal from "@/components/site/LineReveal";
import { ButtonLink } from "@/components/ui/Button";

export default function MethodPreview() {
  return (
    <Section tone="surface" size="tall">
      <div className="grid gap-14 lg:grid-cols-[minmax(0,24rem)_1fr] lg:gap-20">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <p className="label flex items-center gap-3 text-ink-mute">
            <span className="h-px w-8 bg-lime-deep" aria-hidden />
            {method.label}
          </p>

          {/* The constraint, stated as a graphic rather than described. */}
          <p className="mt-8 flex items-start gap-4">
            <span className="numeral text-[clamp(6rem,4rem+8vw,11rem)] text-ink">3</span>
            <span className="label mt-4 text-ink-mute">
              hours
              <br />a week
              <br />
              <span className="text-lime-deep">total</span>
            </span>
          </p>

          <LineReveal
            className="display mt-8 text-[clamp(1.75rem,1.2rem+2vw,2.75rem)]"
            lines={["Built around your life,", "not against it."]}
          />
          <p className="mt-6 text-[0.9375rem] leading-relaxed text-ink-mute">{method.intro}</p>

          <div className="relative mt-9 aspect-4/3 overflow-hidden bg-surface-sunken">
            <Image
              src="/images/method-session.jpg"
              alt="A client mid-set on a dumbbell press while Myo counts reps from the side [TODO: replace with a real coaching photo]"
              fill
              sizes="(min-width: 1024px) 24rem, 92vw"
              className="object-cover"
            />
          </div>

          <ButtonLink href="/the-3-hour-method" variant="ink" size="md" className="mt-8">
            The method in full
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden />
          </ButtonLink>
        </div>

        <ol className="border-t border-line">
          {method.pillars.map((pillar, index) => (
            <Reveal
              key={pillar.number}
              as="li"
              from="right"
              delay={index * 60}
              className="group border-b border-line py-10 transition-colors"
            >
              <div className="flex items-baseline gap-5">
                <span className="label text-lime-deep">{pillar.number}</span>
                <h3 className="display text-[clamp(1.5rem,1.1rem+1.6vw,2.5rem)] text-ink">
                  {pillar.title}
                </h3>
              </div>
              <p className="mt-4 max-w-2xl pl-12 text-base leading-relaxed text-ink-mute">
                {pillar.body}
              </p>
              {pillar.detail ? (
                <p className="mt-3 max-w-2xl pl-12 text-xs leading-relaxed text-ink-faint">
                  {pillar.detail}
                </p>
              ) : null}
            </Reveal>
          ))}
        </ol>
      </div>
    </Section>
  );
}
