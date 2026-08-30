# Myo Fitness Solutions

Marketing site for a Singapore personal training brand that coaches time-poor
working fathers: **lose 5–10kg on three hours a week**.

Next.js 16 (App Router, Turbopack) · TypeScript · Tailwind CSS v4 · Framer Motion
· fully static · deploys to Vercel.

```bash
npm install
npm run dev          # http://localhost:3000
npm run build        # production build
npm run lint
npm run placeholders # regenerate the placeholder photography
```

---

## ⚠️ Before this goes live

Two things must happen before launch, and neither is optional.

1. **Replace every `[SAMPLE]` value in `lib/site-config.ts`.** None of them came
   from the client. They exist so the build runs end to end, and they are
   currently live in the footer, the JSON-LD and the pricing page.
2. **Write the privacy policy.** `/privacy-policy` is a scaffold, not a policy.
   The site collects personal and health-adjacent data under Singapore's PDPA.

Both lists are below, in full.

---

## Outstanding TODOs

### 1. Sample business details — `lib/site-config.ts`

Every value here is invented scaffolding. Swap each one, then delete its
`[SAMPLE]` comment.

| Field | Current sample value |
|---|---|
| `domain` / `url` | `myofitnesssolutions.sg` |
| `coach.name` | Myo Tan |
| `coach.yearsCoaching` | 6 |
| `coach.certifications` | ACE Certified Personal Trainer; Precision Nutrition Level 1 |
| `contact.whatsappNumber` / `whatsappDisplay` | +65 8000 0000 |
| `contact.email` | hello@myofitnesssolutions.sg |
| `contact.bookingUrl` | https://cal.com/myofitness |
| `location.region` | Central Singapore |
| `location.trainingModel` | Hybrid — in person in central Singapore, plus online |
| `location.onlineCoaching` | `true` |
| `packages[].price` | Starter S$880 / 8 sessions · Core S$1,260 / 12 sessions · Online S$320 per month |
| `schema.priceRange` | S$320–S$1,260 (derived from the sample prices) |

Nothing in the copy argues from these numbers — no "six years of experience"
headline, no price-anchored pitch. They fill fields only.

### 2. Consent — must be confirmed per person

- **Every transformation photograph and figure.** Written consent per client,
  for the photo *and* the numbers. `app/transformations/page.tsx`
- **Patrick Chong.** Written permission to use his name, role and words.
  `lib/content.ts` → `testimonial.consentNote`

### 3. Patrick Chong's testimonial — `lib/content.ts`

`testimonial.quote` is a `[TODO]` placeholder and renders as one on the home
page. Only the themes of his recommendation were supplied, not his wording, and
a paraphrase written in marketing voice is exactly what destroys a testimonial's
credibility. **Paste his LinkedIn recommendation verbatim.** The bullet list
beside it (`testimonial.covered`) is a factual summary of what the
recommendation covers and is safe to keep or drop once the real quote is in.

### 4. Content gaps

| Where | What is missing |
|---|---|
| `lib/content.ts` `method.pillars[0]` | What the first session or consultation covers — format, length, paid or free |
| `lib/content.ts` `method.pillars[1]` | The weekly structure — session count, session length, training split |
| `lib/content.ts` `travel.examples` | Myo's actual go-to guidance for a hawker lunch, a client dinner, a hotel breakfast |
| `lib/content.ts` `transformations` → `ten-kilos` | The time period for the 85kg → 75kg client |
| `lib/content.ts` `faqs` | The "three hours a week" answer needs the real weekly structure; the gym answer needs the partner gym and what online covers |
| `app/about/page.tsx` | Myo's own story, in his words — the 50-hour work week account is currently a paraphrase of his own Instagram post |
| `app/pricing/page.tsx` | Full inclusion list per package: session length, block duration, check-in cadence, what online covers, whether prices include GST |
| `app/contact/page.tsx` | The partner gym and its address, session availability, how far ahead to book |

### 5. Photography

Every image is a generated placeholder. Drop the real photograph in at the same
path and it just works — no code change needed. Alt text already describes the
intended photograph, so **check each alt still matches** and strip the `[TODO]`
from it.

