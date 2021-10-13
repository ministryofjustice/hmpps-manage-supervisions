import 'express-session'

interface LocalSessionData {
  eligibility?: {
    /**
     * Offender CRNs that have had the full-screen eligibility warning displayed.
     */
    warningDisplayed?: string[]
  }
}

declare module 'express-session' {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface SessionData extends LocalSessionData {}
}
