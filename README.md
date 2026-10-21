# JPCS-TSU website

Website of the Junior Philippine Computer Society, Tarlac State University chapter (College of Computer Studies). F1 race-broadcast theme: "Lights out. Code on. CS Community."

Live: https://jpcs-tsu.vercel.app

## Stack

- Next.js 16.4 (App Router, Turbopack) with `cacheComponents` and `partialPrefetching` on
- React 19, TypeScript, Tailwind CSS v4
- GSAP (ScrollTrigger, SplitText) and Lenis for the homepage scroll effects
- No database, no env vars. All content is static in `lib/content.ts`.

## Getting started

Needs Node 20.9 or newer (built on Node 24).

```bash
npm install
npm run dev        # http://localhost:3000
```

Before pushing, run all three. There are no tests.

```bash
npx eslint components lib app
npx tsc --noEmit
npm run build
```

Check UI changes in the browser at 1440px and 390px wide, in both themes.

## Project structure

```
app/
  layout.tsx              fonts, theme script, metadata
  page.tsx                homepage: Splash, Hero, About, Stats, Officers, Events, Gallery, Merch, Join, FAQ
  events/page.tsx         all rounds
  events/[slug]/page.tsx  one event: summary, photos, prev/next round
  gallery/page.tsx        every event's photos
  merch/page.tsx          the full merch collection and size chart
  fonts/                  Formula1 Display (local WOFF2)
components/
  sections.tsx            homepage sections, EventRow, Merch helpers, Footer
  hero.tsx, splash.tsx    hero and the first-visit start-lights intro
  nav.tsx, subpage.tsx    nav, and the nav/footer shell for subpages
  motion.tsx              scroll effects (homepage only)
  photo-grid.tsx          photo grid with an in-page <dialog> viewer
  officer-card.tsx, officer-carousel.tsx
  ui.tsx                  Button, PhotoSlot, SectionHeader, icons, etc.
lib/content.ts            ALL site content
styles/globals.css        design tokens and utilities
public/
  photos/                 homepage and cover photos
  events/<slug>/          event photos, NN.webp
  officers/<slug>.webp    officer portraits
  merch/                  merch pubmats
  brand/                  logo
```

## Updating content

Pages only render data. Almost every change is an edit to `lib/content.ts`.

**Text** (About, FAQ, contact links): edit `about`, `faqs` or `contact`.

**Stats strip**: set each `value` in `stats`. `null` shows `000`, so put real numbers in or remove the entry.

**Officers** (new school year): edit `officerGroupList`.

- Each officer needs a `slug`, and a photo at `public/officers/<slug>.webp` (square, 640px).
- Race numbers (01, 02...) and the three-letter codes are generated. The adviser is always "TP".
- `breaks` ends a desktop row early after those indexes, which is how the rows form the pyramid.

**Events**: add an entry to `eventList` in date order. Round numbers (R1, R2...) come from the order, so don't type them.

- `cover` goes in `public/photos/`, the photos in `public/events/<slug>/NN.webp`.
- `square: true` for square images (pubmats), so they aren't cropped to 16:9.
- `link` adds a button on the event page.
- The page at `/events/<slug>` is created automatically.

**Next round** (the red card and the hero badge): edit `nextEvent`. With a `date` it shows a live countdown. Without one it shows "In progress". Its round number is the next one after `events`.

**Merch**: edit `merch.groups`. Set `merch.open: true` and `merch.form` to the order form to show a "Pre-order now" button instead of "Pre-orders closed".

**Homepage gallery (Paddock)**: edit `gallery`. The first photo is the large tile.

**Navigation**: `navLinks`. Each `id` must match a section `id` on the homepage.

## Images

Images are converted once with `sharp`, which is already installed with Next. Run from the repo root:

```bash
# event photo: 1600px wide WebP
node -e "require('sharp')('in.png').resize({width:1600}).webp({quality:78}).toFile('public/events/<slug>/01.webp')"

# officer portrait from a 2048px square pubmat: crop the person, leave out the name text
node -e "require('sharp')('pubmat.jpg').resize(2048,2048).extract({left:110,top:540,width:720,height:720}).resize(640,640).webp({quality:80}).toFile('public/officers/<slug>.webp')"

# merch pubmat: 1024px square
node -e "require('sharp')('pubmat.jpg').resize(1024,1024).webp({quality:72}).toFile('public/merch/<name>.webp')"
```

Name event photos by their number in the original folder (`01.webp`, `14.webp`...). Use real photos only.
