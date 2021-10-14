import { applyDecorators, SetMetadata, UseFilters, UseGuards } from '@nestjs/common'
import { EligibleCaseloadGuard } from './eligible-caseload.guard'
import { EligibleCaseloadOnlyFilter } from './eligible-caseload-only.filter'
import { ELIGIBLE_CASELOAD_KEY, EligibleCaseloadOnlyOptions } from './eligibility.types'

export const EligibleCaseloadOnly = (options: EligibleCaseloadOnlyOptions = { crnParam: 'crn' }) =>
  applyDecorators(
    SetMetadata(ELIGIBLE_CASELOAD_KEY, options),
    UseGuards(EligibleCaseloadGuard),
    UseFilters(EligibleCaseloadOnlyFilter),
  )
