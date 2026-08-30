import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { hero } from "@/lib/content";
import { siteConfig, whatsAppLink } from "@/lib/site-config";
import { buttonStyles } from "@/components/ui/Button";

/** Real client figures only — nothing here is an average or an invented count. */
const proofChips = ["85kg → 75kg", "83kg → 82kg, visibly leaner", "−5% body fat on 2 sessions a week"];

export default function Hero() {
  return (
    <section className="on-ink bg-ink text-white">
      <div className="mx-auto grid max-w-6xl gap-12 px-5 pt-16 pb-20 sm:px-8 sm:pt-20 sm:pb-24 lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:gap-16 lg:pt-24 lg:pb-28">
        {/* Whole block animates as one — no per-word spans. */}
        <div className="animate-fade-in">
          <p className="eyebrow text-lime">{hero.eyebrow}</p>

          <h1 className="display mt-6 text-[clamp(2.75rem,1.5rem+4.8vw,4.5rem)]">
            Lose <span className="text-lime">5–10kg</span>
            <br />
            on three hours
            <br />a week.
          </h1>

          <p className="lede mt-7 max-w-xl text-white/72">{hero.subhead}</p>

          <p className="mt-5 max-w-xl border-l-2 border-white/20 pl-4 text-sm leading-relaxed text-white/55">
            {hero.qualifier}
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-3">
            <a
              href={whatsAppLink()}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonStyles("lime", "lg")}
            >
              Message {siteConfig.contact.whatsappKeyword} on WhatsApp
            </a>
            <Link href="/the-3-hour-method" className={buttonStyles("onInk", "lg")}>
              See the method
              <ArrowRight className="size-4" aria-hidden />
            </Link>
          </div>

          <ul className="mt-10 flex flex-wrap gap-x-6 gap-y-2 text-xs font-medium text-white/50">
            {proofChips.map((chip) => (
              <li key={chip} className="flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-lime" aria-hidden />
                {chip}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative">
          <div className="relative aspect-4/5 overflow-hidden rounded-3xl bg-ink-raised">
            <Image
              src="/images/hero-coaching.jpg"
              alt={hero.imageAlt}
              fill
              sizes="(min-width: 1024px) 34rem, 92vw"
              loading="eager"
              fetchPriority="high"
              className="object-cover"
            />
          </div>
          <p className="sticker-lime display absolute -bottom-4 left-5 px-4 py-2 text-lg sm:text-xl">
            3 hrs / week
          </p>
        </div>
      </div>
    </section>
  );
}
