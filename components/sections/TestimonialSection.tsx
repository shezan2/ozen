import { testimonial } from "@/lib/content";
import Section from "@/components/ui/Section";
import Reveal from "@/components/site/Reveal";

export default function TestimonialSection() {
  return (
    <Section tone="off" size="tall">
      <div className="grid gap-14 lg:grid-cols-[1fr_minmax(0,20rem)] lg:gap-20">
        <Reveal as="figure">
          <p className="label text-ink-mute">In his own words</p>
          <blockquote className="display-tight mt-7 text-[clamp(1.5rem,1.1rem+1.9vw,2.5rem)] text-ink">
            <span className="text-lime-deep" aria-hidden>
              “
            </span>
            {testimonial.quote}
          </blockquote>
          <figcaption className="mt-9 flex flex-wrap items-center gap-x-4 gap-y-2">
            <span className="slab display-tight px-3 py-1.5 text-base">{testimonial.name}</span>
            <span className="text-sm text-ink-mute">{testimonial.role}</span>
            <span className="text-sm text-ink-faint">{testimonial.source}</span>
          </figcaption>
          <p className="mt-5 max-w-xl text-xs leading-relaxed text-ink-faint">
            {testimonial.consentNote}
          </p>
        </Reveal>

        <Reveal delay={90} from="right" className="lg:border-l lg:border-line lg:pl-10">
          <p className="label text-ink-mute">His result</p>
          <p className="numeral mt-3 text-[clamp(2.75rem,2rem+2.4vw,4rem)] text-ink">
            78<span className="text-ink-faint">→</span>74
            <span className="text-2xl align-top">kg</span>
          </p>

          <h3 className="label mt-10 text-ink-mute">What the recommendation covers</h3>
          <ul className="mt-4 border-t border-line">
            {testimonial.covered.map((point) => (
              <li
                key={point}
                className="border-b border-line py-3.5 text-sm leading-relaxed text-ink-mute"
              >
                {point}
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </Section>
  );
}
