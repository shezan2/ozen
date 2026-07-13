import type { Metadata } from "next";
import BookingFlow from "@/components/book/BookingFlow";

export const metadata: Metadata = {
  title: "Book a call",
  description:
    "Book a free 30-minute intro call with ozen. Pick a day and time that works — we'll talk about your business and what your website should do.",
};

export default function BookPage() {
  return (
    <div className="relative overflow-hidden">
      <div
        className="pointer-events-none absolute -top-32 left-1/2 h-[420px] w-[680px] -translate-x-1/2 animate-aurora rounded-full bg-iris/10 blur-3xl"
        aria-hidden
      />
      <div className="relative mx-auto max-w-6xl px-5 pb-28 pt-32 sm:px-8">
        <div className="mb-12 max-w-2xl">
          <div className="flex items-center gap-4">
            <span className="hairline w-10" aria-hidden />
            <p className="eyebrow">Book a call</p>
          </div>
          <h1 className="mt-5 font-display text-4xl font-medium leading-[1.08] tracking-tight text-ink sm:text-5xl">
            Thirty minutes that could change how customers see you.
          </h1>
          <p className="mt-5 text-base leading-relaxed text-ink-dim">
            Pick a day and time below. We&apos;ll ask about your business, show you
            what&apos;s possible, and give you a straight answer on whether we can help.
          </p>
        </div>

        <BookingFlow />
      </div>
    </div>
  );
}
