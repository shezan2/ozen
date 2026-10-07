import type { Metadata } from "next";
import { squad, POSITION_ORDER } from "@/lib/data";
import PageHeader from "@/components/club/PageHeader";
import SquadExplorer from "@/components/club/SquadExplorer";
import { club } from "@/lib/site";

export const metadata: Metadata = {
  title: "Squad",
  description: `The full ${club.season} squad list for ${club.fullName}.`,
};

export default function SquadPage() {
  const featured = squad.filter((p) => p.appearances > 0).length;

  return (
    <div className="flex flex-col">
      <PageHeader
        title="The squad"
        description={`${squad.length} players across ${POSITION_ORDER.length} positions in the ${club.season} season. ${featured} have played so far.`}
      />
      <section className="wrap pb-24 sm:pb-32">
        <SquadExplorer players={squad} />
      </section>
    </div>
  );
}
