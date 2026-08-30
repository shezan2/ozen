import { problem } from "@/lib/content";
import Section from "@/components/ui/Section";
import SectionHeading from "@/components/ui/SectionHeading";
import Reveal from "@/components/site/Reveal";

export default function ProblemSection() {
  return (
    <Section tone="surface">
      <SectionHeading eyebrow={problem.eyebrow} title={problem.heading} lede={problem.intro} />

      <div className="mt-14 grid gap-px overflow-hidden rounded-3xl bg-line sm:grid-cols-2">
        {problem.items.map((item, index) => (
          <Reveal key={item.title} delay={index * 70} className="bg-surface-off p-7 sm:p-9">
            <p className="display text-sm text-lime-deep">0{index + 1}</p>
            <h3 className="display-tight mt-4 text-xl text-ink sm:text-2xl">{item.title}</h3>
            <p className="mt-3 text-[0.9375rem] leading-relaxed text-ink-mute">{item.body}</p>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
