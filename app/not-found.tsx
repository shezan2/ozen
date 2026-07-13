import Link from "next/link";
import OzenLogo from "@/components/brand/OzenLogo";

export default function NotFound() {
  return (
    <div className="flex min-h-[100svh] flex-col items-center justify-center px-5 text-center">
      <OzenLogo size={72} className="text-ink-faint" />
      <p className="mt-10 font-mono text-xs uppercase tracking-[0.3em] text-ink-faint">404</p>
      <h1 className="mt-4 font-display text-4xl font-medium tracking-tight text-ink sm:text-5xl">
        This page doesn&apos;t exist.
      </h1>
      <p className="mt-4 max-w-md text-sm leading-relaxed text-ink-dim">
        But your website could. Let&apos;s talk about it.
      </p>
      <div className="mt-10 flex items-center gap-6">
        <Link
          href="/"
          className="rounded-full border border-line px-6 py-3 font-mono text-[0.7rem] uppercase tracking-[0.2em] text-ink-dim transition-colors hover:border-iris/50 hover:text-ink"
        >
          Back home
        </Link>
        <Link
          href="/book"
          className="rounded-full border border-iris/40 bg-iris/10 px-6 py-3 font-mono text-[0.7rem] uppercase tracking-[0.2em] text-iris-bright transition-colors hover:border-iris hover:bg-iris/20"
        >
          Book a call
        </Link>
      </div>
    </div>
  );
}
