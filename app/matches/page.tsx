import type { Metadata } from "next";
import { matches, getGoalDifferenceTrend } from "@/lib/data";
import PageHeader from "@/components/club/PageHeader";
import SeasonRecord from "@/components/club/SeasonRecord";
import MatchesExplorer from "@/components/club/MatchesExplorer";
import SeasonTrend from "@/components/club/SeasonTrend";
import SectionHeading from "@/components/ui/SectionHeading";
import { club } from "@/lib/site";

export const metadata: Metadata = {
  title: "Matches",
  description: `Fixtures and results for ${club.fullName} in the ${club.season} season.`,
};

export default function MatchesPage() {
  const trend = getGoalDifferenceTrend(matches);

  return (
    <div className="flex flex-col">
      <PageHeader title="Matches" description={`Every result from the ${club.season} season. Open a match to see the lineup and scorers.`}>
        <SeasonRecord matches={matches} />
      </PageHeader>

      <section className="wrap flex flex-col gap-10 pb-20 sm:gap-12 sm:pb-28">
        <SectionHeading title="Goal difference over the season" />
        <div className="bg-navy p-5 sm:p-10">
          <SeasonTrend points={trend} />
        </div>
      </section>

      <section className="wrap pb-24 sm:pb-32">
        <MatchesExplorer matches={matches} />
      </section>
    </div>
  );
}
