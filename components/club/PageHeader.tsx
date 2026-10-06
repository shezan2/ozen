import type { ReactNode } from "react";
import SectionHeading from "@/components/ui/SectionHeading";

/** Floodlit title band that opens every inner page, clearing the crest tab. */
export default function PageHeader({ title, description, children }: { title: string; description: string; children?: ReactNode }) {
  return (
    <section className="floodlight border-b border-line pt-36 pb-12 sm:pt-44 sm:pb-16">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 px-5 sm:px-8">
        <SectionHeading as="h1" title={title} description={description} />
        {children}
      </div>
    </section>
  );
}
