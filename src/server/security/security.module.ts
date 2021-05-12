import { Module } from '@nestjs/common'
import { UserService } from './user/user.service'
import { CommonModule } from '../common/common.module'
import { HmppsStrategy, SessionSerializer } from './hmpps.strategy'
import { PassportModule } from '@nestjs/passport'
import { LoginController } from './login/login.controller'
import { LogoutController } from './logout/logout.controller'
import { APP_GUARD } from '@nestjs/core'
import { AuthenticatedGuard } from './guards/authenticated.guard'
import { TokenVerificationService } from './token-verification/token-verification.service'

/**
 * Applies HMPPS authentication to all routes via passport-oauth.
 * Routes are secured by default. To expose a public route, decorate with @Public().
 * TODO RBAC
 */
@Module({
  imports: [CommonModule, PassportModule.register({ session: true, defaultStrategy: 'hmpps' })],
  providers: [
    UserService,
    SessionSerializer,
    HmppsStrategy,
    AuthenticatedGuard,
    {
      provide: APP_GUARD,
      useExisting: AuthenticatedGuard,
    },
    TokenVerificationService,
  ],
  controllers: [LoginController, LogoutController],
})
export class SecurityModule {}
