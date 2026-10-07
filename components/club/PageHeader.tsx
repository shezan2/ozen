import type { ReactNode } from "react";
import SectionHeading from "@/components/ui/SectionHeading";

/** The title block that opens every inner page. */
export default function PageHeader({ title, description, children }: { title: string; description: string; children?: ReactNode }) {
  return (
    <section className="wrap flex flex-col gap-12 pt-12 pb-14 sm:gap-16 sm:pt-20 sm:pb-20">
      <SectionHeading as="h1" title={title} description={description} />
      {children}
    </section>
  );
}
