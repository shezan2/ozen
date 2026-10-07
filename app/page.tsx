import { matches, squad, getLeaders } from "@/lib/data";
import HomeHero from "@/components/club/HomeHero";
import ResultsTicker from "@/components/club/ResultsTicker";
import MatchCentre from "@/components/club/MatchCentre";
import SeasonRecord from "@/components/club/SeasonRecord";
import Rail from "@/components/club/Rail";
import ResultTile from "@/components/club/ResultTile";
import PlayerCard from "@/components/club/PlayerCard";
import StatLeaders from "@/components/club/StatLeaders";
import SectionHeading from "@/components/ui/SectionHeading";

export default function Home() {
  const played = matches.filter((m) => m.result !== "Upcoming");
  const latest = played[played.length - 1];
  const mostRecentFirst = [...played].reverse();
  const regulars = getLeaders(squad, "appearances").slice(0, 8);

  return (
    <div className="flex flex-col">
      <HomeHero nextSectionId="latest" />
      <ResultsTicker matches={matches} />

      <section id="latest" className="scroll-mt-8 py-24 sm:py-32">
        <div className="mx-auto flex max-w-[88rem] flex-col gap-12 px-5 sm:px-10">
          <SectionHeading
            title="Latest result"
            description={`${latest.date}${latest.location ? ` at ${latest.location}` : ""}.`}
          />
          <MatchCentre match={latest} />
        </div>
      </section>

      <section className="pb-24 sm:pb-32">
        <div className="mx-auto flex max-w-[88rem] flex-col gap-12 px-5 sm:px-10">
          <SectionHeading title="Season record" />
          <SeasonRecord matches={matches} />
        </div>
      </section>

      <section className="pb-24 sm:pb-32">
        <div className="mx-auto flex max-w-[88rem] flex-col gap-12 px-5 sm:px-10">
          <SectionHeading title="Results" link={{ href: "/matches", label: "All results" }} />
          <Rail label="Results">
            {mostRecentFirst.map((m) => (
              <ResultTile key={m.id} match={m} />
            ))}
          </Rail>
        </div>
      </section>

      <section className="relative overflow-hidden border-y border-line py-24 sm:py-32">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_55%_60%_at_0%_50%,rgba(43,79,176,0.22),transparent_70%)]"
        />
        <div className="relative mx-auto flex max-w-[88rem] flex-col gap-12 px-5 sm:px-10">
          <SectionHeading
            title="First team"
            description="This season's most-used players."
            link={{ href: "/squad", label: "Full squad" }}
          />
          <Rail label="First team">
            {regulars.map((p) => (
              <div key={p.id} className="w-[16.5rem] sm:w-[18rem]">
                <PlayerCard player={p} />
              </div>
            ))}
          </Rail>
        </div>
      </section>

      <section className="py-24 sm:py-32">
        <div className="mx-auto flex max-w-[88rem] flex-col gap-12 px-5 sm:px-10">
          <SectionHeading title="Leaders" link={{ href: "/leaderboard", label: "Full leaderboard" }} />
          <StatLeaders players={squad} />
        </div>
      </section>
    </div>
  );
}
