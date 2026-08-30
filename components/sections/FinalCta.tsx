import Link from "next/link";
import { CalendarDays } from "lucide-react";
import { disclaimers } from "@/lib/content";
import { siteConfig, whatsAppLink } from "@/lib/site-config";
import { buttonStyles } from "@/components/ui/Button";
import Section from "@/components/ui/Section";
import LineReveal from "@/components/site/LineReveal";

type FinalCtaProps = {
  lines?: string[];
  body?: string;
};

export default function FinalCta({
  lines = ["One word", "starts it."],
  body = "Message RESET and you get a short conversation about where you are now and what three hours a week could realistically do. Not a sales call, and not a package pitch.",
}: FinalCtaProps) {
  return (
    <Section tone="lime" size="tall" id="book">
      <LineReveal
        className="display text-[clamp(2.75rem,1.4rem+6vw,6.5rem)] text-ink"
        lines={lines}
      />

      <div className="mt-12 grid gap-10 border-t border-ink/25 pt-10 lg:grid-cols-[1fr_auto] lg:items-end">
        <p className="lede max-w-xl text-ink/80">{body}</p>

        <div className="flex flex-wrap gap-3">
          <a
            href={whatsAppLink()}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonStyles("ink", "lg")}
          >
            Message {siteConfig.contact.whatsappKeyword}
          </a>
          <a
            href={siteConfig.contact.bookingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonStyles("outline", "lg")}
          >
            <CalendarDays className="size-4" aria-hidden />
            Book a time
          </a>
        </div>
      </div>

      <div className="mt-10 flex flex-col gap-4 text-sm text-ink/80 sm:flex-row sm:items-center sm:justify-between">
        <p>
          Prefer to write it out?{" "}
          <Link href="/contact" className="font-bold text-ink underline underline-offset-4">
            Send an enquiry instead
          </Link>
        </p>
      </div>

      <p className="mt-8 max-w-2xl text-xs leading-relaxed text-ink/80">
        {disclaimers.preParticipation}
      </p>
    </Section>
  );
}
