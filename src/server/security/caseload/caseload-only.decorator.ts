import { SetMetadata, applyDecorators, UseGuards, UseFilters } from '@nestjs/common'
import { CaseloadGuard } from './caseload.guard'
import { CaseloadOnlyFilter } from './caseload-only.filter'

export interface CaseloadGuardOptions {
  crnParam?: string
}

export const CASELOAD_KEY = 'caseload'

export const CaseloadOnly = (options: CaseloadGuardOptions = { crnParam: 'crn' }) =>
  applyDecorators(SetMetadata(CASELOAD_KEY, options), UseGuards(CaseloadGuard), UseFilters(CaseloadOnlyFilter))
