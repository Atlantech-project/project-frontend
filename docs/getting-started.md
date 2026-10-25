# Getting started

You need **Node 22** (see `.nvmrc`) and **pnpm** (`corepack enable` sets it up).

```bash
git clone https://github.com/Atlantech-project/project-frontend.git
cd project-frontend
git checkout develop
pnpm install
cp .env.example .env.local   # point VITE_API_PROXY_TARGET at your Port API
pnpm dev                     # http://localhost:5173
```

| Command | Does |
|---|---|
| `pnpm dev` | Dev server; `/api` and `/sanctum` are proxied to the Port API so the Sanctum cookie works |
| `pnpm build` / `pnpm preview` | Production build into `dist/` and a local preview of it |
| `pnpm test` | Unit and component tests (Vitest) |
| `pnpm lint` / `pnpm format` | ESLint and Prettier |

Server settings (API URL, language, future-work flags) are in `public/config.json`; see [configuration.md](configuration.md).

The menu each role sees is set in `src/app/navigation.js`; see [navigation.md](navigation.md).

Every push and pull request to `develop`, `release` or `main` runs the same checks in GitHub Actions (`.github/workflows/ci.yml`): install, lint, format check, unit tests and build.

## Stack

Vue 3 + Vite (JavaScript), Vue Router, Pinia, TanStack Query, PrimeVue 4 (unstyled, styled with the brand tokens), Tailwind CSS v4, vue-i18n (English and Arabic with RTL), axios, date-fns-tz. Decisions and folder rules: [`adr/ADR-001-frontend-stack.md`](adr/ADR-001-frontend-stack.md). Folder map: [`../src/README.md`](../src/README.md).

## Brand kit

`src/brand/` and `public/brand/icons/` are the brand kit's `web/brand` folder, copied as delivered. Don't edit them here; changes go through the brand owner, then get copied in again.

## Git

One `feature/<task>` branch per task from `develop`, merged by pull request.
