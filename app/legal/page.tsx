import type { Metadata } from "next";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy & Terms",
  description: "How ozen handles your data, and the terms that govern our work.",
};

export default function LegalPage() {
  return (
    <div className="mx-auto max-w-3xl px-5 pb-28 pt-32 sm:px-8">
      <p className="eyebrow">Privacy &amp; Terms</p>
      <h1 className="mt-5 font-display text-4xl font-medium tracking-tight text-ink sm:text-5xl">
        The fine print, in plain English.
      </h1>

      <div className="mt-12 flex flex-col gap-10 text-sm leading-relaxed text-ink-dim">
        <section>
          <h2 className="font-display text-2xl font-medium tracking-tight text-ink">Privacy</h2>
          <p className="mt-4">
            When you book a call or contact us, we collect only what you give us — your
            name, email, company, and anything you write in the message. We use it to
            respond to you and for nothing else. We don&apos;t sell it, share it, or add
            you to mailing lists you didn&apos;t ask for.
          </p>
          <p className="mt-4">
            This site doesn&apos;t use advertising trackers. Basic, anonymous analytics
            may be collected by our hosting provider (Vercel) to keep the site fast and
            reliable. To have your data removed, email{" "}
            <a href={`mailto:${site.email}`} className="text-iris hover:text-iris-bright">
              {site.email}
            </a>{" "}
            and we&apos;ll delete it.
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl font-medium tracking-tight text-ink">Terms</h2>
          <p className="mt-4">
            Website projects are delivered for a flat fee of US$2,000, which includes
            custom design with two rounds of revisions, development, and launch of up to
            five core pages. The optional care plan is US$199/month, cancellable anytime
            with no notice period.
          </p>
          <p className="mt-4">
            You own your website. On final payment, all code, design assets, and content
            we produced for the project belong to you. If you cancel the care plan, we
            hand over hosting and domain access so nothing is held hostage.
          </p>
          <p className="mt-4">
            Quotes, timelines, and scope are confirmed in writing before work begins.
            Anything outside the agreed scope is quoted separately — no surprise
            invoices, ever.
          </p>
        </section>
      </div>
    </div>
  );
}
