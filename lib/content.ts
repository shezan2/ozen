/**
 * All site copy lives here.
 *
 * Content rules this file is written under:
 *  - No invented statistics. The only figures used anywhere are the ones the
 *    client supplied: 85→75kg, 83→82kg over 1.5 months, month 1→5 at −5% body
 *    fat on two sessions a week, and Patrick Chong's 78→74kg.
 *  - No medical or therapeutic claims. Nutrition stays at general-guidance level.
 *  - Where a detail has not been confirmed, it is marked `[TODO: ...]` and
 *    rendered as such. Nothing is invented to fill a gap.
 */

/* ------------------------------------------------------------------ legal */

export const disclaimers = {
  /** Required on every before/after pair. */
  results:
    "Individual results vary. What happens for you depends on your starting point, how consistently you train and eat, and your own circumstances. Shared with the client's permission.",
  /** Sits next to the 5–10kg headline claim. */
  headlineQualifier:
    "5–10kg is a typical range for clients who stay consistent over a few months — not a guarantee, and not a timeline you can rush.",
  /** Pre-participation note. */
  preParticipation:
    "Training is not medical treatment. If you have an existing health condition, take regular medication, or have been away from exercise for a long stretch, get cleared by your doctor before you start.",
  /** Both calculators. */
  calculator:
    "This is a general estimate from a standard formula, not personalised advice and not a medical assessment. Treat the output as a starting point to talk through, not a prescription.",
  /** Nutrition guidance level. */
  nutrition:
    "Nutrition guidance here is general. It is not a meal plan for a medical condition, and it does not replace advice from a doctor or dietitian.",
} as const;

/* ------------------------------------------------------------------- hero */

export const hero = {
  label: "Singapore · personal coaching for dads",
  headline: ["Lose 5–10kg", "on three hours", "a week."],
  subhead:
    "You have a job, kids, and roughly no spare time. This is coaching built around that — not a programme that assumes your evenings are free.",
  qualifier: disclaimers.headlineQualifier,
  primaryCta: "Message RESET on WhatsApp",
  secondaryCta: "See how the three hours work",
  imageAlt:
    "Myo coaching a client through a barbell set in a Singapore gym [TODO: replace with a real photo of Myo coaching]",
} as const;

/* ---------------------------------------------------------------- problem */

export const problem = {
  label: "If this sounds familiar",
  heading: "You have already tried. That is the whole point.",
  intro:
    "Most dads who message me are not starting from zero motivation. They are starting from a pile of things that did not stick.",
  items: [
    {
      title: "The programme assumed you had evenings",
      body: "Five or six sessions a week is a fine plan for someone without a bedtime routine to run. It quietly fails everyone else.",
    },
    {
      title: "You paid for something that sold rather than explained",
      body: "Slimming salons, package upsells, a gym that pushed a bigger bundle every time you walked in. Nobody told you what was actually supposed to happen to your body, or why.",
    },
    {
      title: "Free workouts, no structure",
      body: "YouTube gives you sessions. It does not give you a sequence, a way to progress, or anyone noticing when you stop.",
    },
    {
      title: "The eating side fell apart on the road",
      body: "Client dinners, hawker lunches, a work trip. Any plan that only survives in your own kitchen is not a plan you can keep.",
    },
  ],
} as const;

/* ----------------------------------------------------------------- method */

export const method = {
  label: "The 3-hour method",
  heading: "Three hours a week, and the rest of it built around your life",
  intro:
    "Three hours is the whole budget. Everything below is designed to fit inside it, or to happen in the gaps you already have — the commute, the food court queue, the hotel breakfast buffet.",
  pillars: [
    {
      number: "01",
      title: "The roadmap comes first",
      body: "Before anything gets sold, you get the picture: where you are now, what is realistically ahead, and roughly how long it takes. If the answer is that you need something other than a trainer, you get told that too.",
      detail:
        "[TODO: confirm what the first session or consultation actually covers — format, length, and whether it is paid or free]",
    },
    {
      number: "02",
      title: "Three hours of training",
      body: "Enough resistance work to hold onto muscle while the weight comes down, arranged so that missing one session does not undo the week.",
      detail:
        "[TODO: confirm the weekly structure — number of sessions, session length, and the training split]",
    },
    {
      number: "03",
      title: "Nutrition explained, not prescribed",
      body: "General guidance on how to eat around a working week, so you understand the mechanism instead of following a sheet you will abandon by week three. No supplements to buy.",
      detail: disclaimers.nutrition,
    },
    {
      number: "04",
      title: "Guidance for the way you actually eat",
      body: "Send the itinerary or the restaurant, get back what to order. This is the part clients use most and the part nobody else does.",
      detail: null,
    },
  ],
  suitsHeading: "Who this suits",
  suits: [
    "Working fathers in their 30s and 40s with 3 hours a week and no more",
    "Anyone who has started and quit at least once before",
    "Dads who travel for work or eat out most days",
    "People who want the mechanism explained, not a plan handed over",
  ],
  notSuitsHeading: "Who it does not",
  notSuits: [
    "Anyone looking for a crash diet or a fixed number by a fixed date",
    "Stage or competition prep",
    "Anyone needing clinical or rehabilitation care — that is a doctor's job, not a coach's",
  ],
} as const;

