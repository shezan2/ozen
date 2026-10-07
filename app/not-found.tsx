import Crest from "@/components/club/Crest";
import PillLink from "@/components/ui/PillLink";

export default function NotFound() {
  return (
    <section className="wrap flex min-h-[calc(100svh-4.5rem)] flex-col items-start justify-center gap-10 py-20">
      <Crest size={128} className="size-24" />
      <div className="flex flex-col gap-5">
        <h1 className="display text-[clamp(4rem,13vw,10rem)] text-white">Page not found</h1>
        <p className="max-w-md text-[17px] leading-relaxed text-silver">
          This page doesn&apos;t exist. Head back to the latest result or the full fixture list.
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <PillLink href="/">Go to home</PillLink>
        <PillLink href="/matches" variant="navy">
          View matches
        </PillLink>
      </div>
    </section>
  );
}
