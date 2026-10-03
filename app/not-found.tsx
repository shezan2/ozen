import Link from "next/link";
import Crest from "@/components/club/Crest";

export default function NotFound() {
  return (
    <div className="flex min-h-[100svh] flex-col items-center justify-center px-5 text-center">
      <Crest size={64} />
      <p className="mt-10 text-sm font-semibold text-blue-deep">404</p>
      <h1 className="mt-4 text-5xl font-semibold tracking-tight text-ink sm:text-6xl">This page doesn&apos;t exist.</h1>
      <p className="mt-4 max-w-md text-sm leading-relaxed text-ink-dim">
        The pitch you&apos;re looking for isn&apos;t here. Let&apos;s get you back on side.
      </p>
      <div className="mt-10 flex items-center gap-3">
        <Link
          href="/"
          className="rounded-full bg-surface px-6 py-3 text-sm font-semibold text-ink transition-colors hover:bg-black/10"
        >
          Back home
        </Link>
        <Link
          href="/matches"
          className="rounded-full bg-blue px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-deep"
        >
          View matches
        </Link>
      </div>
    </div>
  );
}
