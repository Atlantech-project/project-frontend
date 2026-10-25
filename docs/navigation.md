# Role navigation (FE-022)

The web menu is configured in [`src/app/navigation.js`](../src/app/navigation.js); the role codes are in [`src/app/roles.js`](../src/app/roles.js). Both come from the Screens spec (each page's "Web · Rn" line) and Users & Actors.

- `navigationFor(role)` returns the sections and pages one role sees, with `readOnly: true` on pages it may only view.
- `pageAccess(pageId, role)` returns `'edit'`, `'read'` or `null`; the route guard (FE-021) will use it.
- Only list pages are in the menu. Detail and form pages (P-24, P-35 to P-38, P-40, P-42, P-51) open from their list page.
- Paths are placeholders until each feature adds its routes.

| Role | Code | Menu pages |
|---|---|---|
| R2 Port Admin | `PORT_GM` | General, Plans (P-39), Administration (P-23, P-25 to P-30, P-62) |
| R3 Port Authority Staff | `PORT_STAFF` | General, Berthing (P-34, P-31, P-33), Plans (P-39, P-41) |
| R4 Pilotage Manager | `PILOTAGE_MANAGER` | General, Pilot roster (P-43) |
| R5 Pilotage Officer | `PILOTAGE_OFFICER` | General, Pilot roster read-only (P-43), Pilotage assignments (P-44) |
| R7 Tug Manager | `TUG_MANAGER` | General, Tug fleet and masters (P-45, P-46) |
| R8 Tug Officer | `TUG_OFFICER` | General, Tug fleet and masters read-only, Tug assignments (P-47) |
| R10 CT Administrator | `TERMINAL_ADMIN` | General, Plans read-only (P-39), Equipment (P-48), Yard (P-49) |
| R11 CT Planner | `TERMINAL_OFFICER` | General, Plans read-only (P-39), Yard placement (P-50) |
| R13 Marine Safety Officer | `MARINE_SAFETY_OFFICER` | Home, Environment, Notifications, Safety constraints (P-59) |
| R6, R9, R12 field roles | `MARINE_PILOT`, `TUG_MASTER`, `TERMINAL_SUPERVISOR` | No web menu (tablet app) |

General = Home (P-17), Port state (P-18), Environmental conditions (P-21) and Notifications (P-19). The Marine Safety Officer is not listed on P-18 in the spec, so it doesn't get Port state.

## Open points

1. **DEC-48** (field roles on the web) is still open. The config follows the recommended option: no web menu, and FE-021 shows P-20 with a "use the mobile app" message.
2. **CT-03 role name.** The login example in CT-03 returns `"role": "PORT_AUTHORITY_STAFF"`, but the database role is `PORT_STAFF`. The config uses `PORT_STAFF`; the backend team should confirm.
3. **NCT Administrator.** It uses the same `TERMINAL_ADMIN` code in an NCT unit, and the login response has no terminal type. It would see the CT pages until the API says which terminal type the user belongs to. The Screens spec has no NCT pages yet.
