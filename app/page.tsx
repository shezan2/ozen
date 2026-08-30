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
import SectionHeading from "@/components/ui/SectionHeading";
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

export default function HomePage() {
  return (
    <>
      <Hero />
      <ProblemSection />
      <MethodPreview />
      <TransformationsPreview />
      <TestimonialSection />
      <TravelSection />

      <Section tone="off" id="timeline">
        <SectionHeading
          eyebrow="No promises, just arithmetic"
          title="Put your own numbers in"
          lede="Where you are, where you want to be, and how much training you can honestly commit to. The answer comes back as a range, because that is what an honest answer looks like."
        />
        <div className="mt-12">
          <TimelineEstimator />
        </div>
      </Section>

      <FaqSection />
      <FinalCta />
    </>
  );
}
