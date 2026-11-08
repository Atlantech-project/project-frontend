// MSW server for Vitest (FE-034). Started for every test file by src/mocks/vitest.setup.js.
// A test changes one answer with server.use(...) and it is reset after that test.
import { setupServer } from 'msw/node'
import { handlers } from './handlers'

export const server = setupServer(...handlers)
