import Link from "next/link";
import type { Match } from "@/lib/data";
import { parseScore } from "@/lib/data";
import Crest from "./Crest";
import OpponentCrest from "./OpponentCrest";
import { ResultChip } from "./ResultBadge";

export default function ResultTile({ match }: { match: Match }) {
  const s = parseScore(match);
  return (
    <Link
      href="/matches"
      draggable={false}
      className="glass spotlight flex w-[19rem] flex-col gap-7 rounded-[1.5rem] p-6 backdrop-blur-xl"
    >
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm text-silver">{match.date}</span>
        <ResultChip result={match.result} />
      </div>
      <div className="flex flex-col gap-3">
        <TeamLine crest={<Crest decorative size={28} className="size-7" />} name="Chèvre Noir" goals={s?.for} />
        <TeamLine crest={<OpponentCrest name={match.opponent} size={24} />} name={match.opponent} goals={s?.against} />
      </div>
      <span className="border-t border-line pt-4 text-sm text-mist">{match.location || "Venue not recorded"}</span>
    </Link>
  );
}

function TeamLine({ crest, name, goals }: { crest: React.ReactNode; name: string; goals?: number }) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex w-7 justify-center">{crest}</span>
      <span className="flex-1 truncate text-base text-chalk">{name}</span>
      <span className="figure text-3xl leading-none text-chalk">{goals ?? "–"}</span>
    </div>
  );
}
