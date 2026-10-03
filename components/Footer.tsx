import Link from "next/link";
import Crest from "@/components/club/Crest";
import { club } from "@/lib/site";

export default function Footer() {
  return (
    <footer className="border-t border-black/10 bg-surface">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 px-5 py-14 sm:px-8 md:flex-row md:items-start md:justify-between">
        <div className="flex flex-col gap-4">
          <Link href="/" className="flex items-center gap-2.5" aria-label="Chèvre Noir FC — home">
            <Crest size={30} />
            <span className="text-base font-semibold tracking-tight text-ink">
              Chèvre Noir <span className="text-blue-deep">FC</span>
            </span>
          </Link>
          <p className="max-w-xs text-sm leading-relaxed text-ink-dim">
            Founded {club.founded}. {club.motto}.
          </p>
        </div>

        <div className="flex flex-wrap gap-x-16 gap-y-8">
          <div className="flex flex-col gap-3">
            <p className="text-xs font-semibold text-ink">Club</p>
            <Link href="/squad" className="text-sm text-ink-dim transition-colors hover:text-ink">
              Squad
            </Link>
            <Link href="/matches" className="text-sm text-ink-dim transition-colors hover:text-ink">
              Matches
            </Link>
            <Link href="/leaderboard" className="text-sm text-ink-dim transition-colors hover:text-ink">
              Leaderboard
            </Link>
          </div>
          <div className="flex flex-col gap-3">
            <p className="text-xs font-semibold text-ink">Follow</p>
            <a
              href={club.instagram}
              target="_blank"
              rel="noreferrer"
              className="text-sm text-ink-dim transition-colors hover:text-ink"
            >
              Instagram
            </a>
            <span className="text-sm text-ink-faint">{club.instagramHandle}</span>
          </div>
        </div>
      </div>
      <div className="border-t border-black/10">
        <div className="mx-auto flex max-w-6xl flex-col-reverse items-center gap-3 px-5 py-5 text-center sm:flex-row sm:justify-between sm:px-8 sm:text-left">
          <p className="text-xs text-ink-faint">
            © {club.season} {club.fullName}. All rights reserved.
          </p>
          <p className="text-xs font-medium text-blue-deep">{club.motto}</p>
        </div>
      </div>
    </footer>
  );
}
