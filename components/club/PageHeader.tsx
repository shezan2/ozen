import type { ReactNode } from "react";
import SectionHeading from "@/components/ui/SectionHeading";

/** Floodlit title band that opens every inner page. */
export default function PageHeader({ title, description, children }: { title: string; description: string; children?: ReactNode }) {
  return (
    <section className="relative overflow-hidden pt-36 pb-16 sm:pt-48 sm:pb-24">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_55%_75%_at_18%_-12%,rgba(43,79,176,0.5),transparent_72%)]"
      />
      <div className="relative mx-auto flex max-w-[88rem] flex-col gap-14 px-5 sm:px-10">
        <SectionHeading as="h1" title={title} description={description} />
        {children}
      </div>
    </section>
  );
}
