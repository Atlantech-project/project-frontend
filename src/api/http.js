// HTTP client for the port API (FE-030).
// Sanctum SPA cookie auth (CT-03): the browser keeps the session cookie; we fetch the XSRF cookie
// once from /sanctum/csrf-cookie and axios sends it back as X-XSRF-TOKEN on every write.
import axios from 'axios'
import { getConfig } from '@/app/config'
import { toApiError } from './errors'

export const http = axios.create({
  withCredentials: true,
  withXSRFToken: true,
  xsrfCookieName: 'XSRF-TOKEN',
  xsrfHeaderName: 'X-XSRF-TOKEN',
  headers: { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
})

// Base URL comes from /config.json, which loads after this module, so read it per request.
http.interceptors.request.use((config) => {
  if (config.baseURL === undefined) config.baseURL = getConfig().apiBaseUrl
  return config
})

let csrfReady = null

// Get the XSRF cookie once per page load (and again after it expires).
export function ensureCsrfCookie() {
  csrfReady ??= axios.get('/sanctum/csrf-cookie', { withCredentials: true }).catch((error) => {
    csrfReady = null
    throw toApiError(error)
  })
  return csrfReady
}

export function resetCsrfCookie() {
  csrfReady = null
}

const WRITE_METHODS = ['post', 'put', 'patch', 'delete']

// Writes wait for the XSRF cookie.
http.interceptors.request.use(async (config) => {
  if (WRITE_METHODS.includes(config.method)) await ensureCsrfCookie()
  return config
})

// Called when the session is gone (401 / expired 419), so the session store can sign the user out.
let onSessionLost = null
export function setSessionLostHandler(fn) {
  onSessionLost = fn
}

http.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config
    const status = error.response?.status

    // 419: the XSRF token expired. Get a fresh one and try the request once more.
    if (status === 419 && config && !config._csrfRetried) {
      resetCsrfCookie()
      await ensureCsrfCookie()
      return http({ ...config, _csrfRetried: true })
    }

    const apiError = toApiError(error)
    if ((status === 401 || status === 419) && !config?.skipSessionLost) onSessionLost?.(apiError)
    throw apiError
  },
)
