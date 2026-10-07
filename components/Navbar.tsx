"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import Crest from "@/components/club/Crest";
import { EASE_OUT } from "@/lib/motion";
import { club } from "@/lib/site";
import { cn } from "@/lib/utils";

const links = [
  { href: "/squad", label: "Squad" },
  { href: "/matches", label: "Matches" },
  { href: "/leaderboard", label: "Leaderboard" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [lastPathname, setLastPathname] = useState(pathname);
  const menuButton = useRef<HTMLButtonElement>(null);
  const { scrollY } = useScroll();
  const closeMenu = useCallback(() => setOpen(false), []);

  if (pathname !== lastPathname) {
    setLastPathname(pathname);
    setOpen(false);
  }

  // Step aside while reading down the page; return the moment you scroll up.
  useMotionValueEvent(scrollY, "change", (y) => {
    const previous = scrollY.getPrevious() ?? 0;
    setHidden(y > previous && y > 240);
  });

  return (
    <>
      <motion.header
        style={{ viewTransitionName: "site-nav" }}
        className="sticky top-0 z-50 bg-noir"
        initial={false}
        animate={{ y: hidden && !open ? "-100%" : "0%" }}
        transition={{ duration: 0.3, ease: EASE_OUT }}
      >
        <nav aria-label="Main" className="wrap flex h-16 items-center justify-between gap-4 sm:h-[4.5rem]">
          <Link href="/" className="flex items-center gap-3" aria-label="Chèvre Noir FC — home">
            <Crest decorative size={48} priority className="size-10 sm:size-11" />
            <span className="display text-[1.75rem] leading-none tracking-[0.01em] text-white">{club.name}</span>
          </Link>

          <div className="hidden items-center gap-1 sm:flex">
            {links.map((l) => {
              const active = pathname === l.href;
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "rounded-full px-4 py-2 text-[15px] font-semibold transition-colors duration-200",
                    active ? "bg-blue text-white" : "text-silver hover:bg-navy hover:text-white"
                  )}
                >
                  {l.label}
                </Link>
              );
            })}
          </div>

          <button
            ref={menuButton}
            onClick={() => setOpen(true)}
            className="h-10 rounded-full bg-navy px-5 text-[15px] font-semibold text-white sm:hidden"
            aria-haspopup="dialog"
            aria-expanded={open}
          >
            Menu
          </button>
        </nav>
      </motion.header>

      <AnimatePresence onExitComplete={() => menuButton.current?.focus()}>
        {open && <MobileMenu pathname={pathname} onClose={closeMenu} />}
      </AnimatePresence>
    </>
  );
}

function MobileMenu({ pathname, onClose }: { pathname: string; onClose: () => void }) {
  const closeButton = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const root = document.documentElement;
    root.style.overflow = "hidden";
    closeButton.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      root.style.overflow = "";
    };
  }, [onClose]);

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-label="Menu"
      className="fixed inset-0 z-[60] flex flex-col bg-blue text-white"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2, ease: EASE_OUT }}
    >
      <div className="wrap flex h-16 items-center justify-between">
        <Crest decorative size={48} className="size-10" />
        <button ref={closeButton} onClick={onClose} className="h-10 rounded-full bg-noir px-5 text-[15px] font-semibold text-white">
          Close
        </button>
      </div>

      <nav className="wrap flex flex-1 flex-col justify-center gap-2">
        {[{ href: "/", label: "Home" }, ...links].map((l) => {
          const active = pathname === l.href;
          return (
            <Link
              key={l.href}
              href={l.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "display text-[clamp(3.5rem,17vw,5.5rem)] leading-[0.95] transition-colors duration-200",
                active ? "text-white" : "text-haze hover:text-white"
              )}
            >
              {l.label}
            </Link>
          );
        })}
      </nav>

      <div className="wrap flex items-center justify-between pb-8">
        <span className="display text-2xl leading-none">{club.motto}</span>
        <a href={club.instagram} target="_blank" rel="noreferrer" className="text-[15px] font-semibold text-haze hover:text-white">
          Instagram
        </a>
      </div>
    </motion.div>
  );
}
