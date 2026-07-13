import Link from "next/link";
import Marquee from "@/components/ui/Marquee";
import MagneticButton from "@/components/ui/MagneticButton";
import Reveal from "@/components/ui/Reveal";
import GradientButton from "@/components/kokonutui/gradient-button";
import { site } from "@/lib/site";

const words = ["design", "development", "speed", "care", "conversion", "craft"];

export default function FinalCta() {
  return (
    <section className="relative overflow-hidden">
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 h-[480px] w-[720px] -translate-x-1/2 -translate-y-1/2 animate-aurora rounded-full bg-iris/10 blur-3xl"
        aria-hidden
      />
      <div className="relative mx-auto flex max-w-4xl flex-col items-center px-5 py-28 text-center sm:px-8 sm:py-40">
        <Marquee className="w-full py-4" duration={24}>
          {words.map((word) => (
            <span
              key={word}
              className="flex items-center gap-6 font-mono text-[0.7rem] uppercase tracking-[0.3em] text-ink-faint"
            >
              {word} <span className="text-iris/60">·</span>
            </span>
          ))}
        </Marquee>

        <Reveal className="mt-12">
          <h2 className="font-display text-4xl font-medium leading-[1.1] tracking-tight text-ink sm:text-6xl">
            Your business deserves better
            <br />
            than a <span className="iris-text">template.</span>
          </h2>
        </Reveal>

        <Reveal delay={0.15} className="mt-12">
          <MagneticButton>
            <Link href="/book" className="block">
              <GradientButton label="Book your call — it's free" className="h-14 px-10" />
            </Link>
          </MagneticButton>
        </Reveal>

        <Reveal delay={0.25} className="mt-8">
          <a
            href={`mailto:${site.email}`}
            className="font-mono text-[0.7rem] uppercase tracking-[0.25em] text-ink-dim transition-colors hover:text-ink"
          >
            or write to {site.email}
          </a>
        </Reveal>
      </div>
    </section>
  );
}
