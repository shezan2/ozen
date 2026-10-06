import Link from "next/link";
import type { Match } from "@/lib/data";
import { parseScore } from "@/lib/data";
import Crest from "./Crest";
import OpponentCrest from "./OpponentCrest";
import { ResultChip } from "./ResultBadge";

export default function ResultTile({ match }: { match: Match }) {
  const s = parseScore(match);
  return (
    <Link href="/matches" className="flex w-64 flex-col gap-4 bg-field-2 p-5 transition-colors hover:bg-field-3">
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs text-silver">{match.date}</span>
        <ResultChip result={match.result} className="size-6 text-xs" />
      </div>
      <div className="flex flex-col gap-2.5">
        <TeamLine crest={<Crest size={24} />} name="Chèvre Noir" goals={s?.for} />
        <TeamLine crest={<OpponentCrest name={match.opponent} size={21} />} name={match.opponent} goals={s?.against} />
      </div>
      <span className="text-xs text-silver-dim">{match.location || "Venue not recorded"}</span>
    </Link>
  );
}

function TeamLine({ crest, name, goals }: { crest: React.ReactNode; name: string; goals?: number }) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex w-6 justify-center">{crest}</span>
      <span className="type-name flex-1 truncate text-lg">{name}</span>
      <span className="type-name tabular text-2xl">{goals ?? "–"}</span>
    </div>
  );
}
