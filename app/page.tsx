import Link from "next/link";
import { ArrowRight } from "lucide-react";
import {
  matches,
  squad,
  getTeamRecord,
  getForm,
  getLeaders,
  parseScore,
} from "@/lib/data";
import { club } from "@/lib/site";
import HomeHero from "@/components/club/HomeHero";
import PlayerAvatar from "@/components/club/PlayerAvatar";
import StatCallout from "@/components/club/StatCallout";
import { ResultBadge } from "@/components/club/ResultBadge";
import SectionHeading from "@/components/ui/SectionHeading";
import Reveal from "@/components/ui/Reveal";

export default function Home() {
  const record = getTeamRecord(matches);
  const winRate = record.played > 0 ? Math.round((record.won / record.played) * 100) : 0;
  const form = getForm(matches, 6);

  const lastMatch = matches[matches.length - 1];
  const lastScore = parseScore(lastMatch);

  const topScorer = getLeaders(squad, "goals")[0];
  const topAssister = getLeaders(squad, "assists")[0];
  const mostAppearances = getLeaders(squad, "appearances")[0];

  return (
    <div className="flex flex-col">
      <HomeHero form={form} />

      {/* Latest result */}
      <section className="border-b border-line bg-paper py-16 sm:py-24">
        <div className="mx-auto max-w-4xl px-5 sm:px-8">
          <Reveal>
            <div className="flex flex-col gap-6 rounded-3xl border border-line bg-white p-6 shadow-[0_20px_60px_rgba(0,0,0,0.06)] sm:p-10">
              <div className="flex items-center justify-between">
                <span className="eyebrow">Latest Result</span>
                <ResultBadge result={lastMatch.result} />
              </div>
              <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
                <div className="flex flex-col gap-1">
                  <span className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
                    Chèvre Noir vs {lastMatch.opponent}
                  </span>
                  <span className="text-sm text-ink-dim">
                    {lastMatch.date}
                    {lastMatch.location ? ` · ${lastMatch.location}` : ""}
                  </span>
                </div>
                {lastScore && (
                  <span className="tabular text-5xl font-bold tracking-tight text-ink sm:text-6xl">
                    {lastScore.for}&thinsp;–&thinsp;{lastScore.against}
                  </span>
                )}
              </div>
              {lastMatch.summary && (
                <p className="text-base leading-relaxed text-ink-dim">{lastMatch.summary}</p>
              )}
              <Link
                href="/matches"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-gold-deep transition-colors hover:text-gold"
              >
                See all matches
                <ArrowRight className="size-4" />
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Season at a glance */}
      <section className="border-b border-line bg-paper py-16 sm:py-24">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <SectionHeading
            eyebrow="By the numbers"
            title="Season at a glance"
            description={`${club.season} so far — every match played, every goal counted.`}
          />
          <Reveal delay={0.1} className="mt-12 grid grid-cols-2 gap-8 divide-y divide-line sm:grid-cols-4 sm:gap-6 sm:divide-y-0">
            <StatCallout value={record.played} label="Matches played" className="pt-6 sm:pt-0" />
            <StatCallout value={`${winRate}%`} label="Win rate" className="pt-6 sm:pt-0" />
            <StatCallout value={record.goalsFor} label="Goals scored" className="pt-6 sm:pt-0" />
            <StatCallout
              value={record.goalDifference > 0 ? `+${record.goalDifference}` : record.goalDifference}
              label="Goal difference"
              className="pt-6 sm:pt-0"
            />
          </Reveal>
        </div>
      </section>

      {/* Squad spotlight */}
      <section className="border-b border-line bg-paper py-16 sm:py-24">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <SectionHeading eyebrow="Squad spotlight" title="Leading the way" />
          <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Reveal delay={0}>
              <SpotlightCard label="Top Scorer" player={topScorer} stat={topScorer.goals} statLabel="Goals" />
            </Reveal>
            <Reveal delay={0.08}>
              <SpotlightCard
                label="Top Assister"
                player={topAssister}
                stat={topAssister.assists}
                statLabel="Assists"
              />
            </Reveal>
            <Reveal delay={0.16}>
              <SpotlightCard
                label="Most Appearances"
                player={mostAppearances}
                stat={mostAppearances.appearances}
                statLabel="Appearances"
              />
            </Reveal>
          </div>
          <Reveal delay={0.2} className="mt-10 flex justify-center">
            <Link
              href="/leaderboard"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-gold-deep transition-colors hover:text-gold"
            >
              View full leaderboard
              <ArrowRight className="size-4" />
            </Link>
          </Reveal>
        </div>
      </section>

      {/* Follow CTA */}
      <section className="bg-noir py-20 sm:py-28">
        <Reveal className="mx-auto flex max-w-2xl flex-col items-center gap-6 px-5 text-center sm:px-8">
          <span className="shine-text text-3xl font-semibold tracking-tight sm:text-4xl">
            {club.motto}
          </span>
          <p className="max-w-md text-base leading-relaxed text-paper-ink-dim">
            Follow the club for match updates, squad news and behind-the-scenes moments.
          </p>
          <a
            href={club.instagram}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-gold px-7 py-3 text-sm font-semibold text-noir transition-transform duration-300 hover:scale-[1.03] hover:bg-gold-bright"
          >
            <InstagramGlyph className="size-4" />
            Follow {club.instagramHandle}
          </a>
        </Reveal>
      </section>
    </div>
  );
}

function InstagramGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="12" cy="12" r="4.2" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" />
    </svg>
  );
}

function SpotlightCard({
  label,
  player,
  stat,
  statLabel,
}: {
  label: string;
  player: { name: string; position: string };
  stat: number;
  statLabel: string;
}) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-2xl border border-line bg-white p-7 text-center transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_32px_rgba(0,0,0,0.08)]">
      <span className="text-xs font-semibold uppercase tracking-[0.1em] text-gold-deep">{label}</span>
      <PlayerAvatar name={player.name} size={72} />
      <div className="flex flex-col gap-0.5">
        <span className="text-lg font-semibold tracking-tight text-ink">{player.name}</span>
        <span className="text-sm text-ink-dim">{player.position}</span>
      </div>
      <div className="flex flex-col">
        <span className="tabular text-3xl font-bold text-ink">{stat}</span>
        <span className="text-xs text-ink-faint">{statLabel}</span>
      </div>
    </div>
  );
}
