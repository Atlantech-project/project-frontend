import { afterAll, afterEach, beforeAll } from 'vitest'
import { server } from './server'
import { resetMockDb } from './handlers'

// Tests never reach a real server: an API call without a mock answer fails the test.
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterEach(() => {
  server.resetHandlers()
  resetMockDb()
})
afterAll(() => server.close())
