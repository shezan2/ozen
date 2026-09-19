"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Menu, X } from "lucide-react";
import Crest from "@/components/club/Crest";
import { cn } from "@/lib/utils";

const links = [
  { href: "/squad", label: "Squad" },
  { href: "/matches", label: "Matches" },
  { href: "/leaderboard", label: "Leaderboard" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [lastPathname, setLastPathname] = useState(pathname);

  if (pathname !== lastPathname) {
    setLastPathname(pathname);
    setOpen(false);
  }

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Only the homepage opens on a full-bleed dark hero, so only there does the
  // transparent (pre-scroll) nav need light text to stay legible.
  const overDark = pathname === "/" && !scrolled;

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-shadow duration-300",
        scrolled
          ? "glass-nav shadow-[0_1px_0_var(--line)] backdrop-blur-xl backdrop-saturate-150"
          : "bg-transparent"
      )}
    >
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
        <Link href="/" className="flex items-center gap-2.5" aria-label="Chèvre Noir FC — home">
          <Crest size={34} priority />
          <span
            className={cn(
              "text-[0.95rem] font-semibold tracking-tight transition-colors",
              overDark ? "text-paper-ink" : "text-ink"
            )}
          >
            Chèvre Noir{" "}
            <span className={cn("font-normal transition-colors", overDark ? "text-paper-ink-dim" : "text-ink-dim")}>
              FC
            </span>
          </span>
        </Link>

        <div className="hidden items-center gap-8 sm:flex">
          {links.map((l) => {
            const active = pathname === l.href;
            return (
              <Link
                key={l.href}
                href={l.href}
                className={cn(
                  "relative text-sm font-medium transition-colors",
                  active
                    ? overDark
                      ? "text-paper-ink"
                      : "text-ink"
                    : overDark
                      ? "text-paper-ink-dim hover:text-paper-ink"
                      : "text-ink-dim hover:text-ink"
                )}
              >
                {l.label}
                {active && (
                  <motion.span
                    layoutId="nav-active"
                    className="absolute -bottom-[19px] left-0 right-0 h-[2px] bg-gold"
                    transition={{ type: "spring", stiffness: 500, damping: 40 }}
                  />
                )}
              </Link>
            );
          })}
        </div>

        <button
          onClick={() => setOpen((v) => !v)}
          className={cn(
            "inline-flex size-9 items-center justify-center rounded-full transition-colors sm:hidden",
            overDark ? "text-paper-ink" : "text-ink"
          )}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden border-t border-line glass-nav backdrop-blur-xl backdrop-saturate-150 sm:hidden"
          >
            <div className="flex flex-col gap-1 px-5 py-4">
              {links.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className={cn(
                    "rounded-lg px-3 py-2.5 text-base font-medium transition-colors",
                    pathname === l.href ? "bg-noir/5 text-ink" : "text-ink-dim hover:text-ink"
                  )}
                >
                  {l.label}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
