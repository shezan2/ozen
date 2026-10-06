import Link from "next/link";
import Crest from "@/components/club/Crest";
import { club } from "@/lib/site";

export default function Footer() {
  return (
    <footer className="bg-ring-black">
      <div className="mx-auto grid max-w-6xl gap-12 px-5 py-16 sm:px-8 md:grid-cols-[1fr_auto]">
        <div className="flex items-center gap-5">
          <Crest size={84} />
          <div className="flex flex-col gap-2">
            <p className="type-title text-3xl sm:text-4xl">Chèvre Noir Football Club</p>
            <p className="text-sm text-silver">
              {club.motto}. Founded {club.founded}.
            </p>
          </div>
        </div>

        <div className="flex gap-16">
          <nav aria-label="Club" className="flex flex-col gap-3">
            <Link href="/squad" className="type-name text-base text-silver transition-colors hover:text-chalk">
              Squad
            </Link>
            <Link href="/matches" className="type-name text-base text-silver transition-colors hover:text-chalk">
              Matches
            </Link>
            <Link href="/leaderboard" className="type-name text-base text-silver transition-colors hover:text-chalk">
              Leaderboard
            </Link>
          </nav>
          <div className="flex flex-col gap-3">
            <a
              href={club.instagram}
              target="_blank"
              rel="noreferrer"
              className="type-name text-base text-silver transition-colors hover:text-chalk"
            >
              Instagram
            </a>
            <span className="text-sm text-silver-dim">{club.instagramHandle}</span>
          </div>
        </div>
      </div>
      <div className="border-t border-gold/40">
        <p className="mx-auto max-w-6xl px-5 py-5 text-xs text-silver-dim sm:px-8">
          © {club.season} {club.fullName}
        </p>
      </div>
    </footer>
  );
}
