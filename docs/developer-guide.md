# Developer guide

How to run, change and ship the ATLANTECH web dashboard. Written so a new team member can start from it on day one.

## 1. What you need

| Tool | Version |
|---|---|
| Node.js | 22 (see `.nvmrc`) |
| pnpm | 10 (`corepack enable` installs the version in `package.json`) |
| Backend (optional) | [project-backend](https://github.com/Atlantech-project/project-backend) `develop`, with Docker |

Browsers we support (DEC-46): the latest 2 versions of Chrome, Edge and Firefox. Desktop from 1280 px wide, tablet from 768 px.

## 2. First run

```bash
git clone https://github.com/Atlantech-project/project-frontend.git
cd project-frontend
git checkout develop
pnpm install
cp .env.example .env.local
pnpm dev
```

The app opens at `http://localhost:5173`. On Windows PowerShell, run the commands one per line and use `Copy-Item .env.example .env.local` instead of `cp`.

### With the real backend

The dev server forwards `/api` and `/sanctum` to `VITE_API_PROXY_TARGET` (default `http://localhost:8000`), so the browser sees one origin and the Sanctum cookie works.

In the backend folder:

```bash
docker compose --profile server up -d --build
docker compose exec app php artisan migrate --seed
```

Seeded users (`port.gm`, `port.staff`, `terminal.admin`, ...) share the demo password from the backend `.env` and must change it at first sign-in.

### Without a backend

Pages that need data show their error state. Tests never need a backend: they run against the mock API in `src/mocks` (FE-034).

## 3. Scripts

| Command | Does |
|---|---|
| `pnpm dev` | Dev server with hot reload |
| `pnpm build` | Production build into `dist/` |
| `pnpm preview` | Serves the built `dist/` |
| `pnpm test` | All unit and component tests once (Vitest + jsdom) |
| `pnpm test:watch` | Tests in watch mode |
| `pnpm lint` / `pnpm lint:fix` | ESLint |
| `pnpm format` / `pnpm format:check` | Prettier |

CI (`.github/workflows/ci.yml`) runs install, lint, format check, tests and build on every PR to `develop`, `release` and `main`. Run the same four before you push.

## 4. Runtime settings

Settings are read at start-up from `public/config.json`, not built into the bundle, so one build runs on every server (FE-011). Keys: `environment`, `apiBaseUrl`, `eventsUrl`, `defaultLocale` and `features` (flags for future work, all off). Unknown keys or wrong types are dropped with a console warning.

## 5. Where things live

| Folder | Holds |
|---|---|
| `src/app/` | Router and guard, app shell (sidebar + header), menu per role (`navigation.js`), roles, statuses, app-level pages |
| `src/api/` | Axios client (`http.js`), error normalisation (`errors.js`), REST resources (`resource.js`) |
| `src/composables/` | Shared logic: data loaders on TanStack Query (`useResource.js`), 409 conflict save, theme |
| `src/stores/` | Pinia stores, e.g. the signed-in session |
| `src/components/` | Shared `Atl*` components: `ui/` (button, inputs, dialog, badge), `states/` (loading, empty, error) |
| `src/features/` | One folder per functional area (`auth`, `home`, ...). A feature never imports another feature |
| `src/i18n/` | `en.json` and `ar.json`. Every visible string goes through `t()` |
| `src/styles/` | Design tokens (`foundations.css`) and global CSS |
| `src/brand/` | Brand kit, copied as delivered. Don't edit it here |
| `src/mocks/` | Mock API (MSW) and fixtures, for tests only |

## 6. Adding a page

1. **Read the screen first:** its page ID and states in the Screens spec (P-xx) and in Figma, page "UI Design", frames named `P-xx / Screen / State`.
2. **Branch** from `develop`: `feature/FE-xxx-short-name`.
3. **Route:** add it in `src/app/router/index.js` with `meta: { layout: 'app', pageId: 'P-xx', titleKey, roles }`. `layout: 'app'` puts it in the shell; `roles` limits it (the guard sends others to P-20 Access Denied).
4. **Menu:** the page shows in the sidebar by itself once its path in `navigation.js` has a route. The menu never links to a page that doesn't exist.
5. **Data:** `createResource('/path')` plus `useResourceList` / `useResourceItem` / `useResourceSave`. Saves send the record's `updated_at`; a stale one gets the 409 dialog through `useConflictSave`.
6. **States:** every page shows loading, empty and error with `AtlLoadingState`, `AtlEmptyState` and `AtlErrorState`.
7. **Text:** English and Arabic keys in `src/i18n`. Check the page in Arabic: the layout mirrors (use `ms-`/`me-`/`ps-`/`pe-`/`start`/`end`, never `left`/`right`).
8. **Look:** only token classes from `foundations.css` (`bg-card`, `text-fg`, `border-edge`, `type-body-m`, `rounded-control`, ...). A test fails on raw colours in `.vue` files.
9. **Tests:** a `*.spec.js` next to the page, using the mock API. Add a handler in `src/mocks/handlers.js` if the endpoint is new.

## 7. Talking to the API

- Contract: `contracts/openapi/port-api.yaml` in [PortHub](https://github.com/Atlantech-project/PortHub) (source of truth in project-backend). Base path `/api/v1`.
- Web sign-in uses the Sanctum session cookie; the client fetches `/sanctum/csrf-cookie` and sends `X-XSRF-TOKEN` by itself.
- Every failure becomes one `ApiError` with the RFC 9457 `code`, `message_key`, field errors and, for 409, `current`. Show it with `errorMessage(error, i18n)`; every code has an English and Arabic message.
- A lost session (401/419) sends the user back to sign-in with the reason.
- Lists answer `{ data, meta: { page, per_page, total } }`.

## 8. Git and releases

- One branch per feature (`feature/FE-xxx-...`), reused for follow-ups on that feature, deleted after merge. Small doc fixes don't get their own branch.
- PRs go into `develop`. CI must be green.
- Releases: `develop` → `release` → `main`, each by PR, at the end of a sprint.
- At the end of each sprint, one summary file `docs/sprint-N.md`.

## 9. Conventions

- JavaScript only (no TypeScript). Vue 3 `<script setup>`.
- Role codes are the database names (`PORT_GM`, `PORT_STAFF`, `TERMINAL_ADMIN`, ...), see `src/app/roles.js`.
- Comments say why, briefly, and name the task or contract they come from (FE-xxx, CT-xx, DEC-xx).
- Frontend decisions are logged in [`decisions.md`](decisions.md). Add a row when you make one.
