import type { ReactNode } from "react";

type PageHeroProps = {
  label: string;
  /** One entry per line. Each is a complete phrase, never a single word. */
  titleLines: ReactNode[];
  lede?: ReactNode;
  children?: ReactNode;
};

/**
 * Inner-page hero. Exactly one `h1` per page, and it lives here.
 *
 * Above the fold, so the line wipe is armed by the inline script in the layout
 * rather than by hydration — and with JavaScript off it renders in place.
 */
export default function PageHero({ label, titleLines, lede, children }: PageHeroProps) {
  return (
    <section className="on-ink bg-ink px-5 pt-28 pb-16 text-white sm:px-8 sm:pt-40 sm:pb-24">
      <div className="mx-auto max-w-6xl">
        <p className="label flex items-center gap-3 text-white/60">
          <span className="h-px w-8 bg-lime" aria-hidden />
          {label}
        </p>

        <h1
          className="lines display mt-7 max-w-5xl text-[clamp(2.25rem,1.1rem+4.8vw,4.75rem)]"
          data-lines="hero"
        >
          {titleLines.map((line, index) => (
            <span key={index}>
              <span>{line}</span>
            </span>
          ))}
        </h1>

        {lede ? <div className="lede mt-8 max-w-2xl text-white/70">{lede}</div> : null}
        {children ? <div className="mt-10">{children}</div> : null}
      </div>
    </section>
  );
}
