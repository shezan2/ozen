import type { Metadata } from "next";
import { Fraunces, Geist, Geist_Mono } from "next/font/google";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { site } from "@/lib/site";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: site.title,
    template: "%s — ozen",
  },
  description: site.description,
  openGraph: {
    title: site.title,
    description: site.description,
    url: site.url,
    siteName: site.brand,
    type: "website",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  name: site.brand,
  description: site.description,
  url: site.url,
  email: site.email,
  priceRange: "$$",
  makesOffer: [
    {
      "@type": "Offer",
      name: "Website design & build",
      price: "2000",
      priceCurrency: "USD",
    },
    {
      "@type": "Offer",
      name: "Care plan",
      price: "199",
      priceCurrency: "USD",
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`dark ${geistSans.variable} ${geistMono.variable} ${fraunces.variable} h-full antialiased`}
    >
      <body className="grain flex min-h-full flex-col bg-canvas text-ink">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
