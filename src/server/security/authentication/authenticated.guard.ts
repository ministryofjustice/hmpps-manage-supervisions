import { Reflector } from '@nestjs/core'
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import { Request, Response } from 'express'
import { PUBLIC_KEY } from './public.decorator'
import { TokenVerificationService } from '../token-verification/token-verification.service'

@Injectable()
export class AuthenticatedGuard implements CanActivate {
  constructor(private readonly reflector: Reflector, private readonly tokenVerification: TokenVerificationService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const host = context.switchToHttp()
    const request = host.getRequest<Request>()

    const isPublic = this.reflector.getAllAndOverride<boolean>(PUBLIC_KEY, [context.getHandler(), context.getClass()])
    if (isPublic) {
      const response = host.getResponse<Response>()
      response.locals.isPublic = true
      return true
    }

    if (!request.isAuthenticated()) {
      return false
    }

    if (!this.tokenVerification.isEnabled()) {
      return true
    }

    return await this.tokenVerification.verifyToken(request.user as any)
  }
}
