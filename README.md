# JPCS-TSU website

Website of the Junior Philippine Computer Society, Tarlac State University chapter (College of Computer Studies). F1 race-broadcast theme: "Lights out. Code on. CS Community."

Live: https://jpcs-tsu.vercel.app

## Stack

- Next.js 16.4 (App Router, Turbopack) with `cacheComponents` and `partialPrefetching` on
- React 19, TypeScript, Tailwind CSS v4
- GSAP (ScrollTrigger, SplitText) and Lenis for the homepage scroll effects
- Supabase (Postgres, Auth, Storage) for the content officers edit in `/admin`
- About, FAQ and the nav links are still static in `lib/content.ts`

## Getting started

Needs Node 20.9 or newer (built on Node 24).

```bash
npm install
cp .env.example .env.local   # then fill it in, see below
npm run dev                  # http://localhost:3000
```

### Environment variables

Set these in `.env.local` for development and in Vercel → Settings → Environment Variables (Production and Preview).

| Variable | Where to get it |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → API Keys |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | same page, the publishable key |
| `SUPABASE_SECRET_KEY` | same page, a secret key. Server only, it bypasses all access rules. Never prefix it with `NEXT_PUBLIC_` |
| `CRON_SECRET` | any long random string. Vercel sends it to the daily job |
| `NEXT_PUBLIC_SITE_URL` | `https://jpcs-tsu.vercel.app` in Vercel, `http://localhost:3000` locally. Used to build invite links |

The build reads from the database, so it fails without these.

Preview deployments and your local dev server use the **same database as the live site** unless you give them a different Supabase project. Anything you save while testing shows on the live site.

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
  admin/                  the admin dashboard, one folder per tab (page + actions.ts)
  login/, forgot-password/, auth/confirm/   sign in, reset request, set password from a link
  api/cron/daily/         daily keep-awake job, Sunday backup and photo cleanup
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
  former-officers.tsx     "Past seasons" under the officers, hidden until a past year has officers
  admin/                  admin form pieces: fields, date picker, image input, sidebar
lib/
  content.ts              About, FAQ, nav links, merch sizes (not editable in the admin)
  data.ts                 cached reads for the public pages
  auth.ts                 requireStaff / requireAdmin, called at the top of every admin page and action
  media.ts                photo upload: resize to WebP, store in Supabase
  supabase/               clients: public (no login), server (signed-in user), admin (secret key), browser
supabase/migrations/      database tables, access rules and storage buckets
proxy.ts                  sends signed-out visitors from /admin to /login
styles/globals.css        design tokens and utilities
public/
  photos/                 homepage and cover photos
  events/<slug>/          event photos, NN.webp
  officers/<slug>.webp    officer portraits
  merch/                  merch pubmats
  brand/                  logo
```

## Updating content (admin)

Officers edit the site at **/admin**. Changes show on the live site right away, no redeploy.

**Accounts** are invite-only. There are two roles:

- **Editor**: every content tab.
- **Admin**: also Team and Audit log.

To add someone, an admin opens **Team**, enters their email and role, presses **Create invite link**, and sends them the link (Messenger is fine). It lets them set a password and works for as long as the link expiry set in Supabase (24 hours, see setup). **Forgot password** on the login page sends an email, but Supabase's built-in email only allows a few per hour. The quicker way is an admin pressing **Password reset link** next to their name on Team and sending that.

The site always keeps at least one admin. You can't remove or demote the last one.

**Tabs:**

- **Events**: add, edit and delete rounds, upload photos, mark an event as done. No date shows "TBA". Round numbers (R1, R2...) follow the date order. The web address (`/events/<slug>`) is set when the event is created and can't change after.
- **Officers**: one lineup per school year. Only the current year shows in Driver lineup. For a new year, press **Start school year** (it can copy the groups from the year you're viewing), add the officers, then **Make this the current year**. Older years show under "Past seasons" on the homepage.
- **Next round**: the red card and the hero badge. A date and time shows a countdown, no date shows "In progress".
- **Paddock**: the homepage photo grid. The first photo is the large tile.
- **Merch**: open or close pre-orders, the order form link, and the items.
- **Stats and contact**: the numbers strip and the footer contact links.
- **Audit log** (admin): who changed what, with the before and after.

Every item shows who edited it last.

**Photos** can come straight from a phone. The browser shrinks them before upload, and the server converts them to WebP at the right size for each kind. Unused photos are cleaned up automatically (see below).

**Still in code**: About, FAQ, nav links and merch sizes are in `lib/content.ts`. Edit them there and push.

## Supabase setup

Only needed for a new Supabase project. The current one is already set up.

1. Create the project, then run the files in `supabase/migrations/` **in order** in the dashboard's SQL Editor. They create the tables, the access rules and two storage buckets: `site-media` (public photos) and `backups` (private).
2. **Authentication → Sign In / Providers**: turn off "Allow new users to sign up". Under Email, set the link expiry to `86400` (24 hours).
3. **Authentication → URL Configuration**: Site URL `https://jpcs-tsu.vercel.app`. Add `https://jpcs-tsu.vercel.app/auth/confirm` and `http://localhost:3000/auth/confirm` to Redirect URLs.
4. Create the first admin: **Authentication → Users → Add user** with a password, then in the SQL Editor:

   ```sql
   insert into public.profiles (id, email, role)
   select id, email, 'admin' from auth.users where email = 'you@example.com';
   ```

5. Copy the keys into the environment variables above. Content starts empty, so add it through `/admin`.

New database changes go in a new numbered file (`0004_...sql`). Run it in the SQL Editor too, since nothing runs migrations automatically.

## Daily job and backups

Vercel calls `/api/cron/daily` once a day around 3 AM Manila time (`vercel.json`). It only runs on the production deployment.

- **Every day** it makes one small database query. Free Supabase projects pause after about a week without activity, and this keeps it awake. If the project ever pauses, restore it from the Supabase dashboard.
- **On Sundays** it saves every table to `backups/<date>.json` in Supabase Storage and keeps the last 8 weeks. It also deletes uploaded photos that nothing uses anymore and that are over a day old.

Backups hold the **table data only, not the photos**. To restore, download the file from Storage → backups and insert the rows back with SQL. There's no one-click restore.

To run it by hand (`?weekly=1` forces the Sunday part):

```bash
curl -H "Authorization: Bearer $CRON_SECRET" "https://jpcs-tsu.vercel.app/api/cron/daily?weekly=1"
```

## Images in the repo

Photos added through the admin are resized automatically. These commands are only for images kept in `public/` (the photos from before the admin, the logo). They use `sharp`, which is already installed with Next. Run from the repo root:

```bash
# event photo: 1600px wide WebP
node -e "require('sharp')('in.png').resize({width:1600}).webp({quality:78}).toFile('public/events/<slug>/01.webp')"

# officer portrait from a 2048px square pubmat: crop the person, leave out the name text
node -e "require('sharp')('pubmat.jpg').resize(2048,2048).extract({left:110,top:540,width:720,height:720}).resize(640,640).webp({quality:80}).toFile('public/officers/<slug>.webp')"

# merch pubmat: 1024px square
node -e "require('sharp')('pubmat.jpg').resize(1024,1024).webp({quality:72}).toFile('public/merch/<name>.webp')"
```

Name event photos by their number in the original folder (`01.webp`, `14.webp`...). Use real photos only.
