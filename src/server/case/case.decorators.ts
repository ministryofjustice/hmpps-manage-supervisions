import { Breadcrumb, BreadcrumbMeta, BreadcrumbType } from '../common/links'
import { CASE_BREADCRUMBS, CasePage } from './case.types'

export function CaseBreadcrumb({ page, ...meta }: Omit<BreadcrumbMeta, 'type' | 'parent'> & { page: CasePage }) {
  return Breadcrumb({
    type: CASE_BREADCRUMBS[page],
    parent: BreadcrumbType.Case,
    ...meta,
  })
}
