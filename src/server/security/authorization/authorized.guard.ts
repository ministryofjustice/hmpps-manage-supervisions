import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common'
import { Request, Response } from 'express'
import { Reflector } from '@nestjs/core'
import { Role } from './authorization.types'
import { ROLES_KEY } from './roles.decorator'

const DEFAULT_ROLES = Object.freeze([Role.ReadOnly, Role.ReadWrite])

@Injectable()
export class AuthorizedGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext) {
    const host = context.switchToHttp()
    const response = host.getResponse<Response>()

    if (response.locals.isPublic) {
      // the endpoint is explicitly declared public, perform no authorization
      return true
    }

    const request = host.getRequest<Request>()
    const user = request.user as User
    if (!user || !request.isAuthenticated()) {
      // no user & endpoint not public => the authenticated guard is not setup
      throw new Error('authorization requires authentication')
    }

    const requiredRoles =
      this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [context.getHandler(), context.getClass()]) || DEFAULT_ROLES

    if (requiredRoles.length === 0) {
      // the handler explicitly declared no roles required for this endpoint
      return true
    }

    if (requiredRoles.some(role => user.authorities?.includes(role))) {
      // user has the required roles
      return true
    }

    // user does not have the required roles =>
    // we wouldn't normally throw from a guard but if we return false,
    // nest will throw a forbidden error, which will get mixed up with authentication.
    throw new UnauthorizedException()
  }
}
