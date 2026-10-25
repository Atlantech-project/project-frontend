# ADR-001 · Frontend stack and repository layout

| | |
|---|---|
| Task | FE-001 (Sprint 1) |
| Status | **Draft**, for Frontend Team review |
| Author | Moustafa (Frontend) |
| Date | 2026-10-25 |
| Inputs | Master_Context §5, System Architecture v3, Contracts CT-01/02/03/05/19/20/21/22, Screens spec, brand-kit `web/brand`, NFR-UX-4, DEC-35/45/46/48 |

## Context

`project-frontend` is the Vue.js web dashboard for office users (Port Admin, Port Authority Staff, Marine Safety Officer, Pilotage and Tug officers and managers, CT Administrator and Planner). It runs inside the port LAN with **no guaranteed internet access**, talks to the Laravel Port API over HTTPS and receives live updates over SSE. The repo has only a README so far.

Things the stack has to handle, taken from the docs:

- **Auth:** a Sanctum cookie session (`GET /sanctum/csrf-cookie`, then login by **username** and password with the `X-XSRF-TOKEN` header) and a forced password change (CT-03).
- **API:** everything is under `/api/v1`, times are UTC ISO 8601, errors follow RFC 9457 with a `code` and `message_key`, every edit sends back a `version` token (a stale one gets a 409), and lists are paginated with `page` and `per_page` (CT-01).
- **Types:** the OpenAPI 3.0 file in PortHub `contracts/openapi/port-api.yaml` is the source of truth (CT-02). FE-035 generates JSDoc type definitions from it, so editors still autocomplete API shapes.
- **Realtime:** `GET /api/v1/events` (SSE) with `Last-Event-ID` replay. An event only says that something changed, and the page refetches the details over REST (CT-05).
- **Roles:** menus and route guards per role and terminal scope, with P-20 Access Denied on a 403 (FE-021/022, DEC-48).
- **Screen states:** every page has Default, Loading, Empty, Error and Conflict states (CT-22).
- **Language:** Arabic and English with RTL, and errors keyed by `message_key` (NFR-UX-4).
- **Time:** times are shown in port time from `port_profile.timezone` (DEC-45, recommended option).
- **Browsers:** the latest two versions of Chrome, Edge and Firefox, desktop from 1280px and tablet from 768px (DEC-46, recommended option).
- **Accessibility:** WCAG 2.1 AA contrast.
- **Brand:** the brand kit `web/brand` is the official drop-in. It includes `tokens.css` (light and dark), a Tailwind v4 theme, `AtlantechLogo.vue` and bundled fonts.

## Decision

| Area | Choice | Why |
|---|---|---|
| Framework | **Vue 3** (Composition API, `<script setup>`) | Set by the architecture docs |
| Language | **JavaScript** (ES modules) | Decided by the Frontend Team (open point 1), matches the README. API shapes are documented with JSDoc `@typedef`s generated from OpenAPI (FE-035) for editor help, with no compile step |
| Build | **Vite** | Standard for Vue 3, fast, and produces a static build that NGINX serves |
| Routing | **Vue Router 4** | Route `meta` holds `roles`, `terminalScoped` and `pageId` (`P-xx`), and one global guard handles auth, roles, P-20 and the forced password change |
| State | **Pinia** | Only for app-wide state: session/user, port profile, SSE connection, notifications. Page data lives in composables (below) |
| Server data | **TanStack Query for Vue** (`@tanstack/vue-query`) on top of the HTTP client (FE-031) | Decided (open point 2). Gives caching, refetching and loading/error states out of the box. SSE events map to `invalidateQueries`, and the 409 version-token flow (FE-032) lives in a shared mutation helper |
| HTTP | **axios** with `withCredentials: true` | Reads the `XSRF-TOKEN` cookie and sends `X-XSRF-TOKEN` automatically, which is what Sanctum expects. One interceptor turns RFC 9457 bodies into a single `ApiError` (FE-030) |
| Realtime | Native **`EventSource`** (`withCredentials`) wrapped in a `useEvents()` store | The browser sends `Last-Event-ID` on reconnect by itself. One map links each event (`RECOMMENDATION_READY` …) to the queries it refreshes (FE-033) |
| Styling | **Brand-kit `tokens.css` + Tailwind CSS v4** (`tailwind-theme.css`) | Uses the kit as delivered, with light and dark themes. Pages use tokens only (FE-015). Logical properties (`ms-*`/`me-*`) for RTL. Corner radius follows the kit: `--atl-radius-sm` 8px, `--atl-radius` 12px, `--atl-radius-lg` 16px |
| UI components | **PrimeVue 4** (MIT; unstyled / pass-through mode) styled with the brand-kit tokens, wrapped in our own `Atl*` components | Decided (open point 3). Ready, accessible components (DataTable, DatePicker, Dialog, Select) save time on table-heavy screens. RTL is supported. Stay on 4.x: PrimeVue 5 moved to the PrimeUI licence, which needs a licence key |
| Icons | **Lucide** (`lucide-vue-next`) | Open, round-jointed line icons, which matches the brand rule. To be confirmed against the approved icon set (DEC-49, FE-018) |
| i18n | **vue-i18n** (`en`, `ar`), with `dir` switched on `<html>` | Backend `message_key` values map straight to translation keys |
| Dates | **date-fns** + **date-fns-tz** | Converts UTC from the API to the port time zone in one `formatPortTime()` helper |
| Forms | **VeeValidate** + **zod** | Shows server 422 `errors{}` on the matching fields |
| Tables | **PrimeVue DataTable** in lazy mode | Server pagination and sorting for audit, requests and deviations, from the same component library |
| Charts | **ECharts** (`vue-echarts`), only where needed | Uses `tokens.js` `chartSeries` (P-21 environment, P-30 drift) |
| Mocks | **MSW** for tests and offline dev (FE-034) | Shaped like the real responses (CT-19 scenarios) |
| Tests | **Vitest** + Vue Test Utils (unit and component), **Playwright** (e2e, Chrome, Edge, Firefox) | FE-100. Playwright covers the DEC-46 browser matrix |
| Quality | **ESLint** (flat config, `eslint-plugin-vue`) + **Prettier** | FE-012 CI runs lint, unit tests and build on every PR |
| Package manager | **pnpm**, with Node 22 LTS pinned in `.nvmrc` and `engines` | Fast, strict lockfile |
| Fonts and assets | Bundled locally from the brand kit, never from a CDN | The port LAN may have no internet |

