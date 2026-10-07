"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import Crest from "@/components/club/Crest";
import { getLenis } from "@/lib/lenis";
import { EASE_IN_OUT, EASE_OUT } from "@/lib/motion";
import { club } from "@/lib/site";
import { cn } from "@/lib/utils";

const links = [
  { href: "/squad", label: "Squad" },
  { href: "/matches", label: "Matches" },
  { href: "/leaderboard", label: "Leaderboard" },
];

const PILL_SPRING = { type: "spring", stiffness: 420, damping: 36 } as const;

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);
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
        className="fixed inset-x-0 top-0 z-50 flex justify-center px-3 pt-3 sm:pt-4"
        initial={false}
        animate={{ y: hidden && !open ? "-140%" : "0%" }}
        transition={{ duration: 0.7, ease: EASE_OUT }}
      >
        <nav
          aria-label="Main"
          className="glass flex h-14 w-full max-w-3xl items-center justify-between rounded-full pr-2 pl-2 backdrop-blur-2xl backdrop-saturate-150"
        >
          <Link href="/" className="flex items-center gap-3 rounded-full pr-3" aria-label="Chèvre Noir FC — home">
            <Crest decorative size={40} priority className="size-10" />
            <span className="font-display text-[1.15rem] text-chalk">Chèvre Noir</span>
          </Link>

          <div className="hidden items-center sm:flex" onPointerLeave={() => setHovered(null)}>
            {links.map((l) => {
              const active = pathname === l.href;
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  aria-current={active ? "page" : undefined}
                  onPointerEnter={() => setHovered(l.href)}
                  className="relative rounded-full px-4 py-2 text-sm"
                >
                  {hovered === l.href && !active && (
                    <motion.span layoutId="nav-hover" className="absolute inset-0 rounded-full bg-white/[0.05]" transition={PILL_SPRING} />
                  )}
                  {active && (
                    <motion.span
                      layoutId="nav-active"
                      className="absolute inset-0 rounded-full bg-white/[0.1] ring-1 ring-white/15 ring-inset"
                      transition={PILL_SPRING}
                    />
                  )}
                  <span className={cn("relative transition-colors duration-300", active ? "text-chalk" : "text-silver hover:text-chalk")}>
                    {l.label}
                  </span>
                </Link>
              );
            })}
          </div>

          <button
            ref={menuButton}
            onClick={() => setOpen(true)}
            className="h-10 rounded-full px-5 text-sm text-chalk ring-1 ring-white/15 ring-inset sm:hidden"
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
    getLenis()?.stop();
    root.style.overflow = "hidden";
    closeButton.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      root.style.overflow = "";
      getLenis()?.start();
    };
  }, [onClose]);

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-label="Menu"
      className="fixed inset-0 z-[60] flex flex-col bg-noir"
      initial={{ clipPath: "inset(0% 0% 100% 0%)" }}
      animate={{ clipPath: "inset(0% 0% 0% 0%)" }}
      exit={{ clipPath: "inset(0% 0% 100% 0%)" }}
      transition={{ duration: 0.75, ease: EASE_IN_OUT }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(ellipse 80% 50% at 50% 0%, rgba(43,79,176,0.35), transparent 70%)" }}
      />
      <div className="relative flex items-center justify-between px-5 pt-5">
        <Crest decorative size={40} className="size-10" />
        <button ref={closeButton} onClick={onClose} className="h-10 rounded-full px-5 text-sm text-chalk ring-1 ring-white/15 ring-inset">
          Close
        </button>
      </div>

      <motion.nav
        aria-label="Main"
        className="relative flex flex-1 flex-col justify-center gap-2 px-6"
        initial="hidden"
        animate="show"
        transition={{ staggerChildren: 0.08, delayChildren: 0.3 }}
      >
        {[{ href: "/", label: "Home" }, ...links].map((l) => {
          const active = pathname === l.href;
          return (
            <span key={l.href} className="reveal-mask font-display text-[clamp(2.75rem,14vw,3.75rem)] leading-[1.1]">
              <motion.span
                className="block"
                variants={{ hidden: { y: "115%" }, show: { y: "0%", transition: { duration: 1, ease: EASE_OUT } } }}
              >
                <Link
                  href={l.href}
                  aria-current={active ? "page" : undefined}
                  className={active ? "text-chalk" : "text-silver"}
                >
                  {l.label}
                </Link>
              </motion.span>
            </span>
          );
        })}
      </motion.nav>

      <div className="relative flex items-center justify-between px-6 pb-8 text-sm">
        <span className="font-display text-lg text-chalk italic">{club.motto}</span>
        <a href={club.instagram} target="_blank" rel="noreferrer" className="text-silver">
          Instagram
        </a>
      </div>
    </motion.div>
  );
}
