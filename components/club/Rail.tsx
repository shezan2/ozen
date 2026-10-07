"use client";

import { useRef, type ReactNode } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

/** Horizontally scrolling row: swipe, trackpad, keyboard, the step buttons, or drag with a mouse. */
export default function Rail({
  label,
  children,
  className,
  tone = "navy",
}: {
  label: string;
  children: ReactNode;
  className?: string;
  /** Button colour: navy on black sections, noir on navy ones. */
  tone?: "navy" | "noir";
}) {
  const ref = useRef<HTMLDivElement>(null);
  const drag = useRef<{ x: number; left: number; active: boolean; moved: boolean } | null>(null);

  const step = (dir: 1 | -1) => {
    const el = ref.current;
    if (el) el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: "smooth" });
  };

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse" || e.button !== 0 || !ref.current) return;
    drag.current = { x: e.clientX, left: ref.current.scrollLeft, active: true, moved: false };
  };
  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    const el = ref.current;
    if (!d?.active || !el) return;
    const dx = e.clientX - d.x;
    if (!d.moved && Math.abs(dx) > 6) {
      d.moved = true;
      el.setPointerCapture(e.pointerId);
      el.dataset.dragging = "true";
    }
    if (d.moved) el.scrollLeft = d.left - dx;
  };
  const endDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!drag.current?.active || !el) return;
    drag.current.active = false;
    if (el.hasPointerCapture(e.pointerId)) el.releasePointerCapture(e.pointerId);
    delete el.dataset.dragging;
  };
  // A drag shouldn't count as a click on the card underneath.
  const onClickCapture = (e: React.MouseEvent) => {
    if (drag.current?.moved) {
      e.preventDefault();
      e.stopPropagation();
      drag.current.moved = false;
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)}>
      <div
        ref={ref}
        role="region"
        aria-label={label}
        tabIndex={0}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onClickCapture={onClickCapture}
        onDragStart={(e) => e.preventDefault()}
        className="rail mx-[calc(var(--gutter)*-1)] gap-3 px-[var(--gutter)] select-none sm:cursor-grab"
      >
        {children}
      </div>
      <div className="hidden justify-end gap-3 sm:flex">
        <RailButton tone={tone} label={`Scroll ${label} back`} onClick={() => step(-1)}>
          <ArrowLeft className="size-5" />
        </RailButton>
        <RailButton tone={tone} label={`Scroll ${label} forward`} onClick={() => step(1)}>
          <ArrowRight className="size-5" />
        </RailButton>
      </div>
    </div>
  );
}

function RailButton({
  tone,
  label,
  onClick,
  children,
}: {
  tone: "navy" | "noir";
  label: string;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className={cn(
        "flex size-12 items-center justify-center rounded-full text-white transition-colors duration-200",
        tone === "navy" ? "bg-navy hover:bg-navy-2" : "bg-noir hover:bg-blue"
      )}
    >
      {children}
    </button>
  );
}
