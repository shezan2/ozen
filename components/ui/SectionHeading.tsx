import TextReveal from "@/components/motion/TextReveal";
import Reveal from "@/components/motion/Reveal";
import PillLink from "@/components/ui/PillLink";
import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  title: string;
  description?: string;
  as?: "h1" | "h2";
  link?: { href: string; label: string };
  className?: string;
}

export default function SectionHeading({ title, description, as = "h2", link, className }: SectionHeadingProps) {
  return (
    <div className={cn("flex flex-wrap items-end justify-between gap-x-10 gap-y-6", className)}>
      <div className="flex max-w-3xl flex-col gap-5">
        <TextReveal
          as={as}
          text={title}
          className={cn(
            "font-display tracking-[-0.02em] text-chalk",
            // Size and leading share a string: tailwind-merge drops a leading that precedes a font size.
            as === "h1"
              ? "text-[clamp(3.75rem,10vw,9.5rem)] leading-[0.95] lg:opsz-36"
              : "text-[clamp(2.75rem,5.4vw,5rem)] leading-[0.95]"
          )}
        />
        {description && (
          <Reveal delay={0.15}>
            <p className="max-w-xl text-base leading-relaxed text-silver sm:text-lg">{description}</p>
          </Reveal>
        )}
      </div>
      {link && (
        <Reveal delay={0.2}>
          <PillLink href={link.href} variant="glass">
            {link.label}
          </PillLink>
        </Reveal>
      )}
    </div>
  );
}
