import Link from "next/link";
import {
  matches,
  squad,
  getTeamRecord,
  getForm,
  getLeaders,
} from "@/lib/data";
import { club } from "@/lib/site";
import HomeHero from "@/components/club/HomeHero";
import MatchCentre from "@/components/club/MatchCentre";
import RecordLine from "@/components/club/RecordLine";
import SectionHeading from "@/components/ui/SectionHeading";

export default function Home() {
  const record = getTeamRecord(matches);
  const form = getForm(matches, 6);

  const lastMatch = matches[matches.length - 1];

  const topScorer = getLeaders(squad, "goals")[0];
  const topAssister = getLeaders(squad, "assists")[0];
  const mostAppearances = getLeaders(squad, "appearances")[0];

  return (
    <div className="flex flex-col">
      <HomeHero form={form} />

      <section className="border-b border-line py-12 sm:py-16">
        <div className="mx-auto max-w-5xl px-5 sm:px-8">
          <MatchCentre match={lastMatch} />
        </div>
      </section>

      <section className="border-b border-line py-12 sm:py-16">
        <div className="mx-auto max-w-5xl px-5 sm:px-8">
          <SectionHeading eyebrow="By the numbers" title="Season record" />
          <RecordLine
            className="mt-6"
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
        <div className="mx-auto max-w-5xl px-5 sm:px-8">
          <SectionHeading eyebrow="Squad spotlight" title="Leading the way" />
          <div className="mt-8 grid grid-cols-1 gap-6 border-t border-line pt-6 sm:grid-cols-3">
            <Spotlight label="Top scorer" name={topScorer.name} value={topScorer.goals} unit="goals" />
            <Spotlight label="Top assister" name={topAssister.name} value={topAssister.assists} unit="assists" />
            <Spotlight label="Most appearances" name={mostAppearances.name} value={mostAppearances.appearances} unit="apps" />
          </div>
          <Link href="/leaderboard" className="mt-6 inline-block border-b border-ink-dim pb-0.5 text-sm text-ink-dim transition-colors hover:border-navy hover:text-navy">
            View full leaderboard
          </Link>
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div className="mx-auto flex max-w-5xl flex-col gap-3 px-5 sm:px-8">
          <p className="font-serif text-2xl italic text-navy">{club.motto}.</p>
          <p className="max-w-md text-sm leading-relaxed text-ink-dim">
            Follow the club for match updates, squad news and behind-the-scenes moments.
          </p>
          <a
            href={club.instagram}
            target="_blank"
            rel="noreferrer"
            className="mt-2 w-fit border-b border-ink pb-0.5 text-sm font-medium text-ink transition-colors hover:border-navy hover:text-navy"
          >
            Follow {club.instagramHandle}
          </a>
        </div>
      </section>
    </div>
  );
}

function Spotlight({ label, name, value, unit }: { label: string; name: string; value: number; unit: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs text-ink-faint">{label}</span>
      <span className="font-serif text-xl font-medium text-ink">{name}</span>
      <span className="tabular text-sm text-ink-dim">
        {value} {unit}
      </span>
    </div>
  );
}