```
public/images/hero-coaching.jpg          Hero — Myo coaching a client (LCP image)
public/images/method-hero.jpg            Method page — the training space
public/images/method-session.jpg         Home — a working set
public/images/method-eating-out.jpg      Method page — eating out
public/images/travel-hawker-lunch.jpg    Home — hawker lunch
public/images/about-myo.jpg              About — portrait
public/images/about-gym.jpg              About — the gym floor
public/images/pricing-session.jpg        Pricing — a session in progress
public/images/contact-session.jpg        Contact — first session
public/images/transformations/recomposition-{before,after}.jpg   83kg → 82kg
public/images/transformations/ten-kilos-{before,after}.jpg       85kg → 75kg
public/images/transformations/five-percent-{before,after}.jpg    month 1 → 5
```

Regenerate the placeholders with `npm run placeholders`
(`scripts/generate-placeholders.mjs`).

### 6. Privacy policy — `/privacy-policy`

A scaffold with nine headings and a prompt under each, plus a visible warning
banner. **Deliberately not drafted here** — generated legal text that reads as
finished is worse than an obvious gap. The operator or their lawyer writes it.

### 7. Enquiry form endpoint

Set `NEXT_PUBLIC_FORM_ENDPOINT` (see `.env.example`) to any endpoint that
accepts a JSON POST. Until it is set, submitting the form opens WhatsApp with
every field prefilled rather than silently discarding the enquiry.

---

## Content rules this site is built under

These are enforced in the code, not just in the copy. Breaking one is a
regression.

- **No invented statistics.** The only figures anywhere are the client's own:
  85→75kg, 83→82kg over 1.5 months, month 1→5 at −5% body fat on two sessions a
  week, and Patrick Chong's 78→74kg. No client counts, no success rates, no
  averages.
- **The results disclaimer is a required prop.** `components/ui/BeforeAfter.tsx`
  types `disclaimer` as non-optional — a page physically cannot render a
  before/after pair without one.
- **The 5–10kg claim is qualified wherever it appears** (`disclaimers.headlineQualifier`).
- **No medical or therapeutic claims.** Nothing treats, diagnoses or
  rehabilitates. Nutrition copy stays at general-guidance level.
- **Pre-participation note** (`disclaimers.preParticipation`) appears in the
  footer, on the enquiry form, and beside the method claims.
- **Both calculators carry an estimate disclaimer** and neither is presented as
  advice.

---

## Where things live

```
app/
  layout.tsx              root layout, font, LocalBusiness JSON-LD, header/footer/FAB
  page.tsx                home
  the-3-hour-method/      the core service page (Service JSON-LD)
  transformations/        client results
  about/                  the coach (Person JSON-LD)
  pricing/                packages
  contact/                booking, WhatsApp, enquiry form
  privacy-policy/         PDPA scaffold
  opengraph-image.tsx     per-route OG cards (one per page, all unique)
  sitemap.ts robots.ts    production SEO files
  globals.css             design tokens and utilities

lib/
  site-config.ts          ALL business details, contact, social, schema values
  content.ts              ALL copy, plus the disclaimer strings
  calculators.ts          timeline estimator + Mifflin–St Jeor, pure functions
  og.tsx                  shared Open Graph card

components/
  site/                   header, footer, WhatsApp FAB, reveal, JSON-LD, motion
  sections/               home and inner-page sections
  tools/                  TimelineEstimator, MacroCalculator
  forms/                  EnquiryForm
  ui/                     Button, Section, SectionHeading, BeforeAfter, Faq
```

### Signature features

- **Timeline estimator** (`/#timeline`) — returns an honest range at 0.5–1% of
  bodyweight a week, capped by how many sessions are actually available. A goal
  at or near current weight routes to the body-recomposition story instead of a
  number; a very large goal routes to "talk to your doctor first".
- **Calorie and macro calculator** (`/the-3-hour-method#macros`) — Mifflin–St
  Jeor, with a conservative calorie floor and a visible estimate disclaimer.
