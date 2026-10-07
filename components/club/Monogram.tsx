import { cn } from "@/lib/utils";

/** A player's initial set in the badge's double ring — stands in until squad photography arrives. */
export default function Monogram({ name, className }: { name: string; className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "relative flex aspect-square items-center justify-center rounded-full ring-1 ring-gold/45 transition-[box-shadow,transform] duration-700 ease-out-expo",
        className
      )}
    >
      <span className="absolute inset-[7%] rounded-full ring-1 ring-white/10" />
      <span className="font-display leading-none text-chalk/90 italic">{name.charAt(0)}</span>
    </span>
  );
}
