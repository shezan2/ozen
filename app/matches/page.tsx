import type { Metadata } from "next";
import { matches, getGoalDifferenceTrend } from "@/lib/data";
import PageHeader from "@/components/club/PageHeader";
import SeasonRecord from "@/components/club/SeasonRecord";
import MatchesExplorer from "@/components/club/MatchesExplorer";
import SeasonTrend from "@/components/club/SeasonTrend";
import Reveal from "@/components/motion/Reveal";
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

      <section className="pb-24 sm:pb-32">
        <div className="mx-auto flex max-w-[88rem] flex-col gap-12 px-5 sm:px-10">
          <SectionHeading title="Goal difference over the season" />
          <Reveal>
            <div className="rounded-[1.75rem] border border-line bg-chart-surface p-5 sm:p-10">
              <SeasonTrend points={trend} />
            </div>
          </Reveal>
        </div>
      </section>

      <section className="mx-auto w-full max-w-[88rem] px-5 pb-28 sm:px-10 sm:pb-36">
        <MatchesExplorer matches={matches} />
      </section>
    </div>
  );
}
