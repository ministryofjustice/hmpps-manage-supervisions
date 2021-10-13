import { BreadcrumbType } from '../../common/links'

export class IneligibilityCaseWarningRequired extends Error {
  constructor(readonly crn: string, readonly page: BreadcrumbType) {
    super(`the offender with crn '${crn}' requires the eligibility warning`)
  }
}

export interface CheckEligibilityOptions {
  crnParam: 'crn'
}

export interface CheckEligibilityContext {
  page: BreadcrumbType
  options: CheckEligibilityOptions
}

export const CHECK_ELIGIBILITY_KEY = 'check-eligibility'
