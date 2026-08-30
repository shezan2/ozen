import { problem } from "@/lib/content";
import Section from "@/components/ui/Section";
import Reveal from "@/components/site/Reveal";
import LineReveal from "@/components/site/LineReveal";

export default function ProblemSection() {
  return (
    <Section tone="ink" size="tall">
      <div className="max-w-3xl">
        <p className="label flex items-center gap-3 text-white/55">
          <span className="h-px w-8 bg-lime" aria-hidden />
          {problem.label}
        </p>
        <LineReveal
          className="display mt-6 text-[clamp(2.125rem,1.1rem+4vw,4.25rem)] text-white"
          lines={["You have already tried.", "That is the whole point."]}
        />
        <p className="lede mt-7 text-white/70">{problem.intro}</p>
      </div>

      {/* Ghost numerals set against the copy — scale contrast rather than a
          grid of bordered cards. */}
      <ol className="mt-16 border-t border-white/15">
        {problem.items.map((item, index) => (
          <Reveal
            key={item.title}
            as="li"
            delay={index * 60}
            className="grid gap-3 border-b border-white/15 py-9 sm:grid-cols-[6rem_1fr] sm:gap-8 lg:grid-cols-[9rem_minmax(0,26rem)_1fr] lg:gap-12"
          >
            <span
              className="numeral text-[clamp(3rem,2rem+3vw,5.5rem)] text-white/15 select-none"
              aria-hidden
            >
              0{index + 1}
            </span>
            <h3 className="display-tight self-center text-xl text-white sm:text-2xl">{item.title}</h3>
            {/* Two columns at sm, three at lg — the body has to be told where to
                sit at each, or it drops back into the numeral's column. */}
            <p className="self-center text-[0.9375rem] leading-relaxed text-white/60 sm:col-start-2 lg:col-start-3 lg:row-start-1">
              {item.body}
            </p>
          </Reveal>
        ))}
      </ol>
    </Section>
  );
}
