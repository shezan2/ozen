import Link from "next/link";
import CountUp from "@/components/CountUp";
import GradientButton from "@/components/kokonutui/gradient-button";
import ShimmerText from "@/components/kokonutui/shimmer-text";
import Reveal from "@/components/ui/Reveal";
import SectionHeading from "@/components/ui/SectionHeading";
import { buildFeatures, careFeatures } from "@/lib/content";

function Check() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="mt-0.5 h-4 w-4 shrink-0 text-iris" aria-hidden>
      <path d="M4 10.5 8.5 15 16 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function Pricing() {
  return (
    <section id="pricing" className="mx-auto max-w-6xl px-5 py-28 sm:px-8 sm:py-36">
      <SectionHeading
        eyebrow="Pricing"
        title="One flat price. Zero surprises."
        description="You know exactly what you pay and exactly what you get — before we write a single line of code."
        align="center"
        className="items-center"
      />

      <div className="mx-auto mt-16 grid max-w-4xl gap-6 lg:grid-cols-5">
        {/* Featured build package */}
        <Reveal className="lg:col-span-3">
          <div className="relative h-full overflow-hidden rounded-2xl border border-iris/30 bg-surface p-8 sm:p-10">
            <div
              className="pointer-events-none absolute -top-24 left-1/2 h-48 w-96 -translate-x-1/2 rounded-full bg-iris/15 blur-3xl"
              aria-hidden
            />
            <p className="eyebrow">The ozen website</p>
            <div className="mt-6 flex items-end gap-2">
              <span className="font-mono text-5xl font-medium tracking-tight text-ink sm:text-6xl">
                $<CountUp to={2000} separator="," duration={1.4} />
              </span>
              <span className="mb-1.5 font-mono text-xs uppercase tracking-[0.2em] text-ink-dim">
                one-time
              </span>
            </div>
            <div className="hairline mt-8" aria-hidden />
            <ul className="mt-8 flex flex-col gap-4">
              {buildFeatures.map((feature) => (
                <li key={feature} className="flex items-start gap-3 text-sm leading-relaxed text-ink-dim">
                  <Check />
                  {feature}
                </li>
              ))}
            </ul>
            <Link href="/book" className="mt-10 block">
              <GradientButton label="Start your project" className="w-full" />
            </Link>
          </div>
        </Reveal>

        {/* Care plan */}
        <Reveal delay={0.12} className="lg:col-span-2">
          <div className="flex h-full flex-col rounded-2xl border border-line bg-canvas-raised p-8 sm:p-10">
            <p className="eyebrow !text-ink-dim">Care plan</p>
            <div className="mt-6 flex items-end gap-2">
              <span className="font-mono text-4xl font-medium tracking-tight text-ink">
                $<CountUp to={199} duration={1.2} />
              </span>
              <span className="mb-1 font-mono text-xs uppercase tracking-[0.2em] text-ink-dim">
                /month
              </span>
            </div>
            <ul className="mt-8 flex flex-col gap-4">
              {careFeatures.map((feature) => (
                <li key={feature} className="flex items-start gap-3 text-sm leading-relaxed text-ink-dim">
                  <Check />
                  {feature}
                </li>
              ))}
            </ul>
            <p className="mt-auto pt-8 font-mono text-[0.65rem] uppercase tracking-[0.2em] text-ink-faint">
              Optional · cancel anytime
            </p>
          </div>
        </Reveal>
      </div>

      <ShimmerText
        text="No hidden fees. You own everything."
        className="!text-lg !font-medium !tracking-tight sm:!text-xl"
      />
    </section>
  );
}
