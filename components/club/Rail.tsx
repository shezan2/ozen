"use client";

import { useRef, type ReactNode } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

/** Horizontally scrolling row: swipe, trackpad, keyboard, the step buttons, or drag with a mouse. */
export default function Rail({ label, children, className }: { label: string; children: ReactNode; className?: string }) {
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
        data-lenis-prevent-horizontal
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onClickCapture={onClickCapture}
        onDragStart={(e) => e.preventDefault()}
        className="rail -mx-5 gap-4 px-5 pb-4 select-none sm:-mx-10 sm:cursor-grab sm:px-10"
      >
        {children}
      </div>
      <div className="hidden justify-end gap-3 sm:flex">
        <RailButton label={`Scroll ${label} back`} onClick={() => step(-1)}>
          <ArrowLeft className="size-5" />
        </RailButton>
        <RailButton label={`Scroll ${label} forward`} onClick={() => step(1)}>
          <ArrowRight className="size-5" />
        </RailButton>
      </div>
    </div>
  );
}

function RailButton({ label, onClick, children }: { label: string; onClick: () => void; children: ReactNode }) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className="glass flex size-12 items-center justify-center rounded-full text-chalk backdrop-blur-xl transition-[border-color,transform] duration-500 ease-out-expo hover:scale-105 hover:border-line-strong"
    >
      {children}
    </button>
  );
}
