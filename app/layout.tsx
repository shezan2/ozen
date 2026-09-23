import type { Metadata } from "next";
import { Inter, Anton } from "next/font/google";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { club } from "@/lib/site";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const anton = Anton({
  variable: "--font-anton",
  subsets: ["latin"],
  weight: ["400"],
});

export const metadata: Metadata = {
  metadataBase: new URL(club.url),
  title: {
    default: club.title,
    template: `%s — ${club.shortName}`,
  },
  description: club.description,
  openGraph: {
    title: club.title,
    description: club.description,
    url: club.url,
    siteName: club.fullName,
    type: "website",
    images: ["/crest.png"],
  },
  twitter: {
    card: "summary",
    title: club.title,
    description: club.description,
    images: ["/crest.png"],
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SportsTeam",
  name: club.fullName,
  alternateName: club.shortName,
  sport: "Football",
  foundingDate: String(club.founded),
  url: club.url,
  logo: `${club.url}/crest.png`,
  sameAs: [club.instagram],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${anton.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-paper text-ink">
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
