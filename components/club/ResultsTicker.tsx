import type { Match } from "@/lib/data";
import { parseScore } from "@/lib/data";
import Marquee from "@/components/motion/Marquee";
import { ResultChip } from "./ResultBadge";

/** Broadcast-style strip of every result, newest first. */
export default function ResultsTicker({ matches }: { matches: Match[] }) {
  const results = matches.filter((m) => m.result !== "Upcoming").reverse();

  return (
    <section aria-label="Season results" className="border-y border-line bg-white/[0.015] py-5">
      <Marquee duration={results.length * 7}>
        {results.map((m) => {
          const s = parseScore(m);
          return (
            <span key={m.id} className="flex shrink-0 items-center gap-4 pr-10 pl-10 text-[15px] whitespace-nowrap">
              <span className="text-silver">Chèvre Noir</span>
              <span className="figure text-2xl text-chalk">{s ? `${s.for}–${s.against}` : "v"}</span>
              <span className="text-silver">{m.opponent}</span>
              <ResultChip result={m.result} className="size-6 text-[10px]" />
              <span aria-hidden className="ml-6 size-1 rounded-full bg-gold/80" />
            </span>
          );
        })}
      </Marquee>
    </section>
  );
}
