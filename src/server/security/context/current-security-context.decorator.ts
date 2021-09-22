import { createParamDecorator, ExecutionContext } from '@nestjs/common'
import { Request } from 'express'
import { SecurityContext } from './security-context'
import { plainToClass } from 'class-transformer'

export const CurrentSecurityContext = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
  const { user } = ctx.switchToHttp().getRequest<Request>()
  if (!user) {
    return null
  }

  return plainToClass(SecurityContext, user, { excludeExtraneousValues: true })
})
