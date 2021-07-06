import { SetMetadata } from '@nestjs/common'
import { BreadcrumbMeta } from './types'

export function Breadcrumb(meta: BreadcrumbMeta) {
  return SetMetadata('breadcrumb', meta)
}
