import { matches, squad, getLeaders } from "@/lib/data";
import HomeHero from "@/components/club/HomeHero";
import Rail from "@/components/club/Rail";
import ResultTile from "@/components/club/ResultTile";
import SeasonRecord from "@/components/club/SeasonRecord";
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
      <HomeHero match={latest} />

      <section className="py-14 sm:py-20">
        <div className="mx-auto flex max-w-6xl flex-col gap-8 px-5 sm:px-8">
          <SectionHeading title="Results" link={{ href: "/matches", label: "All results" }} />
          <Rail label="Results">
            {mostRecentFirst.map((m) => (
              <ResultTile key={m.id} match={m} />
            ))}
          </Rail>
        </div>
      </section>

      <section className="pb-14 sm:pb-20">
        <div className="mx-auto flex max-w-6xl flex-col gap-8 px-5 sm:px-8">
          <SectionHeading title="Season record" />
          <SeasonRecord matches={matches} />
        </div>
      </section>

      <section className="border-y border-line bg-ring-black/40 py-14 sm:py-20">
        <div className="mx-auto flex max-w-6xl flex-col gap-8 px-5 sm:px-8">
          <SectionHeading
            title="First team"
            description="This season's most-used players."
            link={{ href: "/squad", label: "Full squad" }}
          />
          <Rail label="First team">
            {regulars.map((p) => (
              <div key={p.id} className="w-56 sm:w-60">
                <PlayerCard player={p} />
              </div>
            ))}
          </Rail>
        </div>
      </section>

      <section className="py-14 sm:py-20">
        <div className="mx-auto flex max-w-6xl flex-col gap-8 px-5 sm:px-8">
          <SectionHeading title="Leaders" link={{ href: "/leaderboard", label: "Full leaderboard" }} />
          <StatLeaders players={squad} />
        </div>
      </section>
    </div>
  );
}
