"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, m } from "motion/react";
import LazyMotionProvider from "@/components/site/LazyMotionProvider";
import { Menu, X } from "lucide-react";
import { navLinks, siteConfig, whatsAppLink } from "@/lib/site-config";
import { buttonStyles } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

export default function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Lock the page behind the overlay, and let Escape dismiss it.
  useEffect(() => {
    if (!open) return;

    document.body.style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-surface/92 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-5 sm:h-18 sm:px-8">
        <Link href="/" className="group flex items-baseline gap-2" aria-label={`${siteConfig.brand} — home`}>
          <span className="display text-2xl leading-none sm:text-[1.75rem]">MYO</span>
          <span className="hidden text-[0.65rem] font-semibold tracking-[0.18em] text-ink-mute uppercase sm:inline">
            Fitness Solutions
          </span>
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-1 lg:flex">
          {navLinks.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "rounded-full px-3.5 py-2 text-sm font-medium transition-colors",
                  active ? "bg-surface-sunken text-ink" : "text-ink-mute hover:text-ink",
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <a
            href={whatsAppLink()}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonStyles("lime", "md", "hidden h-11 px-5 text-sm sm:inline-flex")}
          >
            Message {siteConfig.contact.whatsappKeyword}
          </a>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            className="flex size-11 items-center justify-center rounded-full border border-line text-ink lg:hidden"
          >
            {open ? <X className="size-5" aria-hidden /> : <Menu className="size-5" aria-hidden />}
            <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
          </button>
        </div>
      </div>

      <LazyMotionProvider>
        <AnimatePresence>
        {open && (
          <m.div
            id="mobile-menu"
            className="on-ink fixed inset-x-0 top-16 bottom-0 z-40 overflow-y-auto bg-ink px-5 pt-8 pb-12 sm:top-18 lg:hidden"
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          >
            <nav aria-label="Mobile" className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  aria-current={pathname === link.href ? "page" : undefined}
                  className={cn(
                    "display border-b border-line-dark py-4 text-[1.75rem] text-white",
                    pathname === link.href && "text-lime",
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
            <a
              href={whatsAppLink()}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setOpen(false)}
              className={buttonStyles("lime", "lg", "mt-8 w-full")}
            >
              Message {siteConfig.contact.whatsappKeyword} on WhatsApp
            </a>
          </m.div>
        )}
      </AnimatePresence>
      </LazyMotionProvider>
    </header>
  );
}
