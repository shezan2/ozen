import type { Metadata } from "next";
import { disclaimers, pageMeta, testimonial, transformations } from "@/lib/content";
import PageHero from "@/components/sections/PageHero";
import FinalCta from "@/components/sections/FinalCta";
import Section from "@/components/ui/Section";
import BeforeAfter from "@/components/ui/BeforeAfter";
import Reveal from "@/components/site/Reveal";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: pageMeta.transformations.title,
  description: pageMeta.transformations.description,
  alternates: { canonical: "/transformations" },
  openGraph: {
    title: pageMeta.transformations.title,
    description: pageMeta.transformations.description,
    url: "/transformations",
  },
};

/** Image labels are per client and stay next to the figures they belong to. */
const labels: Record<string, { before: string; after: string; metric: string; metricLabel: string }> = {
  recomposition: { before: "83kg", after: "82kg", metric: "−1kg", metricLabel: "on the scale" },
  "ten-kilos": { before: "85kg", after: "75kg", metric: "−10kg", metricLabel: "down" },
  "five-percent": { before: "Month 1", after: "Month 5", metric: "−5%", metricLabel: "body fat" },
};

export default function TransformationsPage() {
  return (
    <>
      <PageHero
        eyebrow="Transformations"
        title="Four real numbers. No averages, no client counts."
        lede="Everything below came from an actual client. There are no success rates on this page, because nobody has counted them honestly and a made-up one is worth nothing to you."
      />

      <Section tone="surface">
        <div className="space-y-24 sm:space-y-32">
          {transformations.map((item, index) => {
            const label = labels[item.id];
            return (
              <article
                key={item.id}
                className={cn(
                  "grid items-center gap-10 lg:grid-cols-2 lg:gap-16",
                  index % 2 === 1 && "lg:[&>figure]:order-2",
                )}
              >
                <BeforeAfter
                  before={{ src: item.beforeSrc, alt: item.beforeAlt, label: label.before }}
                  after={{ src: item.afterSrc, alt: item.afterAlt, label: label.after }}
                  metric={{ value: label.metric, label: label.metricLabel }}
                  disclaimer={disclaimers.results}
                  eager={index === 0}
                />

                <Reveal>
                  {item.featured ? (
                    <p className="sticker-lime eyebrow inline-block px-2.5 py-1.5">
                      The one to look at
                    </p>
                  ) : null}
                  <p className="eyebrow mt-4 text-ink-mute">{item.period}</p>
                  <h2 className="display mt-3 text-[clamp(1.875rem,1.3rem+2.4vw,3rem)]">
                    {item.headline}
                  </h2>
                  <p className="lede mt-4 text-ink">{item.summary}</p>
                  <p className="mt-5 text-base leading-relaxed text-ink-mute">{item.why}</p>
                </Reveal>
              </article>
            );
          })}
        </div>
      </Section>

      <Section tone="ink">
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
          <div>
            <p className="eyebrow text-lime">Also on record</p>
            <p className="display mt-4 text-[clamp(2.5rem,1.6rem+4vw,4.5rem)]">{testimonial.result}</p>
            <p className="mt-4 text-white/70">
              {testimonial.name}, {testimonial.role}. {testimonial.source}.
            </p>
          </div>
          <div>
            <h2 className="display-tight text-2xl text-white sm:text-3xl">
              How to read a before and after
            </h2>
            <div className="mt-5 space-y-4 text-[0.9375rem] leading-relaxed text-white/65">
              <p>
                Two of the four figures on this page are weight coming off. One is body fat. One is
                a client whose scale barely moved at all. That spread is the honest picture — bodies
                do not change on a single axis, and the number you weigh is the noisiest signal you
                have.
              </p>
              <p>
                Photographs are taken in different rooms, at different times of day, under different
                light. Nothing here is retouched, and nothing here is a claim about what will happen
                to you.
              </p>
              <p className="text-white/60">{disclaimers.results}</p>
              <p className="text-white/60">
                [TODO: confirm per-client written consent for every photograph and figure on this
                page before launch, and confirm the missing time period for the 85kg → 75kg client]
              </p>
            </div>
          </div>
        </div>
      </Section>

      <FinalCta
        heading="Your numbers next."
        body="Message RESET and you get a realistic read on where you are and what three hours a week could do — before anyone talks about packages."
      />
    </>
  );
}
