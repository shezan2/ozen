import type { Metadata } from "next";
import Image from "next/image";
import { Check } from "lucide-react";
import { disclaimers, pageMeta } from "@/lib/content";
import { siteConfig, whatsAppLink } from "@/lib/site-config";
import PageHero from "@/components/sections/PageHero";
import FinalCta from "@/components/sections/FinalCta";
import Section from "@/components/ui/Section";
import SectionHeading from "@/components/ui/SectionHeading";
import Reveal from "@/components/site/Reveal";
import { buttonStyles } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: pageMeta.pricing.title,
  description: pageMeta.pricing.description,
  alternates: { canonical: "/pricing" },
  openGraph: {
    title: pageMeta.pricing.title,
    description: pageMeta.pricing.description,
    url: "/pricing",
  },
};

/** Only what the method itself establishes. Specifics are marked TODO below. */
const included = [
  {
    title: "The roadmap first",
    body: "Where you are, what is realistically ahead, and roughly how long it takes — before anything is sold.",
  },
  {
    title: "Training inside three hours a week",
    body: "Programmed so that missing one session does not undo the week.",
  },
  {
    title: "Nutrition explained, not prescribed",
    body: "General guidance on eating around a working week. No supplements, no meal plan to buy.",
  },
  {
    title: "Travel and eat-out guidance",
    body: "Send the itinerary or the restaurant, get back what to order.",
  },
];

export default function PricingPage() {
  return (
    <>
      <PageHero
        label="Pricing"
        titleLines={["Blocks of sessions,", "not a subscription."]}
        lede="Two in-person blocks and an online option. What you are paying for is the coaching around the sessions as much as the sessions themselves."
      />

      <Section tone="surface">
        <div className="grid gap-6 lg:grid-cols-3">
          {siteConfig.packages.map((pkg, index) => (
            <Reveal
              key={pkg.slug}
              delay={index * 70}
              className={cn(
               "flex flex-col border p-7 sm:p-8",
                pkg.featured ? "on-ink border-ink bg-ink text-white" : "border-line bg-surface-off",
              )}
            >
              {pkg.featured ? (
                <p className="slab-lime label mb-5 inline-block self-start px-2.5 py-1.5">
                  Most take this one
                </p>
              ) : null}

              <h2 className={cn("display-tight text-2xl", pkg.featured ? "text-white" : "text-ink")}>
                {pkg.name}
              </h2>

              <p className="mt-5 flex items-baseline gap-2">
                <span className={cn("display text-4xl", pkg.featured ? "text-lime" : "text-ink")}>
                  {pkg.priceDisplay}
                </span>
                <span className={cn("text-sm", pkg.featured ? "text-white/55" : "text-ink-mute")}>
                  {pkg.unit}
                </span>
              </p>

              <p
                className={cn(
                 "mt-5 flex-1 text-[0.9375rem] leading-relaxed",
                  pkg.featured ? "text-white/70" : "text-ink-mute",
                )}
              >
                {pkg.description}
              </p>

              <a
                href={whatsAppLink(`${siteConfig.contact.whatsappKeyword} — interested in the ${pkg.name} option`)}
                target="_blank"
                rel="noopener noreferrer"
                className={buttonStyles(pkg.featured ? "lime" : "ink", "md", "mt-8 w-full")}
              >
                Ask about {pkg.name}
              </a>
            </Reveal>
          ))}
        </div>

        <p className="mt-8 text-sm leading-relaxed text-ink-mute">
          [TODO: confirm the full inclusion list for each package — session length, how long a block
          runs for, check-in cadence, what the online option covers, and whether prices include GST]
        </p>
      </Section>

      <Section tone="off">
        <div className="grid gap-12 lg:grid-cols-[1fr_1fr] lg:items-center lg:gap-16">
          <div>
            <SectionHeading
              label="In every block"
              title="What you are actually buying"
              lede="The sessions are the visible part. The rest of it is what makes the sessions survive a bad month."
            />
            <ul className="mt-9 divide-y divide-line border-y border-line">
              {included.map((item) => (
                <li key={item.title} className="flex gap-4 py-5">
                  <Check className="mt-0.5 size-5 shrink-0 text-lime-deep" aria-hidden />
                  <div>
                    <h3 className="font-semibold text-ink">{item.title}</h3>
                    <p className="mt-1 text-[0.9375rem] leading-relaxed text-ink-mute">{item.body}</p>
                  </div>
                </li>
              ))}
            </ul>
            <p className="mt-6 text-xs leading-relaxed text-ink-mute">
              {disclaimers.headlineQualifier}
            </p>
          </div>

          <div className="relative aspect-3/2 overflow-hidden bg-surface-sunken">
            <Image
              src="/images/pricing-session.jpg"
              alt="A coaching session in progress, coach spotting a set [TODO: replace with a real session photo]"
              fill
              sizes="(min-width: 1024px) 32rem, 92vw"
              className="object-cover"
            />
          </div>
        </div>
      </Section>

      <FinalCta
        lines={["Not sure", "which block?"]}
        body="Message RESET and describe the week you actually have. The right option falls out of that conversation rather than out of a price list."
      />
    </>
  );
}
