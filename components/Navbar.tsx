"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
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
  const [open, setOpen] = useState(false);
  const [lastPathname, setLastPathname] = useState(pathname);

  if (pathname !== lastPathname) {
    setLastPathname(pathname);
    setOpen(false);
  }

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b-4 border-noir bg-paper">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
        <Link href="/" className="flex items-center gap-2.5" aria-label="Chèvre Noir FC — home">
          <Crest size={34} priority />
          <span className="font-display text-lg uppercase tracking-tight text-ink">
            Chevre Noir <span className="text-gold-deep">FC</span>
          </span>
        </Link>

        <div className="hidden items-center gap-1 sm:flex">
          {links.map((l) => {
            const active = pathname === l.href;
            return (
              <Link key={l.href} href={l.href} className="relative px-4 py-2 text-sm font-bold uppercase tracking-wide">
                {active && (
                  <motion.span
                    layoutId="nav-active"
                    className="absolute inset-0 bg-gold"
                    transition={{ type: "spring", stiffness: 500, damping: 40 }}
                  />
                )}
                <span className={cn("relative", active ? "text-noir" : "text-ink-dim hover:text-ink")}>
                  {l.label}
                </span>
              </Link>
            );
          })}
        </div>

        <button
          onClick={() => setOpen((v) => !v)}
          className="inline-flex size-9 items-center justify-center text-ink sm:hidden"
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
            className="overflow-hidden border-t-4 border-noir bg-paper sm:hidden"
          >
            <div className="flex flex-col gap-1 px-5 py-4">
              {links.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className={cn(
                    "px-3 py-2.5 text-base font-bold uppercase tracking-wide transition-colors",
                    pathname === l.href ? "bg-gold text-noir" : "text-ink-dim hover:text-ink"
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
