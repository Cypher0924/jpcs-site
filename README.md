# JPCS-TSU Website

The official website of the Junior Philippine Computer Society, Tarlac State University chapter (College of Computer Studies), with a content admin for chapter officers.

**Live site:** https://jpcs-tsu.vercel.app

## Features

- Homepage with an F1 race-broadcast theme: officer lineup, race calendar, photo gallery, merch and FAQ
- Event pages with photo galleries, plus a full gallery and merch page
- A "Next round" countdown that follows the events calendar automatically
- Light and dark themes
- `/admin` dashboard where invited officers manage events, officers, photos, merch, stats and contact links
- Roles (admin and editor), invite links, password reset and an audit log of every change
- Photo uploads resized to WebP automatically
- Daily keep-alive job and weekly database backups

## Tech stack

| | |
| --- | --- |
| Framework | [Next.js 16](https://nextjs.org) (App Router, Cache Components) |
| UI | React 19, TypeScript, Tailwind CSS 4 |
| Motion | GSAP and Lenis (homepage only) |
| Backend | [Supabase](https://supabase.com): Postgres, Auth, Storage |
| Validation | Zod |
| Images | sharp |
| Hosting | Vercel |

## Getting started

### Prerequisites

- Node.js 20.9 or newer
- A Supabase project (see [Database](#database))

### Installation

```bash
git clone https://github.com/Cypher0924/jpcs-site.git
cd jpcs-site
npm install
cp .env.example .env.local
```

### Environment variables

| Variable | Description |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL (Project Settings → API Keys) |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase publishable key |
| `SUPABASE_SECRET_KEY` | Supabase secret key. Server only, bypasses row-level security |
| `CRON_SECRET` | Random string that authorizes the daily cron job |
| `NEXT_PUBLIC_SITE_URL` | Base URL used in invite links, e.g. `http://localhost:3000` |

The build reads from the database, so it needs these variables to succeed.

> **Note:** local development and Vercel preview deployments use the production database unless you point them at a separate Supabase project.

### Running locally

```bash
npm run dev
```

Open http://localhost:3000. The admin is at http://localhost:3000/admin.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npx eslint components lib app` | Lint |
| `npx tsc --noEmit` | Type check |

There is no test suite. Before opening a pull request, run lint, the type check and a build, then check your changes in the browser at desktop and phone widths in both themes.

## Project structure

```
app/
  page.tsx               Homepage
  events/                Race calendar and event pages
  gallery/, merch/       Gallery and merch pages
  admin/                 Admin dashboard (one folder per section)
  login/, forgot-password/, auth/confirm/
  api/cron/daily/        Keep-alive, backups and photo cleanup
components/              Site components (admin/ holds the dashboard UI)
lib/
  data.ts                Cached data access for public pages
  rounds.ts              Next-round and event-status logic
  content.ts             Static copy: About, FAQ, nav links, merch sizes
  auth.ts, admin.ts      Admin auth guards and form helpers
  media.ts               Image upload and resizing
  supabase/              Supabase clients
supabase/migrations/     Database schema, policies and storage buckets
styles/globals.css       Design tokens and utilities
public/                  Static images and brand assets
proxy.ts                 Redirects signed-out users away from /admin
```

## Database

### Setting up a new project

1. Create a Supabase project and run the files in `supabase/migrations/` in order in the SQL Editor.
2. In **Authentication → Sign In / Providers**, disable new user sign-ups and set the email link expiry to `86400` seconds.
3. In **Authentication → URL Configuration**, set the Site URL to the production URL and add `<site-url>/auth/confirm` and `http://localhost:3000/auth/confirm` to the redirect URLs.
4. Create the first admin. Add a user in **Authentication → Users**, then run:

   ```sql
   insert into public.profiles (id, email, role)
   select id, email, 'admin' from auth.users where email = 'you@example.com';
   ```

5. Add the project keys to your environment variables.

### Migrations

There is no migration runner. Add schema changes as a new numbered file in `supabase/migrations/` and run it in the SQL Editor. The current schema is up to `0007_drop_next_event.sql`.

## Admin

Officers sign in at `/admin`. Accounts are invite-only:

- **Editors** manage site content.
- **Admins** can also invite members, change roles and view the audit log.

Admins invite people from **Team** by copying an invite link. They can also generate password reset links there.

| Section | What it controls |
| --- | --- |
| Events | Every round: start and end time, status (scheduled, postponed or cancelled), cover, summary and photos |
| Officers | Officer lineups per school year. Older years appear under "Past seasons" |
| Paddock | The homepage photo grid |
| Merch | Pre-order status, order form link and items |
| Stats and contact | The stats strip and the contact links |
| Team, Audit log | Members and change history (admins only) |

The **Next round** card isn't edited directly:
- The site picks the earliest event that hasn't ended. It shows a countdown, then "In progress", then moves on to the next event when that one ends.
- A postponed event keeps the spot with a "Postponed" label.
- Cancelled events are hidden and don't get a round number.
- With nothing upcoming, the card reads "To be announced".

About, FAQ, nav links and merch sizes are static and live in `lib/content.ts`.

## Deployment

The site deploys to Vercel from `main`. Set the environment variables above in the Vercel project for Production and Preview.

`vercel.json` schedules a daily cron at `/api/cron/daily`. It runs on production deployments only:

- **Daily:** a small query that keeps the free Supabase project from pausing.
- **Sundays:**
  - exports every table to the private `backups` storage bucket and keeps the last 8 weeks
  - deletes uploaded photos that no longer appear in any table

Backups contain table data only, not images. To trigger the job manually:

```bash
curl -H "Authorization: Bearer $CRON_SECRET" "https://jpcs-tsu.vercel.app/api/cron/daily?weekly=1"
```

## Images

Images uploaded through the admin are resized automatically. Images committed to `public/` are prepared by hand with sharp, for example:

```bash
node -e "require('sharp')('input.jpg').resize({ width: 1600 }).webp({ quality: 78 }).toFile('public/photos/output.webp')"
```

Use real photos only.
