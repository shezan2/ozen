import { matches, squad, getLeaders } from "@/lib/data";
import HomeHero from "@/components/club/HomeHero";
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

      <section id="latest" className="wrap flex flex-col gap-10 py-20 sm:gap-12 sm:py-28">
        <SectionHeading
          title="Latest result"
          description={`${latest.date}${latest.location ? ` at ${latest.location}` : ""}.`}
        />
        <MatchCentre match={latest} />
      </section>

      <section className="wrap flex flex-col gap-10 pb-20 sm:gap-12 sm:pb-28">
        <SectionHeading title="Season record" />
        <SeasonRecord matches={matches} />
      </section>

      <section className="wrap flex flex-col gap-10 pb-20 sm:gap-12 sm:pb-28">
        <SectionHeading title="Results" link={{ href: "/matches", label: "All results" }} />
        <Rail label="Results">
          {mostRecentFirst.map((m) => (
            <ResultTile key={m.id} match={m} />
          ))}
        </Rail>
      </section>

      <section className="bg-navy py-20 sm:py-28">
        <div className="wrap flex flex-col gap-10 sm:gap-12">
          <SectionHeading
            title="First team"
            description="This season's most-used players."
            link={{ href: "/squad", label: "Full squad" }}
            linkVariant="noir"
          />
          <Rail label="First team" tone="noir">
            {regulars.map((p) => (
              <div key={p.id} className="w-[15.5rem] sm:w-[17.5rem]">
                <PlayerCard player={p} tone="noir" />
              </div>
            ))}
          </Rail>
        </div>
      </section>

      <section className="wrap flex flex-col gap-10 py-20 sm:gap-12 sm:py-28">
        <SectionHeading title="Leaders" link={{ href: "/leaderboard", label: "Full leaderboard" }} />
        <StatLeaders players={squad} />
      </section>
    </div>
  );
}
