import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PassportSerializer, PassportStrategy } from '@nestjs/passport'
import { Strategy } from 'passport-oauth2'
import { AuthApiConfig, ServerConfig } from '../config'
import { UserService } from './user/user.service'
import { generateOauthClientToken } from '../common'
import { titleCase } from '../util'
import * as jwt from 'jsonwebtoken'

const DELIUS_AUTH_SOURCE = 'delius'
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
      authorizationURL: `${externalUrl}/oauth/authorize`,
      tokenURL: `${url}/oauth/token`,
      clientID: apiClientCredentials.id,
      clientSecret: apiClientCredentials.secret,
      callbackURL: `${domain}/login/callback`,
      state: true,
      customHeaders: { Authorization: generateOauthClientToken(apiClientCredentials) },
    }
  }

  constructor(private readonly config: ConfigService, private readonly userService: UserService) {
    super(HmppsStrategy.getOAuth2Settings(config))
  }

  async validate(token: string, refreshToken: string): Promise<User> {
    const claims = jwt.decode(token) as Record<string, any>
    const user = {
      token,
      refreshToken,
      username: claims.user_name,
      authorities: claims.authorities,
      scope: claims.scope,
    } as User
    const profile = await this.userService.getUser(user)

    const staffCode =
      claims.auth_source == DELIUS_AUTH_SOURCE ? (await this.userService.getStaffDetails(user)).staffCode : null

    return { ...user, ...profile, displayName: titleCase(profile.name), staffCode }
  }
}
