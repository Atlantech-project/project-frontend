import { describe, it, expect, vi, beforeEach } from 'vitest'
import axios from 'axios'
import { http, resetCsrfCookie, setSessionLostHandler } from './http'
import { ApiError } from './errors'

// Fake server: a queue of responses, one per request.
let calls
function respondWith(...responses) {
  http.defaults.adapter = async (config) => {
    calls.push(config)
    const { status, data } = responses.shift()
    const response = { status, data, headers: {}, config, statusText: '' }
    if (status >= 400) {
      throw new axios.AxiosError('fail', 'ERR_BAD_RESPONSE', config, null, response)
    }
    return response
  }
}

beforeEach(() => {
  calls = []
  resetCsrfCookie()
  setSessionLostHandler(null)
  vi.restoreAllMocks()
})

describe('http', () => {
  it('uses the API base URL and sends cookies', async () => {
    respondWith({ status: 200, data: { id: 1 } })
    const { data } = await http.get('/auth/me')
    expect(data).toEqual({ id: 1 })
    expect(calls[0].baseURL).toBe('/api/v1')
    expect(calls[0].withCredentials).toBe(true)
    expect(calls[0].headers.Accept).toBe('application/json')
  })

  it('fetches the XSRF cookie once before writes, not before reads', async () => {
    const csrf = vi.spyOn(axios, 'get').mockResolvedValue({ status: 204 })
    respondWith({ status: 200, data: {} }, { status: 200, data: {} }, { status: 200, data: {} })
    await http.get('/auth/me')
    expect(csrf).not.toHaveBeenCalled()
    await http.post('/auth/login', {})
    await http.post('/auth/logout')
    expect(csrf).toHaveBeenCalledTimes(1)
    expect(csrf).toHaveBeenCalledWith('/sanctum/csrf-cookie', { withCredentials: true })
  })

  it('refreshes the XSRF cookie and retries once on 419', async () => {
    const csrf = vi.spyOn(axios, 'get').mockResolvedValue({ status: 204 })
    respondWith(
      { status: 419, data: { code: 'SESSION_EXPIRED', message_key: 'errors.session_expired' } },
      { status: 200, data: { ok: true } },
    )
    const { data } = await http.post('/auth/login', {})
    expect(data).toEqual({ ok: true })
    expect(csrf).toHaveBeenCalledTimes(2)
    expect(calls).toHaveLength(2)
  })

  it('throws ApiError and reports a lost session on 401', async () => {
    const lost = vi.fn()
    setSessionLostHandler(lost)
    respondWith({
      status: 401,
      data: { code: 'UNAUTHENTICATED', message_key: 'errors.unauthenticated' },
    })
    const err = await http.get('/auth/me').catch((e) => e)
    expect(err).toBeInstanceOf(ApiError)
    expect(err.code).toBe('UNAUTHENTICATED')
    expect(lost).toHaveBeenCalledWith(err)
  })

  it('does not report a lost session when the request opts out (e.g. login)', async () => {
    const lost = vi.fn()
    setSessionLostHandler(lost)
    vi.spyOn(axios, 'get').mockResolvedValue({ status: 204 })
    respondWith({
      status: 401,
      data: { code: 'UNAUTHENTICATED', message_key: 'errors.unauthenticated' },
    })
    await http.post('/auth/login', {}, { skipSessionLost: true }).catch(() => {})
    expect(lost).not.toHaveBeenCalled()
  })
})
