import type { Player } from "@/lib/data";
import { POSITION_SHORT } from "@/lib/data";
import PlayerAvatar from "./PlayerAvatar";

export default function PlayerCard({ player }: { player: Player }) {
  return (
    <div className="group flex flex-col gap-5 border-2 border-noir bg-white p-5 transition-all duration-200 hover:shadow-[6px_6px_0_0_var(--blue)]">
      <div className="flex items-center gap-4">
        <PlayerAvatar name={player.name} size={52} />
        <div className="flex min-w-0 flex-col">
          <span className="truncate text-base font-bold uppercase tracking-tight text-ink">{player.name}</span>
          <span className="text-xs font-bold uppercase tracking-[0.08em] text-blue-deep">
            {POSITION_SHORT[player.position]} · {player.position}
          </span>
        </div>
      </div>

      {player.appearances === 0 ? (
        <div className="flex items-center justify-center bg-paper py-3">
          <span className="text-xs font-bold uppercase tracking-[0.08em] text-ink-faint">
            Yet to feature this season
          </span>
        </div>
      ) : (
        <div className="grid grid-cols-3 divide-x-2 divide-noir border-t-2 border-noir">
          <Stat label="APP" value={player.appearances} />
          <Stat label="GLS" value={player.goals} />
          <Stat label="AST" value={player.assists} />
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex flex-col items-center gap-0.5 py-3">
      <span className="font-display text-2xl text-ink">{value}</span>
      <span className="text-[0.65rem] font-bold uppercase tracking-[0.1em] text-ink-faint">{label}</span>
    </div>
  );
}