## Repository layout

```
project-frontend/
├── public/brand/icons/          favicon, manifest (from brand kit)
├── src/
│   ├── app/                     main.js, App.vue, router/, guards, layouts (shell, auth)
│   ├── brand/                   brand-kit web/brand copied as-is (tokens.css, logos, fonts, AtlantechLogo.vue)
│   ├── api/                     http client, ApiError, JSDoc typedefs generated from OpenAPI (FE-035), sse client
│   ├── composables/             query and mutation helpers (TanStack Query), usePortTime, usePermissions
│   ├── stores/                  session, port, events, notifications (Pinia)
│   ├── components/              shared UI: AtlButton, AtlTable, AtlDialog, StatusBadge (FE-017), states (Loading/Empty/Error/Conflict)
│   ├── features/                one folder per functional area, named like the backend modules
│   │   ├── auth/                P-16 login, forced password change
│   │   ├── home/                P-17
│   │   ├── port-state/          P-18, P-21
│   │   ├── admin/               P-23..P-30, P-62
│   │   ├── berthing/            P-31, P-33..P-38
│   │   ├── plans/               P-39..P-42
│   │   ├── pilotage/            P-43, P-44
│   │   ├── tugs/                P-45..P-47
│   │   ├── terminal-ct/         P-48..P-51
│   │   └── safety/              P-59
│   │       └── (each: pages/, components/, api.js, routes.js, *.spec.js)
│   ├── i18n/                    en.json, ar.json
│   └── styles/                  base.css (imports brand tokens + tailwind theme)
├── tests/e2e/                   Playwright
├── mocks/                       MSW handlers and fixtures
├── docs/adr/                    this file and later decisions (FE-117)
└── .github/workflows/ci.yml     FE-012
```

Rules:
- A feature imports only from `api/`, `composables/`, `stores/`, `components/` and its own folder, **never from another feature**. This matches the backend rule that modules never import each other.
- Each page component is named after its page ID, e.g. `P38RecommendationReview.vue`, so QA defects (`Page ID` field, CT-26) map straight to files.
- Status labels and colours come from the shared vocabulary (`status-vocabulary.json`, CT-21) through `StatusBadge`. No status strings are hard-coded.

**Branching** stays as in the team Git guide: `feature/<task>` from `develop`, merged by PR, then `develop → release → main` with a tag each sprint.

## Consequences

- Plain JavaScript keeps the setup simple for the team. API changes in the OpenAPI file are not caught at build time, so they rely on the regenerated JSDoc typedefs, the CT-23 readiness packs and tests.
- PrimeVue speeds up Sprint 2 (FE-016), but its pass-through styles must be kept on the brand tokens so screens stay on brand.
- No runtime dependency on the internet: fonts, icons and the brand all ship in the build.

## Open points for the team

1. ~~TypeScript or JavaScript?~~ **Decided: JavaScript** (Moustafa, 2026-10-25).
2. ~~Own composables or TanStack Query?~~ **Decided: TanStack Query** (Moustafa, 2026-10-25).
3. ~~Reka UI or PrimeVue?~~ **Decided: PrimeVue** (Moustafa, 2026-10-25).
4. ~~Corner radii?~~ **Decided: brand kit values, 8/12/16px** (Moustafa, 2026-10-25, "Style A · Softer"). The CT-22 `tokens.json` example (4/8px) should be updated to match; tell the brand owner (Marwan Nabil) and UI/UX.
5. ~~Sign-in field?~~ **Decided: username** (Moustafa, 2026-10-25), matching the DEC-35 recommendation. P-16 shows username and password, not email.
6. DEC-45 and DEC-46 close in Sprint 1. This draft assumes the recommended options.
