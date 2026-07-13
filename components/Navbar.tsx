"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import OzenLogo from "@/components/brand/OzenLogo";
import MagneticButton from "@/components/ui/MagneticButton";

const links = [
  { href: "/#work", label: "Work" },
  { href: "/#pricing", label: "Pricing" },
  { href: "/#faq", label: "FAQ" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        scrolled ? "glass" : "border-b border-transparent"
      }`}
    >
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
        <Link
          href="/"
          className="flex items-center gap-2.5 text-ink transition-colors hover:text-iris-bright"
          aria-label="ozen — home"
        >
          <OzenLogo size={26} />
          <span className="font-display text-xl font-medium lowercase tracking-tight">ozen</span>
        </Link>

        <div className="flex items-center gap-1 sm:gap-6">
          <div className="hidden items-center gap-6 sm:flex">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="font-mono text-[0.7rem] uppercase tracking-[0.2em] text-ink-dim transition-colors hover:text-ink"
              >
                {l.label}
              </Link>
            ))}
          </div>
          <MagneticButton>
            <Link
              href="/book"
              className="inline-flex items-center rounded-full border border-iris/40 bg-iris/10 px-5 py-2 font-mono text-[0.7rem] uppercase tracking-[0.2em] text-iris-bright transition-colors duration-300 hover:border-iris hover:bg-iris/20"
            >
              Book a call
            </Link>
          </MagneticButton>
        </div>
      </nav>
    </header>
  );
}
