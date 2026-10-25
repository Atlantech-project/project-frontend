# src layout

See `docs/adr/ADR-001-frontend-stack.md` for the full rules.

| Folder | Holds |
|---|---|
| `app/` | Router, guards, layouts and app-level pages (not found, access denied) |
| `brand/` | Brand kit `web/brand`, copied as delivered. Don't edit here; changes go through the brand owner |
| `api/` | HTTP client, error handling, SSE client, OpenAPI typedefs (FE-030, FE-033, FE-035) |
| `composables/` | Shared query/mutation helpers, `usePortTime`, `usePermissions` |
| `stores/` | Pinia stores: session, port, events, notifications |
| `components/` | Shared `Atl*` UI components on PrimeVue (FE-016) |
| `features/` | One folder per functional area; a feature never imports another feature |
| `i18n/` | `en.json`, `ar.json` |
| `styles/` | Global CSS entry |

Name page components after their Screens-spec page ID, e.g. `P38RecommendationReview.vue`.
