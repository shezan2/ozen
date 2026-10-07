import Link from "next/link";
import Crest from "@/components/club/Crest";
import { club } from "@/lib/site";

const links = [
  { href: "/squad", label: "Squad" },
  { href: "/matches", label: "Matches" },
  { href: "/leaderboard", label: "Leaderboard" },
];

export default function Footer() {
  return (
    <footer className="bg-blue text-white">
      <div className="wrap flex flex-col gap-14 pt-16 pb-10 sm:gap-20 sm:pt-24">
        <p className="display text-[clamp(4.5rem,16vw,14rem)] leading-[0.84]">{club.motto}.</p>

        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1fr_auto_auto] lg:gap-24">
          <div className="flex items-center gap-4 sm:col-span-2 lg:col-span-1">
            <Crest decorative size={64} className="size-14" />
            <div className="flex flex-col gap-1">
              <p className="text-lg font-semibold">{club.fullName}</p>
              <p className="text-sm text-haze">Founded {club.founded}</p>
            </div>
          </div>

          <nav aria-label="Club" className="flex flex-col items-start gap-3 text-[15px] font-semibold">
            {links.map((l) => (
              <Link key={l.href} href={l.href} className="text-haze transition-colors duration-200 hover:text-white">
                {l.label}
              </Link>
            ))}
          </nav>

          <div className="flex flex-col items-start gap-3 text-[15px]">
            <a
              href={club.instagram}
              target="_blank"
              rel="noreferrer"
              className="font-semibold text-haze transition-colors duration-200 hover:text-white"
            >
              Instagram
            </a>
            <span className="text-haze">{club.instagramHandle}</span>
          </div>
        </div>

        <p className="text-sm text-haze">
          © {club.season} {club.fullName}
        </p>
      </div>
    </footer>
  );
}
