import PillLink, { type PillVariant } from "@/components/ui/PillLink";
import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  title: string;
  description?: string;
  as?: "h1" | "h2";
  link?: { href: string; label: string };
  /** navy on black sections, noir on navy ones. */
  linkVariant?: PillVariant;
  className?: string;
}

export default function SectionHeading({
  title,
  description,
  as: Tag = "h2",
  link,
  linkVariant = "navy",
  className,
}: SectionHeadingProps) {
  return (
    <div className={cn("flex flex-wrap items-end justify-between gap-x-10 gap-y-6", className)}>
      <div className="flex min-w-0 flex-col gap-5">
        <Tag
          className={cn(
            "display text-white",
            Tag === "h1" ? "text-[clamp(2.75rem,17vw,12.5rem)]" : "text-[clamp(2.5rem,8vw,5.5rem)]"
          )}
        >
          {title}
        </Tag>
        {description && <p className="max-w-xl text-[17px] leading-relaxed text-silver">{description}</p>}
      </div>
      {link && (
        <PillLink href={link.href} variant={linkVariant}>
          {link.label}
        </PillLink>
      )}
    </div>
  );
}
