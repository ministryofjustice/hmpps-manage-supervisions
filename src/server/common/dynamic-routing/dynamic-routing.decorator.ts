import { applyDecorators, UseInterceptors } from '@nestjs/common'
import { DynamicRoutingInterceptor } from './dynamic-routing.interceptor'
import { DynamicRender } from './dynamic-render.decorator'
import { DynamicRedirect } from './dynamic-redirect.decorator'

type DynamicDecorator = typeof DynamicRender | typeof DynamicRedirect

export const DynamicRouting = (...decorators: DynamicDecorator[]) =>
  applyDecorators(...decorators, UseInterceptors(DynamicRoutingInterceptor))
