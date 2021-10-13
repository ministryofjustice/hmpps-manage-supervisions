export class NonEligibleCaseloadAccessError extends Error {
  constructor(readonly crn: string) {
    super(`offender with crn '${crn}' is not on the caseload`)
  }
}

export interface EligibleCaseloadOnlyOptions {
  crnParam?: string
}

export const ELIGIBLE_CASELOAD_KEY = 'eligible-caseload'
