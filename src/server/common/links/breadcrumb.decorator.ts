import { SetMetadata } from '@nestjs/common'
import { BreadcrumbMeta } from './links.types'

export function Breadcrumb(meta: BreadcrumbMeta) {
  return SetMetadata('breadcrumb', meta)
}
