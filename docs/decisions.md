# Frontend decision log

Decisions about the web dashboard, newest last. Project-wide decisions (DEC-xx) live in the PortHub `ATLANTECH_Decisions.md`; this log keeps the ones the frontend made or depends on. Add a row when you decide something a new member would otherwise ask about.

| # | Date | Decision | Why |
|---|---|---|---|
| FD-01 | 2026-10-25 | Vue 3 + Vite, **JavaScript only** (no TypeScript). API types come as JSDoc (FE-035) | Team's choice; keeps the toolchain small |
| FD-02 | 2026-10-25 | pnpm, Pinia for app state, **TanStack Query** for server data | One cache for every page; lists and details stay in step |
| FD-03 | 2026-10-25 | **PrimeVue pinned to v4**, unstyled, dressed in our tokens | v5 needs a licence key; unstyled lets the brand tokens drive the look |
| FD-04 | 2026-10-25 | Sign-in by **username**, not email | Matches DEC-35 and the API |
| FD-05 | 2026-10-25 | Role codes are the **database names** (`PORT_STAFF`, not `PORT_AUTHORITY_STAFF`) | The database is the source of truth |
| FD-06 | 2026-10-25 | Times shown in **port local time** from the port profile (DEC-45). Until the API exposes the time zone, pages that show times say UTC | DEC-45 |
| FD-07 | 2026-10-25 | Browsers: latest 2 versions of Chrome, Edge, Firefox. Desktop ≥ 1280 px, tablet ≥ 768 px | DEC-46 |
| FD-08 | 2026-10-28 | Corner radius from the **brand kit** (8 / 12 / 16 px), not Figma's 4 / 8 / 12 | Brand kit wins on identity |
| FD-09 | 2026-10-28 | Fonts: Montserrat (headings, numbers), Inter (text), **Readex Pro** (Arabic), Roboto Mono (IDs) | Readex Pro kept over Cairo and over Figma's system font |
| FD-10 | 2026-10-28 | Accessibility target **WCAG 2.1 AA**; a test checks the token contrast pairs | NFR-UX-3 |
| FD-11 | 2026-10-27 | The landing page is the **official product website**: no university or graduation-project mentions, no sign-in button | Product decision |
| FD-12 | 2026-10-28 | No branch-protection rule on the repo | Decided by the frontend owner |
| FD-13 | Sprint 2 (Nov 2026) | Password rule follows the **API** (8+ characters, letters and numbers), not Figma's 10 | API is the contract |
| FD-14 | Sprint 2 (Nov 2026) | The temporary password from a first sign-in is kept **in memory only**; after a reload the change page asks for it | Never store a password |
| FD-15 | Sprint 2 (Nov 2026) | Signed-in users never land on the landing page | Product decision |
| FD-16 | Sprint 2 (Nov 2026) | The menu shows **only pages that exist**, so it never leads to Not Found | Pages arrive sprint by sprint |
| FD-17 | 2026-11-08 | Status colours: green finished well, teal under way, yellow needs attention, red failed or refused, grey ended without going ahead | One meaning per colour across all 66 statuses (CT-21) |
| FD-18 | 2026-11-08 | The logo is **never mirrored** in Arabic; in RTL it only moves to the right | Brand identity |
| FD-19 | 2026-11-08 | Port and user names are shown **as stored** (one name each, no Arabic copy) | The admin can type them in Arabic |
| FD-20 | 2026-11-10 | P-17 Home widgets show no fake data: "No data yet" until each widget's API exists; terminal users get the terminal cards | Figma P-17 has a port-wide and a terminal-scoped variant |
| FD-21 | 2026-11-10 | Developer guide and this log are kept in the repo during sprints (FE-117), an exception to "no docs during a sprint" | Decided by the frontend owner |
