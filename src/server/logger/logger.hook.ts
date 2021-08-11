import { AsyncLocalStorage } from 'async_hooks'

interface LoggerContextStore {
  user?: User
}
export const LOGGER_HOOK = new AsyncLocalStorage<LoggerContextStore>()
