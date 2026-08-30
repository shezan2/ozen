import { Quote } from "lucide-react";
import { testimonial } from "@/lib/content";
import Section from "@/components/ui/Section";
import Reveal from "@/components/site/Reveal";

export default function TestimonialSection() {
  return (
    <Section tone="ink">
      <div className="grid gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16">
        <Reveal as="figure">
          <Quote className="size-9 text-lime" aria-hidden />
          <blockquote className="display-tight mt-6 text-[clamp(1.375rem,1.05rem+1.5vw,2.125rem)] text-white">
            {testimonial.quote}
          </blockquote>
          <figcaption className="mt-8 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
            <span className="font-semibold text-white">{testimonial.name}</span>
            <span className="text-white/50">{testimonial.role}</span>
            <span className="text-white/55">·</span>
            <span className="text-white/50">{testimonial.source}</span>
          </figcaption>
          <p className="mt-4 text-xs leading-relaxed text-white/60">{testimonial.consentNote}</p>
        </Reveal>

        <Reveal delay={90} className="rounded-3xl border border-line-dark p-7 sm:p-9">
          <p className="eyebrow text-lime">His result</p>
          <p className="display mt-3 text-4xl text-white">{testimonial.result}</p>
          <h3 className="eyebrow mt-9 text-white/60">What the recommendation covers</h3>
          <ul className="mt-4 space-y-3 text-sm leading-relaxed text-white/70">
            {testimonial.covered.map((point) => (
              <li key={point} className="flex gap-3">
                <span className="mt-2 size-1.5 shrink-0 rounded-full bg-lime" aria-hidden />
                {point}
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </Section>
  );
}
