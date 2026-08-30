import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

type FaqProps = {
  items: readonly { q: string; a: string }[];
  className?: string;
};

/**
 * Native `<details>` rather than a JavaScript accordion, so every answer is in
 * the server HTML, works with JavaScript disabled, and is keyboard operable for
 * free. Only the disclosure itself is animated, in CSS.
 */
export default function Faq({ items, className }: FaqProps) {
  return (
    <div className={cn("divide-y divide-line border-y border-line", className)}>
      {items.map((item) => (
        <details key={item.q} className="faq-item group">
          <summary className="flex items-start justify-between gap-6 py-6 text-left">
            <h3 className="display-tight text-lg text-ink sm:text-xl">{item.q}</h3>
            <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full border border-line-strong">
              <Plus className="faq-chevron size-4 transition-transform duration-200" aria-hidden />
            </span>
          </summary>
          <div className="faq-body max-w-3xl pb-7 text-[0.9375rem] leading-relaxed text-ink-mute">
            {item.a}
          </div>
        </details>
      ))}
    </div>
  );
}
