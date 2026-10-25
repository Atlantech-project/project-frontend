# Configuration

The web dashboard has two kinds of settings.

## Runtime settings: `config.json` (per server)

`public/config.json` is copied to `dist/config.json` at build time and read by the browser on every page load (`src/app/config.js`). To point **the same build** at another server, edit `config.json` on that server. No rebuild is needed.

| Key | Default | Meaning |
|---|---|---|
| `environment` | `"local"` | Label for the environment, e.g. `local`, `dev`, `demo`, `production` |
| `apiBaseUrl` | `"/api/v1"` | Port API base path (CT-01). Same-origin by default; NGINX serves the app and the API on `app.atlantech.io` |
| `eventsUrl` | `"/api/v1/events"` | SSE stream for live updates (CT-05) |
| `defaultLocale` | `"en"` | `en` or `ar` (Arabic switches the page to RTL) |
| `features.*` | all `false` | Future-work switches, see below |

Unknown keys or values of the wrong type are ignored with a console warning, and the defaults are used. If `config.json` is missing, the app starts with the defaults.

### Future-work flags

These features are designed but deferred (FRD "FW"). Keep them `false` until the release that ships them.

| Flag | Feature | Reference |
|---|---|---|
| `licenseMode` | Licence banner, SETUP / READ_ONLY handling | FR-LIC, DEC-54 |
| `nctRecommendations` | Non-container terminal recommendations | DEC-55 |
| `timingRecommendations` | TIMING recommendations | DEC-55 |
| `modelRetraining` | Part 3 automatic retraining views | FR-LM |

In code: `import { isEnabled } from '@/app/config'` then `isEnabled('licenseMode')`.

### Serving it

`config.json` must not be cached, so a changed file takes effect on the next load. The app requests it with `cache: 'no-store'`; on NGINX also add:

```nginx
location = /config.json { add_header Cache-Control "no-store"; }
location / { try_files $uri $uri/ /index.html; }   # history-mode routing
```

## Build/dev settings: `.env.local` (per developer)

Only used by `pnpm dev`. Copy `.env.example` to `.env.local`.

| Variable | Meaning |
|---|---|
| `VITE_API_PROXY_TARGET` | Where the dev server proxies `/api` and `/sanctum` (default `http://localhost:8000`) |