- **Travel and eat-out guidance** — a full section on the home page and the
  method page, not a bullet. It is the strongest differentiator on the account.
- **Before/after component** — paired layout, required disclaimer prop.
- **WhatsApp click-to-chat** — persistent floating CTA mirroring the Instagram
  "DM RESET to start" call to action. The enquiry form also falls back to it.

---

## Design and motion

The visual language is taken from the Instagram account rather than from a
generic marketing template: hard black label blocks with white type slapped over
photographs, a bright lime that only ever marks a result, amber as the secondary
highlight. Nothing is rounded — the source material is flat-edged and
high-contrast, so the site is too.

- **Palette** (`app/globals.css`): near-black ink, white / off-white surfaces,
  `--lime` for results only, `--gold` secondary. Lime is a light colour, so it is
  used as a *background* under ink text or at display sizes on ink, never as
  small text on white. `--lime-deep` (5.5:1 on white) covers small lime text.
- **One typeface**, Archivo variable: 900 for display, 400 for body. The scale
  contrast is the point — 10px tracked labels against 100px numerals, the way a
  caption card sets a tiny word beside a huge one.
- **`.slab` / `.slab-lime` / `.slab-white`** are the caption-card blocks. The
  hero headline is built from them, and the before/after weight labels reuse them
  so the site and his stories read as the same thing.
- **Section rhythm varies on purpose** (`Section` has `tight` / `base` / `tall`).
  Full-bleed rows — the transformation pair, the travel photograph, the lime
  closing slab — break the container rather than sitting in it.

### Motion

All scroll animation runs through **one** client component,
`components/site/ScrollAnimator.tsx`, mounted once in the layout. Sections stay
pure server components that mark themselves with `data-animate`; there is no
client boundary per animated block. That refactor alone took total blocking time
from 290ms to 120ms.

| Effect | How |
|---|---|
| Hero headline line wipe | CSS, armed by a two-line inline script so it never waits on hydration |
| Scroll reveals (whole blocks, directional) | `ScrollAnimator` + CSS transitions |
| Heading line wipes below the fold | `LineReveal` emits the markup, `ScrollAnimator` arms it |
| Count-ups on the real figures | `CountUp` renders the true number server-side; the animation only rewrites the node's text |
| Results ticker | CSS marquee, pauses on hover |
| Hero photograph drift | CSS keyframes, layer-promoted |
| FAQ disclosure | Native `<details>` + CSS |
| Mobile menu, WhatsApp CTA | Framer Motion via `LazyMotion` with an async feature bundle |

Everything above stops under `prefers-reduced-motion`.

Three rules hold across all of it:

- **Whole blocks and whole lines, never per-word or per-character spans.**
  Splitting copy into hidden spans keeps it out of the accessible tree and hands
  crawlers a page of empty elements.
- **The hidden state is applied from JavaScript, and only below the fold.** The
  server HTML is always fully visible, so copy survives with JS off and nothing
  flashes.
- **Real figures render server-side.** The count-up reads the true number off the
  node before animating it.

## Verified on this build

Lighthouse, mobile:

| Route | Perf | A11y | Best practices | SEO |
|---|---|---|---|---|
| `/` | 93 | 100 | 100 | 100 |
| `/the-3-hour-method` | 98 | 100 | 100 | 100 |
| `/transformations` | 93 | 100 | 100 | 100 |
| `/about` | 94 | 100 | 100 | 100 |
| `/pricing` | 98 | 100 | 100 | 100 |
| `/contact` | 98 | 100 | 100 | 100 |
| `/privacy-policy` | 96 | 100 | 100 | 100 |

Also checked: `npm run build` and `eslint` clean; one `h1` per route; no empty
`alt`; unique title, description and canonical per route; every route's core copy
present in the server HTML (`curl`-verified); the page renders and reads fully
with JavaScript disabled; tested at 375px, 768px and 1440px.

> The largest-contentful-paint figure is currently held up by the flat
> placeholder photography — Chrome discounts low-entropy images as LCP
> candidates, so the metric lands on hero text plus the web-font swap. Re-measure
> once real photographs are in.