/* --------------------------------------------------- travel and eating out */

export const travel = {
  label: "The part nobody else does",
  heading: "Send the itinerary. Get back what to order.",
  lede: "One client sent his travel itinerary before a work trip and got back guidance restaurant by restaurant — what to order at each one, so the trip did not cost him the month.",
  body: [
    "If you are a working dad in Singapore, your eating is not a kitchen problem. It is a client-dinner problem, a hawker-centre problem, a hotel-buffet problem. Most coaching gives you a meal plan that only works on the days you cook.",
    "This works the other way round. You send where you are going. You get back how to handle it — which dishes travel well against your goal, what to leave, and what genuinely does not matter.",
  ],
  examples: [
    { context: "Hawker lunch", detail: "[TODO: add Myo's actual go-to guidance for a hawker lunch]" },
    { context: "Client dinner", detail: "[TODO: add Myo's actual go-to guidance for a client dinner]" },
    { context: "Hotel breakfast on a work trip", detail: "[TODO: add Myo's actual go-to guidance for a hotel breakfast]" },
  ],
  note: disclaimers.nutrition,
  imageAlt:
    "A hawker centre lunch spread photographed from above [TODO: replace with a real photo used with permission]",
} as const;

/* -------------------------------------------------------- transformations */

export type Transformation = {
  id: string;
  headline: string;
  metric: string;
  metricLabel: string;
  period: string;
  summary: string;
  why: string;
  beforeSrc: string;
  afterSrc: string;
  beforeAlt: string;
  afterAlt: string;
  featured: boolean;
};

/**
 * Only the figures supplied by the client. No client counts, no success rates,
 * no averages. Photos are placeholders until real assets and per-client consent
 * are confirmed.
 */
export const transformations: Transformation[] = [
  {
    id: "recomposition",
    headline: "83kg to 82kg",
    metric: "1kg",
    metricLabel: "on the scale. Everything else changed.",
    period: "1.5 months",
    summary: "Same weight. More muscle, less fat.",
    why: "This is the one to look at if you have failed at dieting before. The scale moved by a single kilogram in six weeks — and the body in the photograph is visibly different. Weight is a slow, noisy signal. If you only judge progress by it, you quit at exactly the point things are working.",
    beforeSrc: "/images/transformations/recomposition-before.jpg",
    afterSrc: "/images/transformations/recomposition-after.jpg",
    beforeAlt:
      "Client photographed side-on at the start of coaching, weighing 83kg [TODO: replace with the real before photo]",
    afterAlt:
      "The same client side-on 1.5 months later at 82kg, visibly leaner through the midsection with more shape through the shoulders and arms [TODO: replace with the real after photo]",
    featured: true,
  },
  {
    id: "ten-kilos",
    headline: "85kg to 75kg",
    metric: "10kg",
    metricLabel: "down",
    period: "[TODO: confirm the time period for this client]",
    summary: "The full 10kg, off and stayed off.",
    why: "The number at the top of the Instagram bio, from an actual client rather than a claim. What it took was consistency over months, not a hard push over weeks.",
    beforeSrc: "/images/transformations/ten-kilos-before.jpg",
    afterSrc: "/images/transformations/ten-kilos-after.jpg",
    beforeAlt:
      "Client photographed front-on at 85kg before starting coaching [TODO: replace with the real before photo]",
    afterAlt:
      "The same client front-on at 75kg with visibly reduced body fat around the waist and chest [TODO: replace with the real after photo]",
    featured: false,
  },
  {
    id: "five-percent",
    headline: "Month 1 to month 5",
    metric: "5%",
    metricLabel: "body fat down",
    period: "5 months, two gym sessions a week",
    summary: "Two sessions a week. Five months. 5% body fat gone.",
    why: "Proof that the training budget really is small. Two sessions a week is under the three hours, sustained long enough to matter.",
    beforeSrc: "/images/transformations/five-percent-before.jpg",
    afterSrc: "/images/transformations/five-percent-after.jpg",
    beforeAlt:
      "Client photographed from the back in month one of coaching [TODO: replace with the real before photo]",
    afterAlt:
      "The same client from the back in month five, with more definition across the shoulders and back [TODO: replace with the real after photo]",
    featured: false,
  },
];

/* ------------------------------------------------------------ testimonial */

