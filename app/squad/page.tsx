import type { Metadata } from "next";
import { squad, POSITION_ORDER } from "@/lib/data";
import SectionHeading from "@/components/ui/SectionHeading";
import SquadExplorer from "@/components/club/SquadExplorer";
import { club } from "@/lib/site";

export const metadata: Metadata = {
  title: "Squad",
  description: `The full ${club.season} squad list for ${club.fullName}.`,
};

export default function SquadPage() {
  const totalGoals = squad.reduce((sum, p) => sum + p.goals, 0);
  const totalAssists = squad.reduce((sum, p) => sum + p.assists, 0);
  const activePlayers = squad.filter((p) => p.appearances > 0).length;

  return (
    <div className="flex flex-col">
      <section className="border-b border-line bg-paper pt-32 pb-14 sm:pt-40 sm:pb-16">
        <div className="mx-auto flex max-w-6xl flex-col gap-8 px-5 sm:px-8">
          <SectionHeading
            eyebrow={`${club.season} Season`}
            title="First Team Squad"
            description={`${squad.length} players across ${POSITION_ORDER.length} positions. ${activePlayers} have featured this season.`}
          />
          <div className="flex flex-wrap gap-x-10 gap-y-4">
            <MiniStat label="Squad size" value={squad.length} />
            <MiniStat label="Goals scored" value={totalGoals} />
            <MiniStat label="Assists made" value={totalAssists} />
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-5 py-14 sm:px-8 sm:py-16">
        <SquadExplorer players={squad} />
      </section>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-baseline gap-2">
      <span className="tabular text-2xl font-semibold text-ink">{value}</span>
      <span className="text-sm text-ink-dim">{label}</span>
    </div>
  );
}
