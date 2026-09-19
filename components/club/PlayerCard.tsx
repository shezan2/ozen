import type { Player } from "@/lib/data";
import { POSITION_SHORT } from "@/lib/data";
import PlayerAvatar from "./PlayerAvatar";

export default function PlayerCard({ player }: { player: Player }) {
  return (
    <div className="group flex flex-col gap-5 rounded-2xl border border-line bg-white p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_32px_rgba(0,0,0,0.08)]">
      <div className="flex items-center gap-4">
        <PlayerAvatar name={player.name} size={52} />
        <div className="flex min-w-0 flex-col">
          <span className="truncate text-base font-semibold tracking-tight text-ink">{player.name}</span>
          <span className="text-xs font-medium uppercase tracking-[0.08em] text-gold-deep">
            {POSITION_SHORT[player.position]} · {player.position}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-3 divide-x divide-line rounded-xl bg-paper">
        <Stat label="APP" value={player.appearances} />
        <Stat label="GLS" value={player.goals} />
        <Stat label="AST" value={player.assists} />
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex flex-col items-center gap-0.5 py-3">
      <span className="tabular text-lg font-semibold text-ink">{value}</span>
      <span className="text-[0.65rem] font-medium uppercase tracking-[0.1em] text-ink-faint">{label}</span>
    </div>
  );
}
