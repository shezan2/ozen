export const site = {
  name: "ozen",
  brand: "ozen",
  tagline: "Websites that mean business",
  title: "ozen — Premium websites for growing businesses",
  description:
    "ozen is a web design studio that builds premium, high-performance websites for businesses stuck with a bad website — or none at all. Custom design, modern development, one flat price.",
  url: "https://ozen.agency",
  // Placeholder contact details — replace with real ones before going live.
  email: "hello@ozen.agency",
  formEndpoint: process.env.NEXT_PUBLIC_FORM_ENDPOINT ?? "",
} as const;

export const pricing = {
  build: 2000,
  care: 199,
} as const;
