import { Reflector } from '@nestjs/core'
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import { Observable } from 'rxjs'
import { Request } from 'express'
import { PUBLIC_KEY } from '../meta/public.decorator'

@Injectable()
export class AuthenticatedGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const request: Request = context.switchToHttp().getRequest()

    const isPublic = this.reflector.getAllAndOverride<boolean>(PUBLIC_KEY, [context.getHandler(), context.getClass()])
    return isPublic || request.isAuthenticated()
  }
}
