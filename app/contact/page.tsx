import type { Metadata } from "next";
import Image from "next/image";
import { CalendarDays, Mail, MessageCircle } from "lucide-react";
import { disclaimers, pageMeta } from "@/lib/content";
import { siteConfig, whatsAppLink } from "@/lib/site-config";
import PageHero from "@/components/sections/PageHero";
import Section from "@/components/ui/Section";
import SectionHeading from "@/components/ui/SectionHeading";
import EnquiryForm from "@/components/forms/EnquiryForm";
import Reveal from "@/components/site/Reveal";

export const metadata: Metadata = {
  title: pageMeta.contact.title,
  description: pageMeta.contact.description,
  alternates: { canonical: "/contact" },
  openGraph: {
    title: pageMeta.contact.title,
    description: pageMeta.contact.description,
    url: "/contact",
  },
};

const channels = [
  {
    icon: MessageCircle,
    title: `Message ${siteConfig.contact.whatsappKeyword}`,
    body: "One word on WhatsApp. Fastest way in, and the way most clients start.",
    action: siteConfig.contact.whatsappDisplay,
    href: whatsAppLink(),
  },
  {
    icon: CalendarDays,
    title: "Book a time",
    body: "Put a slot in the diary if you would rather talk it through properly.",
    action: "Open the calendar",
    href: siteConfig.contact.bookingUrl,
  },
  {
    icon: Mail,
    title: "Email",
    body: "For anything longer, or if WhatsApp is not your thing.",
    action: siteConfig.contact.email,
    href: `mailto:${siteConfig.contact.email}`,
  },
];

export default function ContactPage() {
  return (
    <>
      <PageHero
        label="Contact"
        titleLines={["One word", "gets it started."]}
        lede={`Message ${siteConfig.contact.whatsappKeyword} on WhatsApp, book a time, or write it out below. Whichever is least effort right now.`}
      />

      <Section tone="surface">
        <div className="grid gap-6 md:grid-cols-3">
          {channels.map((channel, index) => {
            const Icon = channel.icon;
            return (
              <Reveal
                key={channel.title}
                delay={index * 70}
                className="flex flex-col border border-line bg-surface-off p-7"
              >
                <Icon className="size-6 text-lime-deep" aria-hidden />
                <h2 className="display-tight mt-5 text-xl text-ink">{channel.title}</h2>
                <p className="mt-2 flex-1 text-[0.9375rem] leading-relaxed text-ink-mute">
                  {channel.body}
                </p>
                <a
                  href={channel.href}
                  target={channel.href.startsWith("mailto:") ? undefined : "_blank"}
                  rel={channel.href.startsWith("mailto:") ? undefined : "noopener noreferrer"}
                  className="mt-6 font-semibold text-ink underline underline-offset-4 hover:text-lime-deep"
                >
                  {channel.action}
                </a>
              </Reveal>
            );
          })}
        </div>
      </Section>

      <Section tone="off" id="enquiry">
        <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
          <div>
            <SectionHeading
              label="Enquiry"
              title="Tell me what has already failed"
              lede="The last field is the one that matters. Whatever you have already tried and dropped tells more about the right plan than your weight does."
            />
            <div className="mt-10">
              <EnquiryForm />
            </div>
          </div>

          <div className="lg:sticky lg:top-28 lg:self-start">
            <div className="relative aspect-4/5 overflow-hidden bg-surface-sunken">
              <Image
                src="/images/contact-session.jpg"
                alt="A first session getting under way in the gym [TODO: replace with a real photo]"
                fill
                sizes="(min-width: 1024px) 26rem, 92vw"
                className="object-cover"
              />
            </div>
            <div className="mt-6 space-y-3 border border-line bg-surface p-6 text-xs leading-relaxed text-ink-mute">
              <p>{disclaimers.preParticipation}</p>
              <p>
                Coaching runs {siteConfig.location.trainingModel.toLowerCase()}.{" "}
                [TODO: confirm the partner gym and its address, session availability, and how far in
                advance to book]
              </p>
            </div>
          </div>
        </div>
      </Section>
    </>
  );
}
