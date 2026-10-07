import Crest from "./Crest";
import ScrollCue from "./ScrollCue";
import PillLink from "@/components/ui/PillLink";
import { club } from "@/lib/site";

/** The club's name set full width on a flat field of club blue, under the crest. */
export default function HomeHero({ nextSectionId }: { nextSectionId: string }) {
  return (
    <section className="bg-blue text-white">
      <div className="wrap flex min-h-[calc(100svh-4rem)] flex-col justify-between gap-10 py-8 sm:min-h-[calc(100svh-4.5rem)] sm:py-12">
        <Crest size={352} priority className="size-28 sm:size-36 lg:size-44" />

        <h1 className="display text-[34vw] leading-[0.84] sm:text-[min(22vw,20.4rem)] sm:whitespace-nowrap">
          <span className="block sm:inline">Chèvre</span> <span className="block sm:inline">Noir</span>
        </h1>

        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <p className="max-w-md text-[17px] leading-relaxed text-haze">
            The official home of {club.fullName}. Every player, every match and every goal of the {club.season} season.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <PillLink href="/squad">View the squad</PillLink>
            <PillLink href="/matches" variant="noir">
              View results
            </PillLink>
            <ScrollCue targetId={nextSectionId} label="Scroll to the latest result" />
          </div>
        </div>
      </div>
    </section>
  );
}
