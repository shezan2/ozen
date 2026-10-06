import Link from "next/link";
import Crest from "@/components/club/Crest";

export default function NotFound() {
  return (
    <section className="floodlight flex min-h-[100svh] flex-col items-center justify-center gap-8 px-5 text-center">
      <Crest size={88} />
      <div className="flex flex-col gap-3">
        <h1 className="type-display text-6xl sm:text-8xl">Page not found</h1>
        <p className="mx-auto max-w-sm text-base text-silver">This page doesn&apos;t exist. Head back to the latest result or the full fixture list.</p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link href="/" className="type-name bg-chalk px-6 py-3 text-sm tracking-[0.04em] text-field transition-colors hover:bg-silver">
          Go to home
        </Link>
        <Link
          href="/matches"
          className="type-name border border-line-strong px-6 py-3 text-sm tracking-[0.04em] text-chalk transition-colors hover:border-chalk"
        >
          View matches
        </Link>
      </div>
    </section>
  );
}
