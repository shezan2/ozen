import Link from "next/link";
import Crest from "@/components/club/Crest";

export default function NotFound() {
  return (
    <div className="flex min-h-[100svh] flex-col items-center justify-center px-5 text-center">
      <Crest size={72} />
      <p className="mt-10 text-xs font-semibold uppercase tracking-[0.2em] text-ink-faint">404</p>
      <h1 className="mt-4 text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
        This page doesn&apos;t exist.
      </h1>
      <p className="mt-4 max-w-md text-sm leading-relaxed text-ink-dim">
        The pitch you&apos;re looking for isn&apos;t here. Let&apos;s get you back on side.
      </p>
      <div className="mt-10 flex items-center gap-4">
        <Link
          href="/"
          className="rounded-full border border-line px-6 py-3 text-sm font-semibold text-ink-dim transition-colors hover:border-gold/50 hover:text-ink"
        >
          Back home
        </Link>
        <Link
          href="/matches"
          className="rounded-full bg-noir px-6 py-3 text-sm font-semibold text-paper-ink transition-colors hover:bg-navy"
        >
          View matches
        </Link>
      </div>
    </div>
  );
}
