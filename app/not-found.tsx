import Link from "next/link";
import Crest from "@/components/club/Crest";

export default function NotFound() {
  return (
    <div className="flex min-h-[100svh] flex-col items-center justify-center gap-6 px-5 text-center">
      <Crest size={56} />
      <div className="flex flex-col gap-2">
        <p className="text-xs text-ink-faint">404</p>
        <h1 className="font-serif text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
          This page doesn&apos;t exist.
        </h1>
        <p className="mx-auto max-w-sm text-sm leading-relaxed text-ink-dim">
          The pitch you&apos;re looking for isn&apos;t here. Let&apos;s get you back on side.
        </p>
      </div>
      <div className="flex items-center gap-6">
        <Link href="/" className="border-b border-ink pb-0.5 text-sm font-medium text-ink transition-colors hover:border-navy hover:text-navy">
          Back home
        </Link>
        <Link href="/matches" className="border-b border-ink-dim pb-0.5 text-sm text-ink-dim transition-colors hover:border-navy hover:text-navy">
          View matches
        </Link>
      </div>
    </div>
  );
}
