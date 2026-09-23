import Link from "next/link";
import Crest from "@/components/club/Crest";
import { club } from "@/lib/site";

export default function Footer() {
  return (
    <footer className="border-t-4 border-gold bg-noir">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 px-5 py-14 sm:px-8 md:flex-row md:items-start md:justify-between">
        <div className="flex flex-col gap-4">
          <Link href="/" className="flex items-center gap-3" aria-label="Chèvre Noir FC — home">
            <Crest size={40} />
            <span className="font-display text-xl uppercase tracking-tight text-paper-ink">
              Chevre Noir <span className="text-gold">FC</span>
            </span>
          </Link>
          <p className="max-w-xs text-sm leading-relaxed text-paper-ink-dim">
            Founded {club.founded}. {club.motto}.
          </p>
        </div>

        <div className="flex flex-wrap gap-x-16 gap-y-8">
          <div className="flex flex-col gap-3">
            <p className="eyebrow-on-navy">Club</p>
            <Link href="/squad" className="text-sm text-paper-ink-dim transition-colors hover:text-paper-ink">
              Squad
            </Link>
            <Link href="/matches" className="text-sm text-paper-ink-dim transition-colors hover:text-paper-ink">
              Matches
            </Link>
            <Link href="/leaderboard" className="text-sm text-paper-ink-dim transition-colors hover:text-paper-ink">
              Leaderboard
            </Link>
          </div>
          <div className="flex flex-col gap-3">
            <p className="eyebrow-on-navy">Follow</p>
            <a
              href={club.instagram}
              target="_blank"
              rel="noreferrer"
              className="text-sm text-paper-ink-dim transition-colors hover:text-paper-ink"
            >
              Instagram
            </a>
            <span className="text-sm text-paper-ink-faint">{club.instagramHandle}</span>
          </div>
        </div>
      </div>
      <div className="border-t border-line-on-navy">
        <div className="mx-auto flex max-w-6xl flex-col-reverse items-center gap-3 px-5 py-5 text-center sm:flex-row sm:justify-between sm:px-8 sm:text-left">
          <p className="text-xs text-paper-ink-faint">
            © {club.season} {club.fullName}. All rights reserved.
          </p>
          <p className="font-display text-xs uppercase tracking-[0.14em] text-gold">{club.motto}</p>
        </div>
      </div>
    </footer>
  );
}
