# ATLANTECH Front-end: Sprint 1 Summary

**Sprint:** 1 (Decisions, contracts and foundations) · **Dates:** 2026-10-25 to 2026-10-29
**Repo:** [Atlantech-project/project-frontend](https://github.com/Atlantech-project/project-frontend) · **Owner:** Moustafa (front-end)
**Result:** all 8 Sprint 1 front-end tasks are done. `develop`, `release` and `main` hold the same code (`916556c`).

## Tasks

| Task | What was delivered | PR |
|---|---|---|
| FE-001 | Stack decided: Vue 3 + Vite, **JavaScript** (no TypeScript), pnpm, Node 22, Tailwind v4, PrimeVue 4 (unstyled), TanStack Query, Pinia, vue-i18n, Vitest | #1, #2 |
| FE-006 | Scope fixed: English + Arabic (RTL); times shown in port local time from `port_profile.timezone` (DEC-45); latest 2 versions of Chrome, Edge and Firefox, desktop ≥1280px, tablet ≥768px (DEC-46); accessibility WCAG 2.1 AA (NFR-UX-3) | #6, #7 |
| FE-010 | Project scaffold: folder layout (`app`, `features`, `components`, `composables`, `stores`, `api`, `i18n`, `brand`, `styles`), router, i18n, brand kit | #3 |
| FE-011 | Runtime `config.json` (API URL, events URL, locale, feature flags), so one build runs on dev and demo | #4 |
| FE-012 | GitHub Actions CI on every push and PR to `develop`, `release` and `main`: lint, format, tests, build | #5 |
| FE-022 | Role-based side menu. Uses the database role names (e.g. `PORT_STAFF`). `TERMINAL_ADMIN` sees both CT and NCT pages. Field roles (pilot, tug master, CT supervisor) get no web pages | #8, #9 |
| FE-S01 | Static pages: official product landing page (light/dark, English/Arabic, scroll animations, contact section), error page, 404 page, and shared loading/empty/error states | #13 |
| FE-015 | Design tokens from the Figma Foundations: colour scales, semantic colours, type styles, radius, shadows and control sizes. Includes an AA contrast test and a test that blocks raw colours in pages | #14 |

Other PRs: #10 brought the README into `develop`. #11 + #12 and #15 + #16 were the releases from `develop` to `release` to `main`.

## Decisions taken this sprint

- **Language:** JavaScript, not TypeScript. API types will come as JSDoc (FE-035).
- **UI kit:** PrimeVue pinned to v4, because v5 needs a licence key.
- **Sign-in:** by username, not email (DEC-35).
- **Roles:** database names are the source of truth.
- **Accessibility:** WCAG 2.1 AA, the level the requirements name (NFR-UX-3). The FE-015 contrast test checks it: 4.5:1 for text, 3:1 for UI parts such as focus rings.
- **Fonts:** Montserrat for headings and numbers, Inter for text, **Readex Pro** for Arabic, Roboto Mono for IDs such as BR-A-0109.
- **Corner radius:** brand kit 8 / 12 / 16 px. Figma uses 4 / 8 / 12, and we kept the brand kit.
- **Landing page:** treated as the official product website, with no university or graduation-project mentions and no sign-in button.
- **Docs:** no docs files in the repo during a sprint. One summary like this one at the end of each sprint.
- **Branches:** one branch per feature, deleted after merge. Releases go `develop` → `release` → `main` by PR.

## UI design

The final UI arrived in Figma on 2026-10-28. It has 45 screens (P-16 to P-62), about 375 states, in six groups (UX-W1 to UX-W6). Mobile/tablet screens P-52 to P-58 are out of front-end scope. Still missing from the final UI: P-22, P-48, P-60, P-61 (wireframe only) and P-32.

## Numbers

- 16 PRs merged, 8 tasks done
- 73 automated tests, all passing; CI green on all three branches

## Open items for Sprint 2

- Real contact email, phone and social links for the landing page (placeholders in `src/app/pages/landing/contact.js`).
- DEC-48 (what field roles see on the web) is still open. The recommended option, P-20 with a "use the tablet app" message, is used for now.
- Sprint 2 front-end tasks start from the Figma screens: FE-016 component library, FE-017 status badges, FE-030 to FE-034 API layer, FE-020 app shell, FE-021 router and P-20, FE-025 P-16 login, FE-026 forced password change, and FE-027 session handling.