/**
 * Patrick Chong gave a LinkedIn recommendation in July 2026. The themes below
 * were supplied; his verbatim wording was not. Nothing here is presented as a
 * direct quote until his actual words are pasted in — paraphrasing a
 * recommendation into marketing voice is exactly what loses its credibility.
 */
export const testimonial = {
  name: "Patrick Chong",
  role: "Senior Designer",
  source: "LinkedIn recommendation, July 2026",
  result: "78kg → 74kg",
  quote:
    "[TODO: paste Patrick Chong's LinkedIn recommendation here verbatim, with his permission confirmed in writing. Do not paraphrase it — the plainness of his own wording is why it works.]",
  covered: [
    "Had already spent money on slimming salons, YouTube workouts, and gyms that pushed packages",
    "Myo explained the mechanism and gave nutrition guidance without selling anything",
    "A roadmap was laid out at the start rather than sold session by session",
    "78kg down to 74kg",
    "Posture, endurance and strength all improved",
    "Sent his travel itinerary and got back restaurant-by-restaurant guidance on what to order",
  ],
  consentNote:
    "[TODO: confirm written permission from Patrick Chong to use his name, role and words on this site]",
} as const;

/* -------------------------------------------------------------------- faq */

export const faqs = [
  {
    q: "Three hours a week. What does that actually mean?",
    a: "It is the training budget, and it is the whole budget. The sessions are arranged so the week still works if one of them gets eaten by a deadline or a sick kid. The exact structure is set with you at the start. [TODO: confirm the standard weekly structure so this answer can be specific]",
  },
  {
    q: "I have started and quit before. Why would this be different?",
    a: "Because most of what you tried assumed time you do not have. The difference here is not intensity, it is fit — a plan sized to three hours, with the eating side built for hawker lunches and client dinners rather than for a kitchen you are rarely in.",
  },
  {
    q: "How fast will the weight come off?",
    a: "At a pace you can hold: roughly half a percent to one percent of your bodyweight a week. For most people that puts 5–10kg somewhere in the range of a few months, depending entirely on where you start and how consistent you are. Anyone promising you a fixed number by a fixed date is guessing.",
  },
  {
    q: "I travel constantly and eat out most days.",
    a: "Then you are the intended client. Send the itinerary or the restaurant and you get back what to order. It is the part clients use most, and it is why the eating side survives a work trip.",
  },
  {
    q: "Do I need to be a member of a particular gym?",
    a: "Coaching runs in person in central Singapore and online, so it can work around whichever gym you can actually get to. [TODO: confirm the partner gym, its location, and what the online option includes]",
  },
  {
    q: "I am in my forties and my back is not what it was.",
    a: "Get cleared by your doctor first — that is a medical question and it stays with them. Once you are cleared, training is programmed around what you have been cleared for. Coaching does not treat, rehabilitate or diagnose anything.",
  },
  {
    q: "Will I have to buy supplements or a meal plan?",
    a: "No. Nutrition guidance is general and explained rather than sold. There is no product attached to it.",
  },
  {
    q: "How do I start?",
    a: 'Message the word RESET on WhatsApp. It is a short conversation about where you are now and what three hours a week could realistically do — not a sales call.',
  },
] as const;

/* ------------------------------------------------------------- page meta */

export const pageMeta = {
  home: {
    title: "Personal Trainer for Busy Dads in Singapore | Myo Fitness Solutions",
    description:
      "Coaching for time-poor Singapore dads: lose 5–10kg on three hours of training a week, with eating guidance built for hawker lunches, client dinners and work trips.",
  },
  method: {
    title: "The 3-Hour Method for Working Dads",
    description:
      "What three hours of training a week actually looks like, why it is enough to lose fat and hold muscle, what is included, and who the method suits.",
  },
  transformations: {
    title: "Client Transformations — Real Numbers",
    description:
      "Real client results with the actual figures: 85kg to 75kg, a 1.5-month body recomposition at the same scale weight, and 5% body fat lost on two sessions a week.",
  },
  about: {
    title: "About Myo — Coaching Built for Dads",
    description:
      "The coach behind Myo Fitness Solutions: why the method is built for working fathers, where the name comes from, and the certifications behind the coaching.",
  },
  pricing: {
    title: "Coaching Packages and Prices",
    description:
      "In-person and online personal training packages for working fathers in Singapore, with what each block includes and how to start.",
  },
  contact: {
    title: "Book a Session or Send an Enquiry",
    description:
      "Message RESET on WhatsApp, book a call, or send an enquiry with where you are now and what you have already tried. Coaching for busy dads in Singapore.",
  },
  privacy: {
    title: "Privacy Policy",
    description:
      "How Myo Fitness Solutions handles personal data collected through the enquiry form and on-site calculators under Singapore's PDPA.",
  },
  notFound: {
    title: "Page Not Found",
    description: "That page does not exist. Head back to the home page or message RESET on WhatsApp.",
  },
} as const;
