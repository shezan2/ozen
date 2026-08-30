import { CalendarDays } from "lucide-react";
import { disclaimers } from "@/lib/content";
import { siteConfig, whatsAppLink } from "@/lib/site-config";
import Link from "next/link";
import { buttonStyles } from "@/components/ui/Button";
import Section from "@/components/ui/Section";

type FinalCtaProps = {
  heading?: string;
  body?: string;
};

export default function FinalCta({
  heading = "One word starts it.",
  body = "Message RESET and you get a short conversation about where you are now and what three hours a week could realistically do. Not a sales call, and not a package pitch.",
}: FinalCtaProps) {
  return (
    <Section tone="ink" id="book">
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="display text-[clamp(2.25rem,1.4rem+3.6vw,4rem)]">{heading}</h2>
        <p className="lede mt-6 text-white/70">{body}</p>

        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <a
            href={whatsAppLink()}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonStyles("lime", "lg")}
          >
            Message {siteConfig.contact.whatsappKeyword} on WhatsApp
          </a>
          <a
            href={siteConfig.contact.bookingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonStyles("onInk", "lg")}
          >
            <CalendarDays className="size-4" aria-hidden />
            Book a time
          </a>
        </div>

        <p className="mt-8 text-sm text-white/50">
          Prefer to write it out?{" "}
          <Link href="/contact" className="font-semibold text-lime underline underline-offset-4 hover:text-lime-bright">
            Send an enquiry instead
          </Link>
        </p>

        <p className="mx-auto mt-10 max-w-xl text-xs leading-relaxed text-white/60">
          {disclaimers.preParticipation}
        </p>
      </div>
    </Section>
  );
}
