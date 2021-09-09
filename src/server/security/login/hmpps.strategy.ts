import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PassportSerializer, PassportStrategy } from '@nestjs/passport'
import { Strategy } from 'passport-oauth2'
import { AuthApiConfig, ServerConfig } from '../../config'
import { UserService } from '../user/user.service'
import { generateOauthClientToken } from '../../common'
import { titleCase, urlJoin } from '../../util'
import * as jwt from 'jsonwebtoken'

@Injectable()
export class SessionSerializer extends PassportSerializer {
  serializeUser(user: any, done: (err: Error, user: any) => void): any {
    done(null, user)
  }

  deserializeUser(payload: any, done: (err: Error, payload: string) => void): any {
    done(null, payload)
  }
}

@Injectable()
export class HmppsStrategy extends PassportStrategy(Strategy, 'hmpps') {
  private static getOAuth2Settings(config: ConfigService) {
    const { url, externalUrl, apiClientCredentials } = config.get<AuthApiConfig>('apis.hmppsAuth')
    const { domain } = config.get<ServerConfig>('server')
    return {
      authorizationURL: urlJoin(externalUrl, 'oauth', 'authorize'),
      tokenURL: urlJoin(url, 'oauth', 'token'),
      clientID: apiClientCredentials.id,
      clientSecret: apiClientCredentials.secret,
      callbackURL: urlJoin(domain, 'login', 'callback'),
      state: true,
      customHeaders: { Authorization: generateOauthClientToken(apiClientCredentials) },
    }
  }

  private readonly logger = new Logger(HmppsStrategy.name)

  constructor(private readonly config: ConfigService, private readonly userService: UserService) {
    super(HmppsStrategy.getOAuth2Settings(config))
  }

  /**
   * Validate an oauth callback.
   * Returning a falsey value here will result in nest throwing an UnauthorizedException.
   * We should catch these in the global exception filter to display an access denied page.
   * This function should never throw as that would result in a noisy unhandled exception & a dead end for the user.
   */
  async validate(token: string, refreshToken: string): Promise<User> {
    const claims = jwt.decode(token) as Record<string, any>

    if (claims.auth_source !== 'delius') {
      this.logger.log(`user '${claims.sub}' attempted login with auth_source '${claims.auth_source}'`)
      return null
    }

    const user = {
      token,
      refreshToken,
      username: claims.user_name,
      authorities: claims.authorities,
      scope: claims.scope,
    } as User

    try {
      const [profile, staff] = await Promise.all([
        this.userService.getUser(user),
        this.userService.getStaffDetails(user),
      ])
      if (!staff?.staffCode) {
        this.logger.error(`delius user '${user.username}' has no staff record`)
        return null
      }

      return {
        ...user,
        ...profile,
        displayName: titleCase(profile.name),
        staffCode: staff.staffCode,
      }
    } catch (err) {
      this.logger.error(`cannot retrieve user profile for delius user '${user.username}'`, err)
    }
  }
}
