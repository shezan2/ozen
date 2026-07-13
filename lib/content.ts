export const services = [
  {
    index: "01",
    title: "Custom Web Design",
    description:
      "A tailored visual identity for your brand — not a template. Designed for user experience and conversion, with two full rounds of revisions included.",
  },
  {
    index: "02",
    title: "High-Performance Development",
    description:
      "Clean, modern, lightning-fast front-end engineering. Built on cutting-edge frameworks and deployed to secure, global cloud infrastructure on Vercel.",
  },
  {
    index: "03",
    title: "Mobile & Speed Optimization",
    description:
      "Seamless on every phone and tablet, with optimized asset delivery for near-instant load speeds. Fast sites rank better and convert more.",
  },
  {
    index: "04",
    title: "Ongoing Care",
    description:
      "Hosting, domain management, content edits, updates and monitoring — so your site stays sharp long after launch. Optional, cancel anytime.",
  },
] as const;

export const corePages = [
  "Home — high-converting landing page",
  "About Us — company profile",
  "Services / Products — what you offer",
  "Contact — automated lead-capture form",
  "Privacy Policy & Terms — compliance covered",
] as const;

export const work = [
  {
    slug: "ammar-gidany",
    title: "Ammar Gidany",
    blurb:
      "A cinematic digital presence for a Singapore luxury real-estate agent — property portfolio, valuation tools and neighbourhood guides.",
    tags: ["Real Estate", "Design + Build", "Next.js"],
    url: "https://ammar-gidany-properties.vercel.app/",
    image: "/work/ammar-gidany.png",
    displayUrl: "ammar-gidany-properties.vercel.app",
  },
  {
    slug: "s-rise",
    title: "S-RISE FL",
    blurb:
      "Drama, passion, glory — a tournament platform for a football league with live brackets, fixtures, teams and stats.",
    tags: ["Sports Platform", "Design + Build", "Next.js"],
    url: "https://s-rise-fl.vercel.app/",
    image: "/work/s-rise.png",
    displayUrl: "s-rise-fl.vercel.app",
  },
] as const;

export const faqs = [
  {
    question: "How much does a website cost?",
    answer:
      "One flat $2,000 — design, development, and launch included. No hourly billing, no surprise line items. If you want us to keep caring for the site after launch, that's an optional $199/month.",
  },
  {
    question: "How long does it take?",
    answer:
      "Most sites launch in 2–3 weeks from kickoff. Week one is design, week two is build, and the final days are revisions, polish, and go-live on your domain.",
  },
  {
    question: "What exactly is included in the $2,000?",
    answer:
      "Custom design (no templates) with two rounds of revisions, high-performance development deployed on Vercel, up to five core pages — Home, About, Services, Contact, and Privacy & Terms — plus full mobile and speed optimization.",
  },
  {
    question: "What does the $199/month care plan cover?",
    answer:
      "Hosting and domain management, software updates and security monitoring, content edits when you need them, and priority support. It's optional and you can cancel anytime — the site is yours either way.",
  },
  {
    question: "What do you need from me to get started?",
    answer:
      "Just a 30-minute call. We'll ask about your business, your customers, and what you want the site to do. Logo, photos, and copy help if you have them — and if you don't, we'll work with what you've got.",
  },
] as const;

export const buildFeatures = [
  "Custom web design — 2 revision rounds included",
  "High-performance development, deployed on Vercel",
  "Up to 5 core pages — Home, About, Services, Contact, Privacy & Terms",
  "Mobile & speed optimization on every device",
  "Automated lead-capture contact form",
] as const;

export const careFeatures = [
  "Hosting & domain management",
  "Software updates & security monitoring",
  "Content edits when you need them",
  "Priority support",
] as const;
