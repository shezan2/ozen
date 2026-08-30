import type { Metadata, Viewport } from "next";
import { Archivo } from "next/font/google";
import Header from "@/components/site/Header";
import Footer from "@/components/site/Footer";
import WhatsAppFab from "@/components/site/WhatsAppFab";
import ScrollAnimator from "@/components/site/ScrollAnimator";
import JsonLd from "@/components/site/JsonLd";
import { siteConfig } from "@/lib/site-config";
import { pageMeta } from "@/lib/content";
import "./globals.css";

/**
 * One variable family across the whole site. Archivo carries the heavy,
 * high-contrast headline weights the brand's story graphics use, and reads
 * cleanly at body sizes — so the site ships a single font file rather than two.
 */
const archivo = Archivo({
  subsets: ["latin"],
  variable: "--font-archivo",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: pageMeta.home.title,
    template: `%s | ${siteConfig.brand}`,
  },
  description: pageMeta.home.description,
  applicationName: siteConfig.brand,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "en_SG",
    siteName: siteConfig.brand,
    url: siteConfig.url,
    title: pageMeta.home.title,
    description: pageMeta.home.description,
  },
  twitter: {
    card: "summary_large_image",
    title: pageMeta.home.title,
    description: pageMeta.home.description,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  category: "fitness",
};

export const viewport: Viewport = {
  themeColor: "#0b0b0c",
  colorScheme: "light",
};

/** Business-level structured data, present on every route. */
const localBusiness = {
 "@context": "https://schema.org",
 "@type": "LocalBusiness",
 "@id": `${siteConfig.url}/#business`,
  name: siteConfig.brand,
  description: `${siteConfig.tagline}. ${siteConfig.positioning}.`,
  url: siteConfig.url,
  telephone: siteConfig.contact.whatsappDisplay,
  email: siteConfig.contact.email,
  image: `${siteConfig.url}/opengraph-image`,
  priceRange: siteConfig.schema.priceRange,
  currenciesAccepted: siteConfig.schema.currency,
  address: {
   "@type": "PostalAddress",
    addressLocality: siteConfig.location.city,
    addressCountry: siteConfig.location.country,
  },
  areaServed: { "@type": "City", name: siteConfig.schema.areaServed },
  sameAs: [siteConfig.social.instagram, siteConfig.social.threads],
  founder: {
   "@type": "Person",
   "@id": `${siteConfig.url}/about#coach`,
    name: siteConfig.coach.name,
    jobTitle: siteConfig.coach.jobTitle,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-SG" className={archivo.variable}>
      <body className="flex min-h-screen flex-col bg-surface text-ink antialiased">
        {/* Arms the hero headline wipe before first paint, so it never waits on
            hydration. With JavaScript off the class is never set and the
            headline simply renders in place. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
             "document.documentElement.classList.add('js');requestAnimationFrame(function(){requestAnimationFrame(function(){document.documentElement.classList.add('ready')})})",
          }}
        />
        <JsonLd data={localBusiness} />
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-100 focus:focus:bg-ink focus:px-5 focus:py-3 focus:text-sm focus:font-semibold focus:text-white"
        >
          Skip to content
        </a>
        <Header />
        <main id="main" className="flex-1">
          {children}
        </main>
        <Footer />
        <WhatsAppFab />
        <ScrollAnimator />
      </body>
    </html>
  );
}
