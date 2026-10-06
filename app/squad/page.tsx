import type { Metadata } from "next";
import { squad, POSITION_ORDER } from "@/lib/data";
import SectionHeading from "@/components/ui/SectionHeading";
import RecordLine from "@/components/club/RecordLine";
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
      <section className="border-b border-line pt-28 pb-10 sm:pt-36 sm:pb-14">
        <div className="mx-auto flex max-w-5xl flex-col gap-6 px-5 sm:px-8">
          <SectionHeading
            eyebrow={`${club.season} Season`}
            title="First team squad"
            description={`${squad.length} players across ${POSITION_ORDER.length} positions. ${activePlayers} have featured this season.`}
          />
          <RecordLine
            items={[
              { label: "Squad", value: squad.length },
              { label: "Goals", value: totalGoals },
              { label: "Assists", value: totalAssists },
            ]}
          />
        </div>
      </section>

      <section className="mx-auto w-full max-w-5xl px-5 py-12 sm:px-8 sm:py-16">
        <SquadExplorer players={squad} />
      </section>
    </div>
  );
}
