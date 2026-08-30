import { faqs } from "@/lib/content";
import Section from "@/components/ui/Section";
import SectionHeading from "@/components/ui/SectionHeading";
import Faq from "@/components/ui/Faq";
import JsonLd from "@/components/site/JsonLd";

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((item) => ({
    "@type": "Question",
    name: item.q,
    acceptedAnswer: { "@type": "Answer", text: item.a },
  })),
};

export default function FaqSection() {
  return (
    <Section tone="surface" id="faq">
      <JsonLd data={faqSchema} />
      <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
        <SectionHeading
          eyebrow="Questions"
          title="The things dads actually ask"
          className="lg:sticky lg:top-28 lg:self-start"
        />
        <Faq items={faqs} />
      </div>
    </Section>
  );
}
