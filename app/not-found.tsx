import Link from "next/link";
import Crest from "@/components/club/Crest";

export default function NotFound() {
  return (
    <div className="flex min-h-[100svh] flex-col items-center justify-center px-5 text-center">
      <Crest size={72} />
      <p className="mt-10 font-display text-sm uppercase tracking-[0.2em] text-gold-deep">404</p>
      <h1 className="font-display mt-4 text-5xl uppercase tracking-tight text-ink sm:text-6xl">
        This page doesn&apos;t exist.
      </h1>
      <p className="mt-4 max-w-md text-sm leading-relaxed text-ink-dim">
        The pitch you&apos;re looking for isn&apos;t here. Let&apos;s get you back on side.
      </p>
      <div className="mt-10 flex items-center gap-4">
        <Link
          href="/"
          className="border-2 border-noir px-6 py-3 text-sm font-bold uppercase tracking-wide text-ink transition-colors hover:bg-noir hover:text-paper-ink"
        >
          Back home
        </Link>
        <Link
          href="/matches"
          className="bg-gold px-6 py-3 text-sm font-bold uppercase tracking-wide text-noir transition-transform hover:-translate-y-0.5"
        >
          View matches
        </Link>
      </div>
    </div>
  );
}
