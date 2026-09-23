import type { Metadata } from "next";
import { matches, getTeamRecord, getGoalDifferenceTrend } from "@/lib/data";
import SectionHeading from "@/components/ui/SectionHeading";
import MatchesExplorer from "@/components/club/MatchesExplorer";
import SeasonTrend from "@/components/club/SeasonTrend";
import Reveal from "@/components/ui/Reveal";
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
      <section className="border-b-4 border-noir bg-paper pt-32 pb-14 sm:pt-40 sm:pb-16">
        <div className="mx-auto flex max-w-6xl flex-col gap-8 px-5 sm:px-8">
          <SectionHeading
            eyebrow={`${club.season} Season`}
            title="Matches"
            description="Every fixture, every result — from kickoff to the final whistle."
          />
          <div className="grid grid-cols-3 gap-3 sm:flex sm:flex-wrap sm:gap-10">
            <RecordStat label="Played" value={record.played} />
            <RecordStat label="Won" value={record.won} accent="win" />
            <RecordStat label="Drawn" value={record.drawn} accent="draw" />
            <RecordStat label="Lost" value={record.lost} accent="loss" />
            <RecordStat label="Goals for" value={record.goalsFor} />
            <RecordStat label="Goals against" value={record.goalsAgainst} />
            <RecordStat
              label="Goal difference"
              value={record.goalDifference > 0 ? `+${record.goalDifference}` : record.goalDifference}
            />
          </div>
        </div>
      </section>

      <section className="border-b-4 border-noir bg-paper py-14 sm:py-16">
        <div className="mx-auto max-w-4xl px-5 sm:px-8">
          <Reveal className="flex flex-col gap-6 border-2 border-noir bg-white p-6 shadow-[8px_8px_0_0_var(--blue)] sm:p-8">
            <div className="flex flex-col gap-1">
              <span className="eyebrow">Season Trend</span>
              <h2 className="font-display text-2xl uppercase tracking-tight text-ink">Cumulative goal difference</h2>
            </div>
            <SeasonTrend points={trend} />
          </Reveal>
        </div>
      </section>

      <section className="mx-auto w-full max-w-4xl px-5 py-14 sm:px-8 sm:py-16">
        <MatchesExplorer matches={matches} />
      </section>
    </div>
  );
}

function RecordStat({
  label,
  value,
  accent,
}: {
  label: string;
  value: number | string;
  accent?: "win" | "draw" | "loss";
}) {
  const color = accent === "win" ? "text-win" : accent === "draw" ? "text-draw" : accent === "loss" ? "text-loss" : "text-ink";
  return (
    <div className="flex flex-col gap-1">
      <span className={`font-display text-3xl sm:text-4xl ${color}`}>{value}</span>
      <span className="text-xs font-bold uppercase tracking-[0.06em] text-ink-faint sm:text-sm sm:text-ink-dim">
        {label}
      </span>
    </div>
  );
}
