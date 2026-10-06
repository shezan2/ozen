import Link from "next/link";
import Crest from "@/components/club/Crest";
import { club } from "@/lib/site";

export default function Footer() {
  return (
    <footer className="border-t border-line-on-navy bg-navy">
      <div className="mx-auto flex max-w-5xl flex-col gap-10 px-5 py-14 sm:px-8 md:flex-row md:items-start md:justify-between">
        <div className="flex max-w-xs flex-col gap-3">
          <Link href="/" className="flex items-center gap-2.5" aria-label="Chèvre Noir FC — home">
            <Crest size={30} />
            <span className="text-base font-semibold tracking-tight text-paper-ink">
              Chèvre Noir <span className="text-paper-ink-dim">FC</span>
            </span>
          </Link>
          <p className="font-serif text-base italic text-paper-ink-dim">{club.motto}</p>
          <p className="text-xs text-paper-ink-faint">Est. {club.founded}</p>
        </div>

        <div className="flex gap-16">
          <div className="flex flex-col gap-2.5">
            <p className="text-xs font-medium text-paper-ink-faint">Club</p>
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
          <div className="flex flex-col gap-2.5">
            <p className="text-xs font-medium text-paper-ink-faint">Follow</p>
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
        <div className="mx-auto px-5 py-4 text-center text-xs text-paper-ink-faint sm:px-8 sm:text-left">
          © {club.season} {club.fullName}. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
