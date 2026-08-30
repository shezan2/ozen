import type { Metadata } from "next";
import Image from "next/image";
import { pageMeta } from "@/lib/content";
import { siteConfig } from "@/lib/site-config";
import PageHero from "@/components/sections/PageHero";
import FinalCta from "@/components/sections/FinalCta";
import Section from "@/components/ui/Section";
import SectionHeading from "@/components/ui/SectionHeading";
import Reveal from "@/components/site/Reveal";
import JsonLd from "@/components/site/JsonLd";

export const metadata: Metadata = {
  title: pageMeta.about.title,
  description: pageMeta.about.description,
  alternates: { canonical: "/about" },
  openGraph: {
    title: pageMeta.about.title,
    description: pageMeta.about.description,
    url: "/about",
  },
};

const personSchema = {
 "@context": "https://schema.org",
 "@type": "Person",
 "@id": `${siteConfig.url}/about#coach`,
  name: siteConfig.coach.name,
  alternateName: siteConfig.coach.handle,
  jobTitle: siteConfig.coach.jobTitle,
  description: `${siteConfig.coach.role} in ${siteConfig.location.city}. ${siteConfig.tagline}.`,
  url: `${siteConfig.url}/about`,
  image: `${siteConfig.url}/images/about-myo.jpg`,
  worksFor: { "@id": `${siteConfig.url}/#business` },
  knowsAbout: [
   "Personal training",
   "Fat loss for working parents",
   "Time-efficient resistance training",
   "General nutrition guidance",
  ],
  hasCredential: siteConfig.coach.certifications.map((credential) => ({
   "@type": "EducationalOccupationalCredential",
    name: credential,
  })),
  sameAs: [siteConfig.social.instagram, siteConfig.social.threads],
};

export default function AboutPage() {
  return (
    <>
      <JsonLd data={personSchema} />

      <PageHero
        label="About"
        titleLines={["A method built by someone", "who ran out of time first."]}
        lede="Coaching for working fathers is not a niche picked off a whiteboard. It is the problem that nearly ended this coach's own training."
      />

      <Section tone="surface">
        <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
          <Reveal className="relative aspect-4/5 overflow-hidden bg-surface-sunken lg:sticky lg:top-28 lg:self-start">
            <Image
              src="/images/about-myo.jpg"
              alt={`${siteConfig.coach.name} photographed on the gym floor [TODO: replace with a real portrait]`}
              fill
              sizes="(min-width: 1024px) 26rem, 92vw"
              loading="eager"
              fetchPriority="high"
              className="object-cover"
            />
          </Reveal>

          <div>
            <SectionHeading label="The short version" title="Fifty-hour weeks killed the old way of training" />
            <div className="mt-7 space-y-5 text-base leading-relaxed text-ink-mute">
              <p>
                A fifty-hour engineering work week is what broke the training methods{" "}
                {siteConfig.coach.name} had been using. Not motivation, not knowledge — time. The
                programmes assumed evenings that no longer existed, and the whole thing came close
                to being abandoned for good.
              </p>
              <p>
                What came out the other side is a way of training designed at the size of the time
                actually available, rather than a full programme with the hard parts trimmed off.
                That is the method on this site.
              </p>
              <p className="text-sm text-ink-faint">
                [TODO: confirm this story with Myo and expand it in his own words — where he trained,
                what he changed, and when he started coaching. Nothing here should stay in paraphrase
                if he would rather tell it himself.]
              </p>
            </div>

            <h2 className="display-tight mt-14 text-2xl text-ink sm:text-3xl">Why dads, specifically</h2>
            <div className="mt-5 space-y-5 text-base leading-relaxed text-ink-mute">
              <p>
                Because the constraint is the same one every time. A working father in his thirties
                or forties is not short of willingness. He is short of hours, and every plan he has
                been sold quietly assumed he had them.
              </p>
              <p>
                The goal is not a physique for a stage. It is being strong enough to be present —
                to get through the week without running on empty, and to still have something left
                for the kids at the end of it.
              </p>
            </div>
          </div>
        </div>
      </Section>

      <Section tone="off">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <SectionHeading label="The name" title="Where “Myo” comes from" />
            <div className="mt-7 space-y-5 text-base leading-relaxed text-ink-mute">
              <p>
                <span className="font-semibold text-ink">myo-</span> is a combining form from Greek{" "}
                <em>mŷs</em> — mouse, muscle. The Greeks looked at a muscle moving under the skin
                and saw a mouse running under a rug.
              </p>
              <p>
                It is a good name for this kind of coaching. Muscle is the thing being protected
                while the weight comes down, and it is the reason a client can lose one kilogram on
                the scale and still look like a different person.
              </p>
            </div>
          </div>

          <div>
            <h2 className="display-tight text-2xl text-ink sm:text-3xl">Qualifications</h2>
            <ul className="mt-6 divide-y divide-line border-y border-line">
              {siteConfig.coach.certifications.map((credential) => (
                <li key={credential} className="py-4 text-base font-medium text-ink">
                  {credential}
                </li>
              ))}
              <li className="py-4 text-base font-medium text-ink">
                {siteConfig.coach.yearsCoaching} years coaching
              </li>
              <li className="py-4 text-base font-medium text-ink">{siteConfig.location.trainingModel}</li>
            </ul>
            <p className="mt-5 text-sm leading-relaxed text-ink-mute">
              Coaching is training and general nutrition guidance. It is not medical care: nothing
              here treats, diagnoses or rehabilitates a condition, and anything in that territory
              belongs with your doctor.
            </p>
            <div className="relative mt-9 aspect-3/2 overflow-hidden bg-surface-sunken">
              <Image
                src="/images/about-gym.jpg"
                alt="The gym floor where in-person sessions run [TODO: replace with a real photo of the partner gym]"
                fill
                sizes="(min-width: 1024px) 30rem, 92vw"
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </Section>

      <FinalCta
        lines={["Same constraint,", "different outcome."]}
        body="If the reason you stopped last time was time rather than willingness, this is the conversation worth having."
      />
    </>
  );
}
