import { applyDecorators } from '@nestjs/common'
import { Breadcrumb, BreadcrumbMeta, BreadcrumbType } from '../common/links'
import { CASE_BREADCRUMBS, CasePage } from './case.types'
import { CheckEligibility } from './eligibility'

export function CaseTabbedPage({ page, ...meta }: Omit<BreadcrumbMeta, 'type' | 'parent'> & { page: CasePage }) {
  const type = CASE_BREADCRUMBS[page]
  return applyDecorators(
    Breadcrumb({ type, parent: page === CasePage.Overview ? BreadcrumbType.Cases : BreadcrumbType.Case, ...meta }),
    CheckEligibility(type),
  )
}
