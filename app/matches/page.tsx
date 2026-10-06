import type { Metadata } from "next";
import { matches, getGoalDifferenceTrend } from "@/lib/data";
import PageHeader from "@/components/club/PageHeader";
import SeasonRecord from "@/components/club/SeasonRecord";
import MatchesExplorer from "@/components/club/MatchesExplorer";
import SeasonTrend from "@/components/club/SeasonTrend";
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

      <section className="border-b border-line py-12 sm:py-16">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-5 sm:px-8">
          <h2 className="type-title text-3xl sm:text-4xl">Goal difference over the season</h2>
          <div className="bg-field-2 p-4 sm:p-8">
            <SeasonTrend points={trend} />
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-5 py-12 sm:px-8 sm:py-16">
        <MatchesExplorer matches={matches} />
      </section>
    </div>
  );
}
