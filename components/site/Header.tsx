"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, m } from "motion/react";
import { Menu, X } from "lucide-react";
import LazyMotionProvider from "@/components/site/LazyMotionProvider";
import { navLinks, siteConfig, whatsAppLink } from "@/lib/site-config";
import { buttonStyles } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

export default function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [stuck, setStuck] = useState(false);

  // Every page opens on a dark hero, so the bar starts transparent and only
  // takes a background once it is over the page body.
  useEffect(() => {
    const onScroll = () => setStuck(window.scrollY > 32);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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

  const dark = !stuck && !open;

  return (
    <header
      className={cn(
       "fixed inset-x-0 top-0 z-50 transition-colors duration-300",
        stuck || open ? "border-b border-line bg-surface" : "bg-transparent",
      )}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-5 sm:h-20 sm:px-8">
        <Link
          href="/"
          className="flex items-baseline gap-2.5"
          aria-label={`${siteConfig.brand} — home`}
        >
          <span
            className={cn(
             "display text-2xl leading-none transition-colors sm:text-[1.875rem]",
              dark ? "text-white" : "text-ink",
            )}
          >
            MYO
          </span>
          <span
            className={cn(
             "label hidden transition-colors sm:inline",
              dark ? "text-white/55" : "text-ink-mute",
            )}
          >
            Fitness Solutions
          </span>
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-7 lg:flex">
          {navLinks.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                 "relative py-1 text-sm font-semibold transition-colors",
                  dark ? "text-white/75 hover:text-white" : "text-ink-mute hover:text-ink",
                  active && (dark ? "text-white" : "text-ink"),
                )}
              >
                {link.label}
                {active ? (
                  <span className="absolute inset-x-0 -bottom-0.5 h-0.5 bg-lime" aria-hidden />
                ) : null}
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
            className={cn(
             "flex size-11 items-center justify-center border transition-colors lg:hidden",
              dark ? "border-white/30 text-white" : "border-line-strong text-ink",
            )}
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
              className="on-ink fixed inset-x-0 top-16 bottom-0 z-40 overflow-y-auto bg-ink px-5 pt-8 pb-12 sm:top-20 lg:hidden"
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            >
              <nav aria-label="Mobile" className="flex flex-col">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    aria-current={pathname === link.href ? "page" : undefined}
                    className={cn(
                     "display border-b border-line-dark py-5 text-[1.875rem] text-white",
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
