import SpotlightCard from "@/components/SpotlightCard";
import Reveal from "@/components/ui/Reveal";
import SectionHeading from "@/components/ui/SectionHeading";
import { services } from "@/lib/content";

const glyphs = [
  // One stroked geometric glyph per service, drawn in the brand language.
  <svg key="g0" viewBox="0 0 40 40" fill="none" className="h-9 w-9 text-iris">
    <rect x="7" y="7" width="26" height="26" rx="3" stroke="currentColor" strokeWidth="1.5" />
    <path d="M7 16h26M16 16v17" stroke="currentColor" strokeWidth="1.2" opacity="0.6" />
  </svg>,
  <svg key="g1" viewBox="0 0 40 40" fill="none" className="h-9 w-9 text-iris">
    <path d="M22 5 10 23h8l-2 12 12-18h-8l2-12Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
  </svg>,
  <svg key="g2" viewBox="0 0 40 40" fill="none" className="h-9 w-9 text-iris">
    <rect x="12" y="5" width="16" height="30" rx="4" stroke="currentColor" strokeWidth="1.5" />
    <path d="M17 30h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
  </svg>,
  <svg key="g3" viewBox="0 0 40 40" fill="none" className="h-9 w-9 text-iris">
    <circle cx="20" cy="20" r="14" stroke="currentColor" strokeWidth="1.5" />
    <path d="M20 12v8l6 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.7" />
  </svg>,
];

export default function Services() {
  return (
    <section id="services" className="mx-auto max-w-6xl px-5 py-28 sm:px-8 sm:py-36">
      <SectionHeading
        eyebrow="What we do"
        title={
          <>
            Everything your website needs.
            <br />
            Nothing it doesn&apos;t.
          </>
        }
        description="One team for design, development and care — so you never have to chase three vendors to fix one page."
      />

      <div className="mt-16 grid gap-5 sm:grid-cols-2">
        {services.map((service, i) => (
          <Reveal key={service.index} delay={i * 0.1}>
            <SpotlightCard
              className="h-full !border-line !bg-surface"
              spotlightColor="rgba(143, 125, 255, 0.14)"
            >
              <div className="flex h-full flex-col gap-6">
                <div className="flex items-center justify-between">
                  {glyphs[i]}
                  <span className="font-mono text-xs tracking-[0.3em] text-ink-faint">
                    {service.index}
                  </span>
                </div>
                <div>
                  <h3 className="font-display text-2xl font-medium tracking-tight text-ink">
                    {service.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-ink-dim">
                    {service.description}
                  </p>
                </div>
              </div>
            </SpotlightCard>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
