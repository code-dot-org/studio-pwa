# studio-pwa

Standalone Turborepo containing `apps/studio` — Code.org's K-12 CS and AI
education PWA — ejected from the main
[code-dot-org/code-dot-org](https://github.com/code-dot-org/code-dot-org)
monorepo for GitHub Pages deployment.

Source commit: `7b8761298b56bfb11c9e91a068d7412718d1bec7` (branch
`1192025-k12-notebook-lab`).

## Live URL

`https://<github-user>.github.io/studio-pwa/app/m/home`

(Replace `<github-user>` with the account this repo is published under.)

## Key routes

| Path | Description |
|------|-------------|
| `/app/m/home` | Journey picker (HomeView) |
| `/app/m/journey/$journeyId` | Journey detail |
| `/app/m/lesson.$lessonId` | AI Decisions lesson player |
| `/app/m/notebook` | K-12 Python Notebook Lab |
| `/app/m/seats` | Seat picker |
| `/app/courses/$slug` | Course catalog |

## Development

```sh
# Install (requires Node 22+ and corepack)
corepack enable
yarn install

# Dev server (hot reload)
cd apps/studio
yarn dev
# → http://localhost:5173/studio-pwa/app/m/home

# Production build
yarn turbo build --filter=@code-dot-org/studio
# Output: apps/studio/dist/

# Preview production build locally
cd apps/studio && yarn preview
# → http://localhost:4173/studio-pwa/app/m/home
```

## GitHub Pages deployment

Push to `main`. The `.github/workflows/deploy-pages.yml` workflow builds and
deploys automatically via the GitHub Pages Actions source. Enable Pages in
the repo settings: **Settings → Pages → Source → GitHub Actions**.

## Notes

- Storage: seat/progress data is persisted in `localStorage` (replaces
  Capacitor Preferences from the native mobile build).
- TTS: uses the browser Web Speech API. Voice availability varies by OS and
  browser; may behave differently from the native Capacitor TTS.
- Sentry / analytics: set `VITE_SENTRY_DSN` (and any other `VITE_*` env
  vars) as repository secrets and reference them in the workflow env block if
  needed. Without them, observability init no-ops gracefully.
