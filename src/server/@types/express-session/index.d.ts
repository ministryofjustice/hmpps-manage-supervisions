import 'express-session'

interface LocalSessionData {
  /**
   * Map of offender CRNs to app eligibility.
   */
  eligibility?: Record<string, boolean>
}

declare module 'express-session' {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface SessionData extends LocalSessionData {}
}
