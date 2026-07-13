import Link from "next/link";
import OzenLogo from "@/components/brand/OzenLogo";
import { site } from "@/lib/site";

export default function Footer() {
  return (
    <footer className="border-t border-line bg-canvas-raised">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 px-5 py-14 sm:px-8 md:flex-row md:items-start md:justify-between">
        <div className="flex flex-col gap-4">
          <Link href="/" className="flex items-center gap-2.5 text-ink" aria-label="ozen — home">
            <OzenLogo size={30} />
            <span className="font-display text-2xl font-medium lowercase tracking-tight">ozen</span>
          </Link>
          <p className="max-w-xs text-sm leading-relaxed text-ink-dim">
            Premium websites for businesses that deserve better.
          </p>
        </div>

        <div className="flex flex-wrap gap-x-14 gap-y-8">
          <div className="flex flex-col gap-3">
            <p className="eyebrow">Explore</p>
            <Link href="/#work" className="text-sm text-ink-dim transition-colors hover:text-ink">Work</Link>
            <Link href="/#pricing" className="text-sm text-ink-dim transition-colors hover:text-ink">Pricing</Link>
            <Link href="/#faq" className="text-sm text-ink-dim transition-colors hover:text-ink">FAQ</Link>
            <Link href="/book" className="text-sm text-ink-dim transition-colors hover:text-ink">Book a call</Link>
          </div>
          <div className="flex flex-col gap-3">
            <p className="eyebrow">Contact</p>
            <a href={`mailto:${site.email}`} className="text-sm text-ink-dim transition-colors hover:text-ink">
              {site.email}
            </a>
            <Link href="/legal" className="text-sm text-ink-dim transition-colors hover:text-ink">
              Privacy &amp; Terms
            </Link>
          </div>
        </div>
      </div>
      <div className="border-t border-line">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5 sm:px-8">
          <p className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-ink-faint">
            © 2026 ozen — all rights reserved
          </p>
          <p className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-ink-faint">
            design · build · care
          </p>
        </div>
      </div>
    </footer>
  );
}
