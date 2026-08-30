import type { Metadata } from "next";
import { pageMeta } from "@/lib/content";
import Hero from "@/components/sections/Hero";
import ProblemSection from "@/components/sections/ProblemSection";
import MethodPreview from "@/components/sections/MethodPreview";
import TransformationsPreview from "@/components/sections/TransformationsPreview";
import TestimonialSection from "@/components/sections/TestimonialSection";
import TravelSection from "@/components/sections/TravelSection";
import FaqSection from "@/components/sections/FaqSection";
import FinalCta from "@/components/sections/FinalCta";
import Section from "@/components/ui/Section";
import Ticker from "@/components/ui/Ticker";
import LineReveal from "@/components/site/LineReveal";
import TimelineEstimator from "@/components/tools/TimelineEstimator";

export const metadata: Metadata = {
  title: { absolute: pageMeta.home.title },
  description: pageMeta.home.description,
  alternates: { canonical: "/" },
  openGraph: {
    title: pageMeta.home.title,
    description: pageMeta.home.description,
    url: "/",
  },
};

/** Only the client's own figures and his own bio lines. Nothing invented. */
const tickerItems = [
 "85kg → 75kg",
 "3 hours a week",
 "83kg → 82kg",
 "Strong, present, chase the kids",
 "−5% body fat",
 "Built around your life, not against it",
 "78kg → 74kg",
];

export default function HomePage() {
  return (
    <>
      <Hero />
      <Ticker items={tickerItems} tone="lime" />
      <ProblemSection />
      <MethodPreview />
      <TransformationsPreview />
      <TestimonialSection />
      <TravelSection />

      <Section tone="ink" size="tall" id="timeline">
        <div className="max-w-3xl">
          <p className="label flex items-center gap-3 text-white/55">
            <span className="h-px w-8 bg-lime" aria-hidden />
            No promises, just arithmetic
          </p>
          <LineReveal
            className="display mt-6 text-[clamp(2.125rem,1.3rem+3.2vw,3.75rem)] text-white"
            lines={["Put your own", "numbers in."]}
          />
          <p className="lede mt-7 text-white/70">
            Where you are, where you want to be, and how much training you can honestly commit to.
            The answer comes back as a range, because that is what an honest answer looks like.
          </p>
        </div>
        <div className="mt-12">
          <TimelineEstimator />
        </div>
      </Section>

      <FaqSection />
      <FinalCta />
    </>
  );
}
