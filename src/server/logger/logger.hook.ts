import { AsyncLocalStorage } from 'async_hooks'

interface LoggerContextStore {
  /**
   * Identifier of authenticated user, or null if this request is not authenticated.
   */
  user?: string
}
export const LOGGER_HOOK = new AsyncLocalStorage<LoggerContextStore>()
