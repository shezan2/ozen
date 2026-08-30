"use client";

import { useEffect, useState } from "react";
import { m, useReducedMotion } from "motion/react";
import LazyMotionProvider from "@/components/site/LazyMotionProvider";
import { siteConfig, whatsAppLink } from "@/lib/site-config";

/**
 * Persistent floating CTA. The Instagram call to action is "DM RESET to start",
 * so the opener is one word, not a form.
 */
export default function WhatsAppFab() {
  const [visible, setVisible] = useState(false);
  const reduced = useReducedMotion();

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 420);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <LazyMotionProvider>
    <m.a
      href={whatsAppLink()}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed right-4 bottom-4 z-40 flex items-center gap-2.5 rounded-full bg-ink py-3.5 pr-5 pl-4 text-sm font-semibold text-white shadow-[0_8px_30px_rgba(11,11,12,0.28)] sm:right-6 sm:bottom-6"
      initial={false}
      animate={
        reduced
          ? { opacity: visible ? 1 : 0 }
          : { opacity: visible ? 1 : 0, y: visible ? 0 : 24, scale: visible ? 1 : 0.9 }
      }
      transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
      style={{ pointerEvents: visible ? "auto" : "none" }}
      aria-hidden={!visible}
      tabIndex={visible ? undefined : -1}
    >
      <svg viewBox="0 0 24 24" className="size-5 fill-lime" aria-hidden focusable="false">
        <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.46 1.32 4.96L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2Zm0 18.15h-.01a8.2 8.2 0 0 1-4.19-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.19 8.19 0 0 1-1.26-4.38c0-4.54 3.7-8.23 8.25-8.23 2.2 0 4.27.86 5.83 2.41a8.19 8.19 0 0 1 2.41 5.83c0 4.54-3.7 8.23-8.24 8.23Zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.13-.16.24-.64.8-.78.97-.15.16-.29.18-.53.06-.25-.12-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.01-.38.11-.5.11-.11.25-.29.37-.44.13-.15.17-.25.25-.41.08-.17.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.4-.42-.56-.43h-.48c-.16 0-.43.06-.65.31-.22.25-.85.83-.85 2.03s.87 2.35.99 2.51c.12.16 1.71 2.61 4.14 3.66.58.25 1.03.4 1.38.51.58.18 1.11.16 1.53.1.47-.07 1.47-.6 1.67-1.18.21-.58.21-1.07.15-1.18-.06-.1-.22-.16-.47-.28Z" />
      </svg>
      Message {siteConfig.contact.whatsappKeyword}
    </m.a>
    </LazyMotionProvider>
  );
}
