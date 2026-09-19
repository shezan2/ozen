import type { Metadata } from "next";
import { matches, getTeamRecord } from "@/lib/data";
import SectionHeading from "@/components/ui/SectionHeading";
import MatchesExplorer from "@/components/club/MatchesExplorer";
import { club } from "@/lib/site";

export const metadata: Metadata = {
  title: "Matches",
  description: `Fixtures and results for ${club.fullName} in the ${club.season} season.`,
};

export default function MatchesPage() {
  const record = getTeamRecord(matches);

  return (
    <div className="flex flex-col">
      <section className="border-b border-line bg-paper pt-32 pb-14 sm:pt-40 sm:pb-16">
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
      <span className={`tabular text-2xl font-semibold sm:text-3xl ${color}`}>{value}</span>
      <span className="text-xs font-medium uppercase tracking-[0.06em] text-ink-faint sm:text-sm sm:normal-case sm:tracking-normal sm:text-ink-dim">
        {label}
      </span>
    </div>
  );
}
