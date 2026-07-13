/**
 * Adapted from KokonutUI Gradient Button (@dorianbaffier, MIT — kokonutui.com)
 * Retinted to the Ozen iris palette; glows moved to inline styles because
 * Tailwind cannot compile dynamically-built shadow classes.
 */

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface GradientButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label?: string;
  className?: string;
}

export default function GradientButton({
  label = "Book a call",
  className,
  ...props
}: GradientButtonProps) {
  return (
    <Button
      className={cn(
        "group relative h-12 overflow-hidden rounded-lg px-6 transition-all duration-500",
        className
      )}
      variant="ghost"
      {...props}
    >
      <div className="absolute inset-0 rounded-lg bg-linear-to-b from-[#5e4fd1] via-[#131117] to-[#8f7dff] p-[2px]">
        <div className="absolute inset-0 rounded-lg bg-[#0b0a10] opacity-90" />
      </div>

      <div className="absolute inset-[2px] rounded-lg bg-[#0b0a10] opacity-95" />
      <div className="absolute inset-[2px] rounded-lg bg-linear-to-b from-[#8f7dff]/30 via-[#0b0a10] to-[#5e4fd1]/25 opacity-80" />
      <div className="absolute inset-[2px] rounded-lg bg-linear-to-br from-[#b6a9ff]/10 via-[#0b0a10] to-[#241f3d]/50" />

      <div
        className="absolute inset-[2px] rounded-lg"
        style={{ boxShadow: "inset 0 0 12px rgba(143,125,255,0.12)" }}
      />

      <div className="relative flex items-center justify-center gap-2">
        <span
          className="bg-linear-to-b from-[#dcd6ff] to-[#b6a9ff] bg-clip-text text-base font-medium tracking-tight text-transparent"
          style={{ filter: "drop-shadow(0 0 12px rgba(143,125,255,0.4))" }}
        >
          {label}
        </span>
      </div>

      <div className="absolute inset-[2px] rounded-lg bg-linear-to-r from-[#241f3d]/20 via-[#8f7dff]/10 to-[#241f3d]/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
    </Button>
  );
}
