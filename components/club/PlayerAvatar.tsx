import { cn } from "@/lib/utils";
import { initials } from "@/lib/data";

interface PlayerAvatarProps {
  name: string;
  size?: number;
  className?: string;
}

export default function PlayerAvatar({ name, size = 56, className }: PlayerAvatarProps) {
  return (
    <div
      className={cn("flex shrink-0 items-center justify-center rounded-full bg-blue/10 text-blue-deep", className)}
      style={{ width: size, height: size, fontSize: size * 0.34 }}
    >
      <span className="font-semibold tracking-tight">{initials(name)}</span>
    </div>
  );
}
