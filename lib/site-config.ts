/**
 * Single source of truth for every business detail on the site.
 *
 * Nothing here should be hardcoded in a component. Values tagged [SAMPLE] are
 * scaffolding so the build runs end to end — they did not come from the client
 * and must be replaced before launch. Every one is listed in the README TODO
 * block.
 */

const DOMAIN = "myofitnesssolutions.sg"; // [SAMPLE]

export const siteConfig = {
  /* ---------------------------------------------------------------- brand */
  brand: "Myo Fitness Solutions",
  shortBrand: "Myo",
  domain: DOMAIN,
  url: `https://${DOMAIN}`,

  /** Straight from the Instagram bio. */
  tagline: "Helping Singapore dads lose 5–10kg in 3 hours a week",
  strapline: "Strong, present, chase the kids",
  positioning: "Built around your life, not against it",

  /* ---------------------------------------------------------------- coach */
  coach: {
    name: "Myo Tan", // [SAMPLE]
    handle: "myofitnesssolutions",
    role: "Personal trainer and transformation coach",
    jobTitle: "3-Hour Transformation Coach",
    yearsCoaching: 6, // [SAMPLE]
    certifications: [
      "ACE Certified Personal Trainer", // [SAMPLE]
      "Precision Nutrition Level 1", // [SAMPLE]
    ],
  },

  /* -------------------------------------------------------------- contact */
  contact: {
    /** E.164 without the +, for wa.me links. */
    whatsappNumber: "6580000000", // [SAMPLE]
    whatsappDisplay: "+65 8000 0000", // [SAMPLE]
    /** The Instagram CTA is "DM RESET to start" — the site mirrors it. */
    whatsappKeyword: "RESET",
    email: "hello@myofitnesssolutions.sg", // [SAMPLE]
    bookingUrl: "https://cal.com/myofitness", // [SAMPLE]
  },

  /* ------------------------------------------------------------- location */
  location: {
    city: "Singapore",
    region: "Central Singapore", // [SAMPLE]
    country: "SG",
    /** Hybrid: in person at a partner gym, plus online coaching. */
    trainingModel: "Hybrid — in person in central Singapore, plus online", // [SAMPLE]
    onlineCoaching: true, // [SAMPLE]
    /** No public street address is published; sessions are booked directly. */
    streetAddress: null as string | null,
  },

  /* --------------------------------------------------------------- social */
  social: {
    instagram: "https://www.instagram.com/myofitnesssolutions/",
    threads: "https://www.threads.net/@myofitnesssolutions",
  },

  /* ------------------------------------------------------------- packages */
  /** Prices are [SAMPLE]. Currency is Singapore dollars. */
  packages: [
    {
      slug: "starter",
      name: "Starter",
      price: 880,
      priceDisplay: "S$880",
      unit: "8 sessions",
      description:
        "A first block for dads who want to test whether three hours a week actually fits before committing further.",
      featured: false,
    },
    {
      slug: "core",
      name: "Core",
      price: 1260,
      priceDisplay: "S$1,260",
      unit: "12 sessions",
      description:
        "The main block. Long enough for the training to build on itself and for the eating side to stop feeling like a diet.",
      featured: true,
    },
    {
      slug: "online",
      name: "Online coaching",
      price: 320,
      priceDisplay: "S$320",
      unit: "per month",
      description:
        "For dads who travel, work odd hours, or already have a gym they can get to. Programming and guidance, remote.",
      featured: false,
    },
  ],

  /* --------------------------------------------------------------- schema */
  schema: {
    priceRange: "S$320–S$1,260", // derived from the [SAMPLE] packages above
    currency: "SGD",
    /** ISO 8601 durations are avoided — no session length has been confirmed. */
    areaServed: "Singapore",
  },
} as const;

export type SitePackage = (typeof siteConfig)["packages"][number];

/** Builds a wa.me deep link with an optional prefilled opener. */
export function whatsAppLink(message?: string): string {
  const text = message ?? siteConfig.contact.whatsappKeyword;
  return `https://wa.me/${siteConfig.contact.whatsappNumber}?text=${encodeURIComponent(text)}`;
}

export const routes = [
  { href: "/", label: "Home" },
  { href: "/the-3-hour-method", label: "The 3-hour method" },
  { href: "/transformations", label: "Transformations" },
  { href: "/about", label: "About" },
  { href: "/pricing", label: "Pricing" },
  { href: "/contact", label: "Contact" },
] as const;

/** Nav shown in the header — home is the logo, so it is not repeated. */
export const navLinks = routes.filter((r) => r.href !== "/");
