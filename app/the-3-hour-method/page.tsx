import type { Metadata } from "next";
import Image from "next/image";
import { Check, X } from "lucide-react";
import { disclaimers, method, pageMeta } from "@/lib/content";
import { siteConfig, whatsAppLink } from "@/lib/site-config";
import PageHero from "@/components/sections/PageHero";
import TravelSection from "@/components/sections/TravelSection";
import FinalCta from "@/components/sections/FinalCta";
import Section from "@/components/ui/Section";
import SectionHeading from "@/components/ui/SectionHeading";
import Reveal from "@/components/site/Reveal";
import JsonLd from "@/components/site/JsonLd";
import MacroCalculator from "@/components/tools/MacroCalculator";
import { buttonStyles } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: pageMeta.method.title,
  description: pageMeta.method.description,
  alternates: { canonical: "/the-3-hour-method" },
  openGraph: {
    title: pageMeta.method.title,
    description: pageMeta.method.description,
    url: "/the-3-hour-method",
  },
};

const serviceSchema = {
  "@context": "https://schema.org",
  "@type": "Service",
  "@id": `${siteConfig.url}/the-3-hour-method#service`,
  name: "The 3-Hour Method",
  serviceType: "Personal training and nutrition coaching",
  description:
    "Time-efficient personal training for working fathers in Singapore: three hours of training a week, general nutrition guidance, and eating guidance built for travel and eating out.",
  url: `${siteConfig.url}/the-3-hour-method`,
  provider: { "@id": `${siteConfig.url}/#business` },
  areaServed: { "@type": "City", name: siteConfig.schema.areaServed },
  audience: {
    "@type": "Audience",
    audienceType: "Working fathers in Singapore with limited training time",
  },
};

/** Why three hours is enough. No figures beyond the client's own results. */
const whyItWorks = [
  {
    title: "Resistance training protects your shape",
    body: "Cutting calories alone takes muscle down with the fat, which is how people end up lighter and softer. Training against resistance keeps the weight you lose to the weight you wanted to lose.",
  },
  {
    title: "Frequency beats one heroic session",
    body: "Two or three arranged sessions do more than a single long weekend one, because the work is spread across the week and there is less to recover from each time.",
  },
  {
    title: "The hours are not in the gym",
    body: "Training is the three hours. Eating is the rest of the week, which is why guidance for hawker lunches, client dinners and hotel breakfasts matters more than adding another session.",
  },
];

export default function MethodPage() {
  return (
    <>
      <JsonLd data={serviceSchema} />

      <PageHero
        eyebrow="The 3-hour method"
        title="Three hours a week is the whole training budget."
        lede="Not a stripped-back version of a bigger programme. It is designed at three hours, for someone whose evenings already belong to other people."
      >
        <a
          href={whatsAppLink()}
          target="_blank"
          rel="noopener noreferrer"
          className={buttonStyles("lime", "lg")}
        >
          Message {siteConfig.contact.whatsappKeyword} to start
        </a>
      </PageHero>

      <Section tone="surface">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <SectionHeading eyebrow="What it looks like" title={method.heading} lede={method.intro} />
            <div className="relative mt-9 aspect-3/2 overflow-hidden rounded-2xl bg-surface-sunken">
              <Image
                src="/images/method-hero.jpg"
                alt="A rack, a bench and a set of dumbbells laid out for a session [TODO: replace with a real photo of the training space]"
                fill
                sizes="(min-width: 1024px) 30rem, 92vw"
                loading="eager"
                fetchPriority="high"
                className="object-cover"
              />
            </div>
          </div>

          <ol className="divide-y divide-line border-y border-line">
            {method.pillars.map((pillar, index) => (
              <Reveal key={pillar.number} as="li" delay={index * 60} className="py-8 first:pt-0 last:pb-0">
                <div className="flex items-baseline gap-4">
                  <span className="display text-sm text-lime-deep">{pillar.number}</span>
                  <h2 className="display-tight text-xl text-ink sm:text-2xl">{pillar.title}</h2>
                </div>
                <p className="mt-3 pl-10 text-[0.9375rem] leading-relaxed text-ink-mute">{pillar.body}</p>
                {pillar.detail ? (
                  <p className="mt-3 pl-10 text-xs leading-relaxed text-ink-faint">{pillar.detail}</p>
                ) : null}
              </Reveal>
            ))}
          </ol>
        </div>
      </Section>

      <Section tone="ink">
        <SectionHeading
          tone="dark"
          eyebrow="Why it works"
          title="A small budget, arranged properly"
          lede="Three hours is not a compromise you get talked into. It is the constraint the whole thing is designed around."
        />
        <div className="mt-14 grid gap-px overflow-hidden rounded-3xl bg-line-dark md:grid-cols-3">
          {whyItWorks.map((item, index) => (
            <Reveal key={item.title} delay={index * 70} className="bg-ink-soft p-7 sm:p-8">
              <h3 className="display-tight text-lg text-white sm:text-xl">{item.title}</h3>
              <p className="mt-3 text-[0.9375rem] leading-relaxed text-white/65">{item.body}</p>
            </Reveal>
          ))}
        </div>
        <p className="mt-8 max-w-2xl text-xs leading-relaxed text-white/60">
          {disclaimers.headlineQualifier} {disclaimers.preParticipation}
        </p>
      </Section>

      <TravelSection
        tone="off"
        imageSrc="/images/method-eating-out.jpg"
        imageAlt="A restaurant table mid-meal photographed from above [TODO: replace with a real photo used with permission]"
      />

      <Section tone="surface">
        <div className="grid gap-10 md:grid-cols-2 md:gap-14">
          <div>
            <h2 className="display text-2xl text-ink sm:text-3xl">{method.suitsHeading}</h2>
            <ul className="mt-6 space-y-4">
              {method.suits.map((item) => (
                <li key={item} className="flex gap-3 text-[0.9375rem] leading-relaxed text-ink-mute">
                  <Check className="mt-0.5 size-5 shrink-0 text-lime-deep" aria-hidden />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="display text-2xl text-ink sm:text-3xl">{method.notSuitsHeading}</h2>
            <ul className="mt-6 space-y-4">
              {method.notSuits.map((item) => (
                <li key={item} className="flex gap-3 text-[0.9375rem] leading-relaxed text-ink-mute">
                  <X className="mt-0.5 size-5 shrink-0 text-ink-faint" aria-hidden />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      <Section tone="off" id="macros">
        <SectionHeading
          eyebrow="Work out the eating side"
          title="Roughly what your day should hold"
          lede="A standard formula run on your own numbers. It gives you a sense of scale — how much protein is actually a lot, what a deficit looks like in food — before anyone talks about a plan."
        />
        <div className="mt-12">
          <MacroCalculator />
        </div>
      </Section>

      <FinalCta
        heading="Three hours. Start this week."
        body="Message RESET and you get a straight answer on what three hours a week could realistically do from where you are now."
      />
    </>
  );
}
