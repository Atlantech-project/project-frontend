# ATLANTECH Front-end: Sprint 2 Summary

**Sprint:** 2 (Sign-in, access control and platform core) · **Date:** 2026-11-08
**Repo:** [Atlantech-project/project-frontend](https://github.com/Atlantech-project/project-frontend) · **Owner:** Moustafa (front-end)
**Result:** all 11 Sprint 2 front-end tasks are done and merged into `develop`. Sign-in was tested by Moustafa against the real backend (`develop`, Docker).

## Tasks

| Task | What was delivered | PR |
|---|---|---|
| FE-016 | Component library on PrimeVue 4 (unstyled) + design tokens: Button, Input, Password input (show/hide), Field (label, hint, error), Alert. Shared loading/empty/error states moved onto the tokens | #23 |
| FE-030 | API client: one axios instance with Sanctum cookie sign-in (XSRF), retry once on 419, and every failure turned into one `ApiError` (RFC 9457 `code`, `message_key`, field errors, 409 `current`). Messages in English and Arabic for every error code | #24 |
| FE-027 | Session: Pinia store for the signed-in user (`restore`, `login`, `logout`), lost-session handling (401/419 back to sign-in with a reason), cached data cleared on sign-out | #25 |
| FE-025 | P-16 Port Login from Figma: username + password, the port name from `system/info`, and every Figma message (wrong password, disabled account, session expired, too many tries, no connection, server down) | #26 |
| FE-026 | Forced password change at first sign-in: new password + confirmation with the API rules (8+ characters, letters and numbers). The temporary password is kept in memory only, and asked for again after a reload | #27 |
| FE-021 | Route guard: signed-out users go to sign-in, first sign-in goes to the password change, page roles are checked. P-20 Access Denied (no permission, or mobile-only role). Temporary `/home` so signed-in users never land on the landing page | #28 |
| FE-020 | App shell from Figma: navy sidebar (port name, the role's menu, user, language switch, log out) and page header (title, port, notifications bell). Arabic puts the sidebar on the right | #29 |
| FE-031 | Data loaders on TanStack Query: lists with filters and pages, one record (shown at once from a loaded list), save and delete that refresh lists. Data stays fresh 30 s; retry once only on lost connection or 5xx | #30 |
| FE-032 | "Record changed by someone else" (409) dialog from Figma P-24, and a save helper: Reload loads the latest version, Cancel keeps the user's edits | #31 |
| FE-034 | MSW mock API for tests only: sign-in, password change, logout, system info and audit logs with test users. Tests can no longer call a real server | #32 |
| FE-017 | Status badges: 5 Figma tones, all 66 statuses of the backend's `status-vocabulary.json` (CT-21) with English and Arabic labels, and a test that fails when the backend adds or removes a status | #33 |

## Decisions taken this sprint

- **Password rule:** follows the API (8+ characters with letters and numbers), not Figma's 10.
- **Temporary password:** kept in memory from the sign-in, never stored. After a reload the change page asks for it.
- **P-20:** shown on its own (no app shell) for now.
- **After sign-in:** signed-in users never go to the landing page. They land on a temporary `/home` (name, role) until the P-17 Home Dashboard (FE-040, Sprint 3).
- **Menu:** shows only pages that exist, so it never leads to Not Found. Profile link and the access-scope box wait for their pages and data.
- **Status colours:** green finished well, teal under way, yellow needs attention, red failed or refused, grey ended without going ahead.

## Backend on Moustafa's PC

The backend (`develop`) runs locally with Docker for testing sign-in: `docker compose --profile server up -d --build`, then `docker compose exec app php artisan migrate --seed`. The API answers at `http://localhost:8000`. Seeded users (`port.gm`, `port.staff`, `terminal.admin`, ...) must change their password at first sign-in.

## Numbers

- 11 PRs merged (#23 to #33), 11 tasks done
- 253 automated tests, all passing; CI green on every PR

## Open items for Sprint 3

- Sprint 2 release: `develop` → `release` → `main` (PL-REL2), when the team is ready.
- P-17 Home Dashboard (FE-040) replaces the temporary `/home`.
- P-19 Notifications (the header bell is shown but not active yet) and the SSE live updates (CT-05).
- Real contact email, phone and social links for the landing page are still placeholders.
