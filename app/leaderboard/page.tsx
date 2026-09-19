import type { Metadata } from "next";
import { squad } from "@/lib/data";
import SectionHeading from "@/components/ui/SectionHeading";
import LeaderboardExplorer from "@/components/club/LeaderboardExplorer";
import { club } from "@/lib/site";

export const metadata: Metadata = {
  title: "Leaderboard",
  description: `Top scorers, assisters and appearance makers for ${club.fullName} in the ${club.season} season.`,
};

export default function LeaderboardPage() {
  return (
    <div className="flex flex-col">
      <section className="border-b border-line bg-paper pt-32 pb-14 sm:pt-40 sm:pb-16">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <SectionHeading
            eyebrow={`${club.season} Season`}
            title="Leaderboard"
            description="Season stats, ranked. See who's leading the race for the golden boot."
          />
        </div>
      </section>

      <section className="mx-auto w-full max-w-4xl px-5 py-14 sm:px-8 sm:py-16">
        <LeaderboardExplorer players={squad} />
      </section>
    </div>
  );
}
