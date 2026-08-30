import Link from "next/link";
import { navLinks, siteConfig, whatsAppLink } from "@/lib/site-config";
import { disclaimers } from "@/lib/content";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="on-ink bg-ink text-white">
      <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-20">
        <div className="grid gap-12 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <p className="display text-3xl">MYO</p>
            <p className="mt-1 text-[0.65rem] font-semibold tracking-[0.18em] text-white/55 uppercase">
              Fitness Solutions
            </p>
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-white/70">
              {siteConfig.tagline}. {siteConfig.positioning}.
            </p>
            <a
              href={whatsAppLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-lime hover:underline"
            >
              Message {siteConfig.contact.whatsappKeyword} on WhatsApp
            </a>
          </div>

          <nav aria-label="Footer">
            <h2 className="eyebrow text-white/50">Pages</h2>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <Link href="/" className="text-white/80 hover:text-lime">
                  Home
                </Link>
              </li>
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-white/80 hover:text-lime">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h2 className="eyebrow text-white/50">Get in touch</h2>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <a href={`mailto:${siteConfig.contact.email}`} className="text-white/80 hover:text-lime">
                  {siteConfig.contact.email}
                </a>
              </li>
              <li>
                <a
                  href={whatsAppLink()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/80 hover:text-lime"
                >
                  {siteConfig.contact.whatsappDisplay}
                </a>
              </li>
              <li>
                <a
                  href={siteConfig.social.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/80 hover:text-lime"
                >
                  Instagram
                </a>
              </li>
              <li>
                <a
                  href={siteConfig.social.threads}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/80 hover:text-lime"
                >
                  Threads
                </a>
              </li>
              <li className="pt-1 text-white/55">{siteConfig.location.city}</li>
            </ul>
          </div>
        </div>

        <div className="mt-14 space-y-3 border-t border-line-dark pt-8 text-xs leading-relaxed text-white/50">
          <p>{disclaimers.preParticipation}</p>
          <p>{disclaimers.results}</p>
        </div>

        <div className="mt-8 flex flex-col gap-3 text-xs text-white/60 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {siteConfig.brand}
          </p>
          <Link href="/privacy-policy" className="hover:text-lime">
            Privacy policy
          </Link>
        </div>
      </div>
    </footer>
  );
}
