import type { Match } from "@/lib/data";
import { ResultChip } from "./ResultBadge";

/** Expects results ordered most-recent-first (as returned by getForm); renders oldest → newest. */
export default function FormGuide({ results }: { results: Match["result"][] }) {
  const oldestFirst = [...results].reverse();
  return (
    <div className="flex items-center gap-1.5">
      {oldestFirst.map((r, i) => (
        <ResultChip key={i} result={r} />
      ))}
    </div>
  );
}
