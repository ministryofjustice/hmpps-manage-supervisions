import { applyDecorators, SetMetadata, UseFilters, UseInterceptors } from '@nestjs/common'
import { CheckEligibilityInterceptor } from './check-eligibility.interceptor'
import { CHECK_ELIGIBILITY_KEY, CheckEligibilityContext, CheckEligibilityOptions } from './eligibility.types'
import { BreadcrumbType } from '../../common/links'
import { IneligibleCaseWarningFilter } from './ineligible-case-warning.filter'

export const CheckEligibility = (page: BreadcrumbType, options: CheckEligibilityOptions = { crnParam: 'crn' }) =>
  applyDecorators(
    SetMetadata(CHECK_ELIGIBILITY_KEY, { page, options } as CheckEligibilityContext),
    UseInterceptors(CheckEligibilityInterceptor),
    UseFilters(IneligibleCaseWarningFilter),
  )
