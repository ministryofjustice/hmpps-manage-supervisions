import { MiddlewareConsumer, Module } from '@nestjs/common'
import { PassportModule } from '@nestjs/passport'
import { APP_GUARD } from '@nestjs/core'
import * as passport from 'passport'
import * as csurf from 'csurf'
import { UserService } from './user/user.service'
import { CommonModule } from '../common/common.module'
import { HmppsStrategy, SessionSerializer } from './login/hmpps.strategy'
import { LoginController } from './login/login.controller'
import { LogoutController } from './logout/logout.controller'
import { AuthenticatedGuard } from './authentication'
import { AuthorizedGuard } from './authorization'
import { TokenVerificationService } from './token-verification/token-verification.service'
import { setLocals, csp } from './middleware'
import { LoginService } from './login/login.service'
import { LogoutService } from './logout/logout.service'
import { CommunityApiModule } from '../community-api/community-api.module'
import { EligibleCaseloadGuard } from './eligibility'

/**
 * Applies HMPPS authentication to all routes via passport-oauth.
 * Routes are secured by default. To expose a public route, decorate with @Public().
 */
@Module({
  imports: [CommonModule, PassportModule.register({ session: true, defaultStrategy: 'hmpps' }), CommunityApiModule],
  providers: [
    UserService,
    SessionSerializer,
    HmppsStrategy,
    AuthenticatedGuard,
    {
      provide: APP_GUARD,
      useExisting: AuthenticatedGuard,
    },
    AuthorizedGuard,
    {
      provide: APP_GUARD,
      useExisting: AuthorizedGuard,
    },
    TokenVerificationService,
    LoginService,
    LogoutService,
    EligibleCaseloadGuard,
  ],
  controllers: [LoginController, LogoutController],
})
export class SecurityModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(passport.initialize(), passport.session(), csp(), csurf(), setLocals).forRoutes('*')
  }
}
