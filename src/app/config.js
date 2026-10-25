// Runtime configuration (FE-011).
// Settings live in /config.json next to index.html, not in the bundle, so the same build
// runs on the dev and demo servers with only that file changed.

export const DEFAULT_CONFIG = Object.freeze({
  environment: 'local',
  apiBaseUrl: '/api/v1',
  eventsUrl: '/api/v1/events',
  defaultLocale: 'en',
  // Future-work features (FRD "FW"). Off until the release that ships them.
  features: Object.freeze({
    licenseMode: false, // Port licence banner and READ_ONLY handling (FR-LIC, DEC-54)
    nctRecommendations: false, // Non-container terminal recommendations (DEC-55)
    timingRecommendations: false, // TIMING recommendations (DEC-55)
    modelRetraining: false, // Part 3 automatic retraining views (FR-LM)
  }),
})

const LOCALES = ['en', 'ar']

let current = DEFAULT_CONFIG

// Merge a raw config object over the defaults. Unknown keys and values of the wrong type are
// dropped with a warning, so a typo on a server can't break the app.
export function resolveConfig(raw, warn = console.warn) {
  if (!raw || typeof raw !== 'object') return DEFAULT_CONFIG

  const out = { ...DEFAULT_CONFIG, features: { ...DEFAULT_CONFIG.features } }

  for (const key of ['environment', 'apiBaseUrl', 'eventsUrl']) {
    if (key in raw) {
      if (typeof raw[key] === 'string' && raw[key] !== '') out[key] = raw[key]
      else warn(`config.json: "${key}" must be a non-empty string, using the default`)
    }
  }

  if ('defaultLocale' in raw) {
    if (LOCALES.includes(raw.defaultLocale)) out.defaultLocale = raw.defaultLocale
    else warn(`config.json: "defaultLocale" must be one of ${LOCALES.join(', ')}`)
  }

  if (raw.features && typeof raw.features === 'object') {
    for (const [name, value] of Object.entries(raw.features)) {
      if (!(name in DEFAULT_CONFIG.features)) warn(`config.json: unknown feature "${name}"`)
      else if (typeof value !== 'boolean')
        warn(`config.json: feature "${name}" must be true or false`)
      else out.features[name] = value
    }
  }

  Object.freeze(out.features)
  return Object.freeze(out)
}

// Fetch /config.json once before the app mounts. Falls back to the defaults if it is missing.
export async function loadConfig(fetchFn = fetch, baseUrl = import.meta.env.BASE_URL) {
  try {
    const res = await fetchFn(`${baseUrl}config.json`, { cache: 'no-store' })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    current = resolveConfig(await res.json())
  } catch (err) {
    console.warn(`config.json could not be loaded (${err.message}), using defaults`)
    current = DEFAULT_CONFIG
  }
  return current
}

export function getConfig() {
  return current
}

export function isEnabled(feature) {
  return current.features[feature] === true
}
