# Chèvre Noir FC

The official website for Chèvre Noir Football Club — squad, fixtures & results, and season leaderboard.

Built with Next.js 16 (App Router, Turbopack), Tailwind CSS v4, and [motion](https://motion.dev).

## Develop

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
```

## Where things live

- `app/` — routes: home, `/squad`, `/matches`, `/leaderboard`, 404, robots, sitemap
- `components/club/` — crest, navbar/footer pieces, player cards, match cards, leaderboard, podium
- `components/ui/` — shared primitives (button, section heading, scroll reveal)
- `lib/data.ts` — squad roster, match results and derived season stats (record, form, leaders)
- `lib/site.ts` — club identity (name, motto, socials)
- `public/crest.png` — the club crest

## Updating season data

Edit `lib/data.ts` — add players to `squad` or matches to `matches`. Team record, form guide,
and leaderboards are all derived automatically from that data.
