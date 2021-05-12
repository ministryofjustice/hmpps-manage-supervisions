import { MiddlewareConsumer, Module } from '@nestjs/common'
import { PassportModule } from '@nestjs/passport'
import { APP_GUARD } from '@nestjs/core'
import * as passport from 'passport'
import * as csurf from 'csurf'
import { UserService } from './user/user.service'
import { CommonModule } from '../common/common.module'
import { HmppsStrategy, SessionSerializer } from './hmpps.strategy'
import { LoginController } from './login/login.controller'
import { LogoutController } from './logout/logout.controller'
import { AuthenticatedGuard } from './guards/authenticated.guard'
import { TokenVerificationService } from './token-verification/token-verification.service'
import { setLocals, csp } from './middleware'

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
export class SecurityModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(passport.initialize(), passport.session(), csp(), csurf(), setLocals).forRoutes('*')
  }
}
