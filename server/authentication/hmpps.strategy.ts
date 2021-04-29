import passport from 'passport'
import { Strategy } from 'passport-oauth2'

import { ClientCredentials, ConfigService } from '../config'
import { HmppsAuthClient } from './HmppsAuthClient'
import { Container } from 'typedi'
import { convertToTitleCase } from '../utils/utils'

// Our user principal is quite flat so no need for complex serialization
passport.serializeUser((user, done) => done(null, user))
passport.deserializeUser((user, done) => done(null, user))

function generateOauthClientToken(credentials: ClientCredentials): string {
  const token = Buffer.from(`${credentials.id}:${credentials.secret}`).toString('base64')
  return `Basic ${token}`
}

export function useHmppsAuthPassportStrategy(config: ConfigService): void {
  const client = Container.get(HmppsAuthClient)

  const strategy = new Strategy(
    {
      authorizationURL: `${config.apis.hmppsAuth.externalUrl}/oauth/authorize`,
      tokenURL: `${config.apis.hmppsAuth.url}/oauth/token`,
      clientID: config.apis.hmppsAuth.apiClientCredentials.id,
      clientSecret: config.apis.hmppsAuth.apiClientCredentials.secret,
      callbackURL: `${config.server.domain}/login/callback`,
      state: true,
      customHeaders: { Authorization: generateOauthClientToken(config.apis.hmppsAuth.apiClientCredentials) },
    },
    (token, refreshToken, params, profile, done) => {
      const baseUser: Partial<UserPrincipal> = { token, username: params.user_name }
      client
        .getUser(baseUser as any)
        .then(profile => {
          done(null, { ...baseUser, ...profile, displayName: convertToTitleCase(profile.name) })
        })
        .catch(reason => done(reason))
    },
  )

  passport.use(strategy)
}
