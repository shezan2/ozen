import type { Metadata } from "next";
import { pageMeta } from "@/lib/content";
import { siteConfig } from "@/lib/site-config";
import PageHero from "@/components/sections/PageHero";
import Section from "@/components/ui/Section";

export const metadata: Metadata = {
  title: pageMeta.privacy.title,
  description: pageMeta.privacy.description,
  alternates: { canonical: "/privacy-policy" },
  robots: { index: true, follow: true },
  openGraph: {
    title: pageMeta.privacy.title,
    description: pageMeta.privacy.description,
    url: "/privacy-policy",
  },
};

/**
 * Scaffold only.
 *
 * The site collects personal and health-adjacent data (name, contact details,
 * weight, goals, training history) through the enquiry form, and health-adjacent
 * inputs through the two calculators. Under Singapore's PDPA that needs a real
 * policy written or reviewed by the operator. Deliberately not generated here —
 * placeholder legal text that reads as finished is worse than an obvious gap.
 */
const sections = [
  {
    heading: "Who is responsible for your data",
    prompt:
      "Name the legal entity behind the business, its registered address, and the person or email address that handles data protection enquiries (the PDPA requires a designated Data Protection Officer contact).",
  },
  {
    heading: "What is collected",
    prompt:
      "List what the enquiry form collects (name, email or phone, current weight, goal, hours available per week, what has been tried before) and note that the timeline estimator and macro calculator take health-adjacent inputs. State clearly whether calculator inputs are transmitted anywhere — as built, they are calculated in the browser and are not sent to a server.",
  },
  {
    heading: "Why it is collected and the legal basis",
    prompt:
      "Explain that details are used to reply to the enquiry and to run coaching, and state the basis for consent under the PDPA, including how consent is given and withdrawn.",
  },
  {
    heading: "Who it is shared with",
    prompt:
      "Name every third party that touches the data: the form or email provider, the booking tool, WhatsApp, the hosting provider, and any analytics. Note where each stores data and whether it leaves Singapore.",
  },
  {
    heading: "How long it is kept",
    prompt: "State retention periods for enquiries that do not convert and for client records.",
  },
  {
    heading: "Your rights",
    prompt:
      "Cover access and correction requests, how to make one, and the response timeframe. Include how to withdraw consent and what happens after.",
  },
  {
    heading: "Cookies and analytics",
    prompt:
      "State what the site sets. As built there is no analytics and no tracking cookie — if any is added before launch, it must be described here.",
  },
  {
    heading: "Client photographs and testimonials",
    prompt:
      "Describe how before/after photographs and named testimonials are consented to, and how a client withdraws that consent.",
  },
  {
    heading: "Changes to this policy",
    prompt: "State how changes are notified and keep a last-updated date.",
  },
];

export default function PrivacyPolicyPage() {
  return (
    <>
      <PageHero
        eyebrow="Legal"
        title="Privacy policy"
        lede="This page is a scaffold. It is not a privacy policy yet, and it must not go live in this state."
      />

      <Section tone="surface">
        <div className="max-w-3xl">
          <div className="rounded-2xl border-2 border-gold bg-gold/10 p-6">
            <p className="font-semibold text-ink">[TODO: replace this entire page before launch]</p>
            <p className="mt-2 text-[0.9375rem] leading-relaxed text-ink-mute">
              {siteConfig.brand} collects personal and health-adjacent data through the enquiry form,
              so a real policy is required under Singapore&apos;s Personal Data Protection Act. The
              headings below are the ground it needs to cover. The text underneath each one is a
              prompt for the operator or their lawyer — not draft wording, and not legal advice.
            </p>
          </div>

          <dl className="mt-12 divide-y divide-line border-y border-line">
            {sections.map((section, index) => (
              <div key={section.heading} className="py-7">
                <dt className="display-tight flex items-baseline gap-3 text-xl text-ink">
                  <span className="display text-sm text-lime-deep">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  {section.heading}
                </dt>
                <dd className="mt-3 pl-9 text-[0.9375rem] leading-relaxed text-ink-mute">
                  <span className="font-semibold text-ink">[TODO]</span> {section.prompt}
                </dd>
              </div>
            ))}
          </dl>

          <p className="mt-10 text-sm leading-relaxed text-ink-mute">
            Enquiries about data handling: {siteConfig.contact.email}. [TODO: confirm this is the
            right address for data protection requests, or add a dedicated one.]
          </p>
        </div>
      </Section>
    </>
  );
}
