import type { Metadata } from "next";
import { matches, getTeamRecord, getGoalDifferenceTrend } from "@/lib/data";
import SectionHeading from "@/components/ui/SectionHeading";
import RecordLine from "@/components/club/RecordLine";
import MatchesExplorer from "@/components/club/MatchesExplorer";
import SeasonTrend from "@/components/club/SeasonTrend";
import { club } from "@/lib/site";

export const metadata: Metadata = {
  title: "Matches",
  description: `Fixtures and results for ${club.fullName} in the ${club.season} season.`,
};

export default function MatchesPage() {
  const record = getTeamRecord(matches);
  const trend = getGoalDifferenceTrend(matches);

  return (
    <div className="flex flex-col">
      <section className="border-b border-line pt-28 pb-10 sm:pt-36 sm:pb-14">
        <div className="mx-auto flex max-w-5xl flex-col gap-6 px-5 sm:px-8">
          <SectionHeading
            eyebrow={`${club.season} Season`}
            title="Matches"
            description="Every fixture, every result — from kickoff to the final whistle."
          />
          <RecordLine
            items={[
              { label: "Played", value: record.played },
              { label: "Won", value: record.won, accent: "win" },
              { label: "Drawn", value: record.drawn, accent: "draw" },
              { label: "Lost", value: record.lost, accent: "loss" },
              { label: "For", value: record.goalsFor },
              { label: "Against", value: record.goalsAgainst },
              { label: "GD", value: record.goalDifference > 0 ? `+${record.goalDifference}` : record.goalDifference },
            ]}
          />
        </div>
      </section>

      <section className="border-b border-line py-12 sm:py-16">
        <div className="mx-auto max-w-4xl px-5 sm:px-8">
          <div className="flex flex-col gap-1 pb-6">
            <span className="text-xs text-ink-faint">Season trend</span>
            <h2 className="font-serif text-xl font-semibold text-ink">Cumulative goal difference</h2>
          </div>
          <SeasonTrend points={trend} />
        </div>
      </section>

      <section className="mx-auto w-full max-w-4xl px-5 py-12 sm:px-8 sm:py-16">
        <MatchesExplorer matches={matches} />
      </section>
    </div>
  );
}
