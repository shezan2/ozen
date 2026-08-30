import { faqs } from "@/lib/content";
import Section from "@/components/ui/Section";
import Faq from "@/components/ui/Faq";
import JsonLd from "@/components/site/JsonLd";
import LineReveal from "@/components/site/LineReveal";

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
    <Section tone="surface" size="tall" id="faq">
      <JsonLd data={faqSchema} />
      <div className="grid gap-12 lg:grid-cols-[minmax(0,20rem)_1fr] lg:gap-20">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <p className="label flex items-center gap-3 text-ink-mute">
            <span className="h-px w-8 bg-lime-deep" aria-hidden />
            Questions
          </p>
          <LineReveal
            className="display mt-6 text-[clamp(2.125rem,1.4rem+2.6vw,3.25rem)]"
            lines={["The things dads", "actually ask"]}
          />
        </div>
        <Faq items={faqs} />
      </div>
    </Section>
  );
}
