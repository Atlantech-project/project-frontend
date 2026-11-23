# ATLANTECH Front-end: Sprint 3 Summary

**Sprint:** 3 (Home, audit and user administration) · **Date:** 2026-11-23
**Repo:** [Atlantech-project/project-frontend](https://github.com/Atlantech-project/project-frontend) · **Owner:** Moustafa (front-end)
**Result:** all Sprint 3 front-end tasks are done and merged into `develop`. The user and device pages were tested by Moustafa against the real backend (`develop`, Docker).

## Tasks

| Task | What was delivered | PR |
|---|---|---|
| FE-040 | P-17 Home Dashboard from Figma: the frame and the first widgets, with the terminal summary cards for terminal-scoped users. Replaces the temporary `/home` | #36 |
| FE-050 | P-29 Port Audit and Change History: who changed what and when, with search, entity, action and date filters, paging, and the before/after values of one change | #37 |
| FE-117 | Developer guide and the front-end decision log (`docs/developer-guide.md`, `docs/decisions.md`) | #38 |
| FE-035 | API types generated from the OpenAPI contract (JSDoc), with a check that fails when they are out of date. Contract updated to 1.11.1 for users, roles and devices | #39, #41 |
| FE-018 | App icon set from the Figma "Components" page (54 icons), used by the menu, header and pages | #40 |
| FE-045 | P-23 User Management (search, status filter, paging, Deactivate) and P-24 User Details: create a user with the one-time password shown once, change role, terminal and account status, role history. Deactivate explains the 409 refusal (yourself, the last active Port Admin); a stale version opens the "record changed" dialog | #42 |
| FE-046 | P-25 Registered Devices: one user's mobile devices with Revoke Token (one or all) and Restore, each confirmed first. P-24 shows a Registered Devices card with the count and a link to P-25 | #43 |

## Decisions taken this sprint

- **Name and username** can't be changed after a user is created (the API has no update endpoint). P-24 shows them read-only.
- **Licence bar** (Figma "6 / 10") on P-23: later, when its API exists.
- **Role and terminal filters** on P-23: later. The users API filters only by text and account status.
- **Terminal Scope** on P-24 is a digits-only field (terminal number) until a terminals list API exists.
- **Registered Devices** opens only from a user's details (`/admin/users/:id/devices`). The sidebar item `/admin/devices` stays hidden: Figma's P-25 always shows one user's devices and has no all-devices screen.

## Backend on Moustafa's PC

The backend was updated to the latest `develop` (project-backend PRs #67 users, #69 roles, #71 devices, #72) and runs with Docker from `project-backend/ATLANTECH`: `docker compose --profile server up -d --build`. The API answers at `http://localhost:8000` with 18 routes. Seeded demo users sign in with `DEMO_USER_PASSWORD` from the backend `.env`.

## Numbers

- 8 PRs merged this sprint (#36 to #43), 7 tasks done
- 409 automated tests, all passing; CI green on every PR

## Open items for Sprint 4

- Backend APIs the deferred parts wait for: licence usage, terminals list, user role filter, and an all-devices list if the sidebar item comes back.
- Sprint 2 and 3 release: `develop` → `release` → `main`, when the team is ready.
- P-19 Notifications (the header bell is shown but not active yet) and the SSE live updates (CT-05).
- Revoke and Restore on P-25 were tested with the mock API only: no device had signed in from the mobile app yet.
