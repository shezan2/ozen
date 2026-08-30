import type { Metadata } from "next";
import { pageMeta } from "@/lib/content";
import { siteConfig, whatsAppLink } from "@/lib/site-config";
import { ButtonLink, buttonStyles } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: pageMeta.notFound.title,
  description: pageMeta.notFound.description,
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <section className="on-ink flex min-h-[70vh] items-center bg-ink px-5 py-24 text-white sm:px-8">
      <div className="mx-auto max-w-2xl">
        <p className="label text-lime">404</p>
        <h1 className="display mt-5 text-[clamp(2.25rem,1.4rem+3.8vw,4rem)]">
          That page is not here.
        </h1>
        <p className="lede mt-6 text-white/70">
          It may have moved, or the link may be wrong. The three-hour method, the client numbers and
          the pricing are all a click away.
        </p>
        <div className="mt-9 flex flex-wrap gap-3">
          <ButtonLink href="/" variant="lime" size="lg">
            Back to the home page
          </ButtonLink>
          <a
            href={whatsAppLink()}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonStyles("onInk", "lg")}
          >
            Message {siteConfig.contact.whatsappKeyword}
          </a>
        </div>
      </div>
    </section>
  );
}
