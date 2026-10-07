import Link from "next/link";
import Crest from "@/components/club/Crest";
import TextReveal from "@/components/motion/TextReveal";
import { club } from "@/lib/site";

export default function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-line">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(ellipse 60% 70% at 50% 110%, rgba(43,79,176,0.3), transparent 70%)" }}
      />
      <div className="relative mx-auto max-w-[88rem] px-5 pt-24 pb-10 sm:px-10 sm:pt-32">
        <TextReveal
          as="p"
          text={`${club.motto}.`}
          className="font-display text-[clamp(4rem,13vw,12.5rem)] leading-[0.92] tracking-[-0.02em] text-chalk italic lg:opsz-36"
        />

        <div className="mt-16 grid gap-12 border-t border-line pt-10 sm:mt-24 md:grid-cols-[1fr_auto_auto] md:gap-24">
          <div className="flex items-center gap-4">
            <Crest decorative size={56} className="size-14" />
            <div className="flex flex-col gap-1">
              <p className="font-display text-xl text-chalk">{club.fullName}</p>
              <p className="text-sm text-silver">Founded {club.founded}</p>
            </div>
          </div>

          <nav aria-label="Club" className="flex flex-col items-start gap-3 text-[15px]">
            <Link href="/squad" className="link-draw text-silver hover:text-chalk">
              Squad
            </Link>
            <Link href="/matches" className="link-draw text-silver hover:text-chalk">
              Matches
            </Link>
            <Link href="/leaderboard" className="link-draw text-silver hover:text-chalk">
              Leaderboard
            </Link>
          </nav>

          <div className="flex flex-col items-start gap-3 text-[15px]">
            <a href={club.instagram} target="_blank" rel="noreferrer" className="link-draw text-silver hover:text-chalk">
              Instagram
            </a>
            <span className="text-mist">{club.instagramHandle}</span>
          </div>
        </div>

        <p className="mt-16 text-xs text-mist">
          © {club.season} {club.fullName}
        </p>
      </div>
    </footer>
  );
}
