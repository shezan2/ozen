import { ArrowRight } from "lucide-react";
import { disclaimers, transformations } from "@/lib/content";
import Section from "@/components/ui/Section";
import SectionHeading from "@/components/ui/SectionHeading";
import BeforeAfter from "@/components/ui/BeforeAfter";
import Reveal from "@/components/site/Reveal";
import { ButtonLink } from "@/components/ui/Button";

const featured = transformations.find((t) => t.featured) ?? transformations[0];
const rest = transformations.filter((t) => t.id !== featured.id);

export default function TransformationsPreview() {
  return (
    <Section tone="surface">
      <SectionHeading
        eyebrow="Transformations"
        title="The result nobody puts on a poster"
        lede="A scale that barely moves while the body visibly changes is the most reassuring thing that can happen to a dad who has failed at dieting. It is also the least advertised."
      />

      <div className="mt-14 grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:gap-16">
        <BeforeAfter
          before={{ src: featured.beforeSrc, alt: featured.beforeAlt, label: "83kg" }}
          after={{ src: featured.afterSrc, alt: featured.afterAlt, label: "82kg" }}
          metric={{ value: "−1kg", label: "on the scale" }}
          disclaimer={disclaimers.results}
        />

        <Reveal>
          <p className="eyebrow text-lime-deep">{featured.period}</p>
          <h3 className="display mt-4 text-[clamp(1.75rem,1.2rem+2.4vw,3rem)]">{featured.summary}</h3>
          <p className="mt-5 text-base leading-relaxed text-ink-mute">{featured.why}</p>

          <ul className="mt-8 flex flex-wrap gap-2">
            {rest.map((item) => (
              <li key={item.id} className="rounded-full border border-line px-4 py-2 text-sm font-medium">
                <span className="text-lime-deep">{item.metric}</span>{" "}
                <span className="text-ink-mute">{item.metricLabel}</span>
              </li>
            ))}
          </ul>

          <ButtonLink href="/transformations" variant="ink" size="lg" className="mt-8">
            All the numbers
            <ArrowRight className="size-4" aria-hidden />
          </ButtonLink>
        </Reveal>
      </div>
    </Section>
  );
}
