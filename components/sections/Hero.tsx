import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { hero } from "@/lib/content";
import { siteConfig, whatsAppLink } from "@/lib/site-config";
import { buttonStyles } from "@/components/ui/Button";

/** Real client figures only — no averages, no counts, nothing invented. */
const proof = [
  { figure: "85 → 75kg", label: "One client, ten kilos" },
  { figure: "83 → 82kg", label: "Same weight, visibly leaner" },
  { figure: "−5% fat", label: "On two sessions a week" },
];

export default function Hero() {
  return (
    <section className="on-ink relative isolate flex min-h-[86vh] min-h-[86svh] flex-col justify-end overflow-hidden bg-ink text-white">
      <div className="absolute inset-0 -z-10">
        <Image
          src="/images/hero-coaching.jpg"
          alt={hero.imageAlt}
          fill
          sizes="100vw"
          loading="eager"
          fetchPriority="high"
          className="drift object-cover"
        />
        {/* Scrims, not decoration. Light enough that the photograph still
            reads; the label blocks behind the headline carry the contrast. */}
        <div className="absolute inset-0 bg-gradient-to-r from-ink/95 via-ink/70 to-ink/25" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/20 to-ink/55" />
      </div>

      <div className="mx-auto w-full max-w-6xl px-5 pt-32 pb-12 sm:px-8 sm:pt-40 sm:pb-14">
        <p className="label flex items-center gap-3 text-white/65">
          <span className="h-px w-8 bg-lime" aria-hidden />
          {hero.label}
        </p>

        {/* Above the fold, so the line wipe is armed by the inline script in the
            layout rather than by hydration. Whole lines, never words. */}
        <h1
          className="lines display mt-8 text-[clamp(2.5rem,1rem+6.6vw,5.75rem)]"
          data-lines="hero"
        >
          <span>
            <span>
              <span className="slab">Lose</span> <span className="slab-lime">5–10kg</span>
            </span>
          </span>
          <span>
            <span>
              <span className="slab">on three hours</span>
            </span>
          </span>
          <span>
            <span>
              <span className="slab">a week.</span>
            </span>
          </span>
        </h1>

        <div className="mt-9 grid gap-8 lg:grid-cols-[minmax(0,30rem)_1fr] lg:items-end">
          <div>
            <p className="lede text-white/80">{hero.subhead}</p>
            <p className="mt-5 border-l-2 border-lime pl-4 text-sm leading-relaxed text-white/60">
              {hero.qualifier}
            </p>
          </div>

          <div className="flex flex-wrap gap-3 lg:justify-end">
            <a
              href={whatsAppLink()}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonStyles("lime", "lg")}
            >
              Message {siteConfig.contact.whatsappKeyword}
            </a>
            <Link href="/the-3-hour-method" className={buttonStyles("onInk", "lg")}>
              See the method
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden />
            </Link>
          </div>
        </div>

        <ul className="mt-12 grid border-t border-white/20 sm:grid-cols-3">
          {proof.map((item) => (
            <li
              key={item.figure}
              className="border-b border-white/12 py-5 sm:border-r sm:border-b-0 sm:px-6 sm:last:border-r-0 sm:first:pl-0"
            >
              <p className="display-tight text-xl text-lime sm:text-2xl">{item.figure}</p>
              <p className="mt-1.5 text-xs text-white/55">{item.label}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
