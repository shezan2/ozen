import type { Metadata } from "next";
import { squad } from "@/lib/data";
import PageHeader from "@/components/club/PageHeader";
import LeaderboardExplorer from "@/components/club/LeaderboardExplorer";
import { club } from "@/lib/site";

export const metadata: Metadata = {
  title: "Leaderboard",
  description: `Top scorers, assisters and appearance makers for ${club.fullName} in the ${club.season} season.`,
};

export default function LeaderboardPage() {
  return (
    <div className="flex flex-col">
      <PageHeader
        title="Leaderboard"
        description={`Every player ranked by goals, assists and appearances in the ${club.season} season.`}
      />
      <section className="wrap pb-24 sm:pb-32">
        <LeaderboardExplorer players={squad} />
      </section>
    </div>
  );
}
