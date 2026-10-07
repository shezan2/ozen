import Crest from "@/components/club/Crest";
import PillLink from "@/components/ui/PillLink";

export default function NotFound() {
  return (
    <section className="relative flex min-h-[100svh] flex-col items-center justify-center gap-10 overflow-hidden px-5 text-center">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_45%_60%_at_50%_-5%,rgba(43,79,176,0.55),transparent_75%)]"
      />
      <Crest size={112} className="relative size-24 drop-shadow-[0_24px_48px_rgba(43,79,176,0.5)]" />
      <div className="relative flex flex-col gap-5">
        <h1 className="font-display text-[clamp(3.5rem,9vw,7.5rem)] leading-none text-chalk lg:opsz-36">Page not found</h1>
        <p className="mx-auto max-w-sm text-base leading-relaxed text-silver">
          This page doesn&apos;t exist. Head back to the latest result or the full fixture list.
        </p>
      </div>
      <div className="relative flex flex-wrap items-center justify-center gap-3">
        <PillLink href="/">Go to home</PillLink>
        <PillLink href="/matches" variant="glass">
          View matches
        </PillLink>
      </div>
    </section>
  );
}
