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
    <div className={cn("border-t border-line", className)}>
      {items.map((item) => (
        <details key={item.q} className="faq-item border-b border-line">
          <summary className="flex items-start justify-between gap-8 py-7">
            <h3 className="display-tight text-lg text-ink sm:text-2xl">{item.q}</h3>
            <span className="mt-1 flex size-8 shrink-0 items-center justify-center border border-line-strong">
              <Plus className="faq-plus size-4 transition-transform duration-200" aria-hidden />
            </span>
          </summary>
          <div className="faq-body max-w-3xl pb-8 text-base leading-relaxed text-ink-mute">
            {item.a}
          </div>
        </details>
      ))}
    </div>
  );
}
