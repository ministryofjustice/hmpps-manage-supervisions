import { Reflector } from '@nestjs/core'
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import { Request } from 'express'
import { PUBLIC_KEY } from '../meta/public.decorator'
import { TokenVerificationService } from '../token-verification/token-verification.service'

@Injectable()
export class AuthenticatedGuard implements CanActivate {
  constructor(private readonly reflector: Reflector, private readonly tokenVerification: TokenVerificationService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest()

    const isPublic = this.reflector.getAllAndOverride<boolean>(PUBLIC_KEY, [context.getHandler(), context.getClass()])
    if (isPublic) {
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
