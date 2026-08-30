import type { ReactNode } from "react";

type PageHeroProps = {
  eyebrow: string;
  title: ReactNode;
  lede?: ReactNode;
  children?: ReactNode;
};

/** Inner-page hero. Exactly one `h1` per page, and it lives here. */
export default function PageHero({ eyebrow, title, lede, children }: PageHeroProps) {
  return (
    <section className="on-ink bg-ink px-5 pt-14 pb-16 text-white sm:px-8 sm:pt-20 sm:pb-20">
      <div className="mx-auto max-w-6xl">
        <p className="eyebrow text-lime">{eyebrow}</p>
        <h1 className="display mt-5 max-w-4xl text-[clamp(2.25rem,1.4rem+3.8vw,4.5rem)]">{title}</h1>
        {lede ? <div className="lede mt-7 max-w-2xl text-white/70">{lede}</div> : null}
        {children ? <div className="mt-9">{children}</div> : null}
      </div>
    </section>
  );
}
