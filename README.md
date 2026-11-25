# SmartAgri

SmartAgri is a responsive farm management app for crop records, daily field activities, local weather and practical agricultural guidance.

## Features

- Email/password registration and login with bcrypt password hashing and signed, HTTP-only sessions.
- Private farmer dashboard with real crop/activity counts, upcoming harvests and latest field notes.
- Crop create, edit and delete with planting and harvest dates.
- Activity logging for irrigation, fertilization, spraying, planting and harvest.
- Location search and live current conditions from Open-Meteo, with manual refresh and graceful errors.
- Agricultural assistant backed by OpenAI when configured; otherwise it clearly labels its rule-based guidance as a fallback.
- Responsive layout, validation, empty/loading/error states and accessible form controls.

## Stack

Next.js App Router, TypeScript, React, Tailwind CSS, PostgreSQL through postgres.js for production, Node's built-in SQLite API for local development, bcryptjs, Open-Meteo and optional OpenAI.

## Run locally

1. Install Node.js 22.13+ and pnpm (the app uses Node's built-in SQLite module).
2. `pnpm install`
3. Copy `.env.example` to `.env.local`; set `SESSION_SECRET` to a random secret.
4. `pnpm dev` and visit http://localhost:3000.

When `DATABASE_URL` is unset, SQLite initializes automatically at `DATABASE_PATH` (default `./data/smartagri.db`). When `DATABASE_URL` is set, SmartAgri connects to Postgres and initializes its tables automatically. Open-Meteo is used without an API key. Add `OPENAI_API_KEY` to enable AI assistant responses. Without it, the assistant identifies its fallback status in the UI.

## Project links

- Public GitHub repository: https://github.com/malikshariqsource-sudo/smartagri-platform
- Live application: Not deployed yet. A Vercel connection and persistent production database are still required.

## Production notes

For Vercel, set `DATABASE_URL` to a managed PostgreSQL connection string and configure `SESSION_SECRET` and optionally `OPENAI_API_KEY`. The app selects Postgres automatically; SQLite is for local development only because Vercel's serverless filesystem is ephemeral. A production database and Vercel connection have not been provisioned in this workspace, so the public deployment is still pending.

## API integrations

- Open-Meteo geocoding: `https://geocoding-api.open-meteo.com/v1/search`
- Open-Meteo forecast/current weather: `https://api.open-meteo.com/v1/forecast`
- Optional OpenAI Chat Completions API for agricultural assistant replies.

## Screenshots

The landing page and authenticated dashboard were opened and visually checked in a local browser preview during QA. The preview images are shown in the delivery conversation; no screenshot image files are bundled in this source archive.

## Security

Passwords are bcrypt hashed; sessions are signed and stored in HTTP-only, same-site cookies. Set `SESSION_SECRET` in every environment. The demo app is intended for a single Node instance; add rate limiting, CSRF controls and managed database operations before public production use.
