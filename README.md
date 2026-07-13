# ozen — agency website

Dark, premium one-page site for the ozen web agency, plus a custom booking calendar at `/book`.

Built with Next.js 16 (App Router, Turbopack), Tailwind CSS v4, [motion](https://motion.dev), [anime.js](https://animejs.com), and components adapted from [ReactBits](https://reactbits.dev) and [KokonutUI](https://kokonutui.com).

## Develop

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
```

## Before going live

- **Lead capture**: bookings and contact submissions POST to `NEXT_PUBLIC_FORM_ENDPOINT` (see `.env.example`). Create a [Formspree](https://formspree.io) form and set the env var in Vercel — until then the site runs in demo mode (submissions simulate success).
- **Contact details**: replace the placeholder email/URL in `lib/site.ts`.

## Where things live

- `app/` — routes: home, `/book`, `/legal`, 404, robots, sitemap
- `components/home/` — hero, services, work, pricing, FAQ, final CTA
- `components/book/` — calendar, time slots, form, success (state machine in `BookingFlow.tsx`)
- `components/brand/OzenLogo.tsx` — the SVG mark with anime.js stroke-draw
- `lib/content.ts` — all copy: services, pricing features, FAQs, portfolio entries
- `public/work/` — portfolio screenshots
