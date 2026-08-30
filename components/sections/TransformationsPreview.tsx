import { ArrowRight } from "lucide-react";
import { disclaimers, transformations } from "@/lib/content";
import BeforeAfter from "@/components/ui/BeforeAfter";
import CountUp from "@/components/ui/CountUp";
import Reveal from "@/components/site/Reveal";
import LineReveal from "@/components/site/LineReveal";
import { ButtonLink } from "@/components/ui/Button";

const featured = transformations.find((t) => t.featured) ?? transformations[0];
const rest = transformations.filter((t) => t.id !== featured.id);

export default function TransformationsPreview() {
  return (
    <section className="on-ink bg-ink text-white">
      <div className="grid lg:grid-cols-[minmax(0,42%)_1fr]">
        {/* The pair runs to the edge of the page rather than sitting in a card. */}
        <Reveal from="left" className="flex flex-col justify-center border-b border-white/15 py-10 lg:border-r lg:border-b-0 lg:py-14">
          <BeforeAfter
            before={{ src: featured.beforeSrc, alt: featured.beforeAlt, label: "83kg" }}
            after={{ src: featured.afterSrc, alt: featured.afterAlt, label: "82kg" }}
            metric={{ value: "−1kg", label: "on the scale" }}
            disclaimer={disclaimers.results}
            className="[&_figcaption]:px-5 [&_figcaption]:pb-8 sm:[&_figcaption]:px-8 [&_figcaption_p]:text-white/55"
          />
        </Reveal>

        <div className="px-5 py-20 sm:px-10 sm:py-28 lg:px-14">
          <p className="label flex items-center gap-3 text-white/55">
            <span className="h-px w-8 bg-lime" aria-hidden />
            Transformations
          </p>

          <LineReveal
            className="display mt-6 text-[clamp(2.25rem,1.2rem+4.4vw,4.5rem)] text-white"
            lines={["Same weight.", <>More muscle, <span key="l" className="text-lime">less fat</span>.</>]}
          />

          <p className="mt-8 max-w-xl text-base leading-relaxed text-white/70">{featured.why}</p>

          <dl className="mt-12 grid gap-px border-t border-white/15 sm:grid-cols-3">
            <div className="border-b border-white/15 py-6 sm:border-r sm:border-b-0 sm:pr-6">
              <dt className="label text-white/50">Over</dt>
              <dd className="numeral mt-2 text-4xl text-lime">1.5 mths</dd>
            </div>
            {rest.map((item) => (
              <div
                key={item.id}
                className="border-b border-white/15 py-6 sm:border-r sm:border-b-0 sm:px-6 sm:last:border-r-0"
              >
                <dt className="label text-white/50">{item.metricLabel}</dt>
                <dd className="numeral mt-2 text-4xl text-lime">
                  {item.id === "ten-kilos" ? (
                    <>
                      −<CountUp from={0} to={10} />
                      kg
                    </>
                  ) : (
                    <>
                      −<CountUp from={0} to={5} />%
                    </>
                  )}
                </dd>
              </div>
            ))}
          </dl>

          <ButtonLink href="/transformations" variant="lime" size="md" className="mt-10">
            All the numbers
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden />
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
