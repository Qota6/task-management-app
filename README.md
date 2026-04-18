# Task Planner (Monthly / 2-Week)

Minimal + handwritten-accent PWA for tracking monthly and 2-week tasks. All data is stored locally in the browser (IndexedDB), so no login is required.

## Features

- **Monthly view**: tasks × week-of-month grid, tap a cell to log a completion. Multiple completions per cell are supported.
- **2 Week view**: task list with a custom start date; completion timestamps recorded per tap.
- **Task creation**: name, period (start / end), recurrence (none / daily / weekly / monthly).
- **Recurrence**: tasks stay active until their period end, so they reappear in the next week/month without manual recreation.
- **Completion history**: per-task list of completion timestamps with per-entry delete.
- **Local-only storage**: IndexedDB (Dexie). JSON export / import for manual iCloud Drive backup.
- **PWA**: installable, works offline; requests Persistent Storage to avoid automatic eviction.

## Tech stack

- Vite + React 19 + TypeScript
- Tailwind CSS (minimal base, handwritten accents)
- Dexie.js (IndexedDB)
- `vite-plugin-pwa`

## Getting started

```bash
npm install
npm run dev
```

## Build & deploy

```bash
npm run build
# dist/ can be deployed to Cloudflare Pages (static site)
```

### Cloudflare Pages setup (suggested)

- Build command: `npm run build`
- Build output directory: `dist`

## Data & privacy

- No backend, no account, no analytics.
- All data lives in IndexedDB under the app origin.
- Use **Settings → Export** to download a JSON backup (recommended: save to iCloud Drive).
- Use **Settings → Import** to restore from a backup JSON (overwrites existing data).
