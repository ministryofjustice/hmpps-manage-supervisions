import { createParamDecorator, ExecutionContext } from '@nestjs/common'
import { Request } from 'express'
import { parseUtmContent, RawUtm, Utm } from '../links'
import { ParsedQs } from 'qs'

function isRawUtm(value: any): value is RawUtm {
  return 'utm_source' in value && 'utm_medium' in value && 'utm_campaign' in value
}

export function utmFactory(query: ParsedQs): Utm {
  if (!query || !isRawUtm(query)) {
    return null
  }

  return {
    source: query.utm_source,
    campaign: query.utm_campaign,
    medium: query.utm_medium,
    content: parseUtmContent(query.utm_content),
  } as Utm
}

export const UtmTags = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
  const { query } = ctx.switchToHttp().getRequest<Request>()
  return utmFactory(query)
})
