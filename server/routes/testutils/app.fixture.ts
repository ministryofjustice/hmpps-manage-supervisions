import 'reflect-metadata'
import express, { Express } from 'express'
import createError from 'http-errors'
import { Container } from 'typedi'

import nunjucksSetup from '../../utils/nunjucksSetup'
import errorHandler from '../../errorHandler'
import { mvcRouter } from '..'
import { fakeConfig } from '../../config/config.fake'
import { ConfigService } from '../../config'
import passport from 'passport'
import session from 'express-session'
import { CacheService } from '../../data/CacheService'
import { MockCacheService } from '../../data/CacheService.mock'

const user = {
  token: 'access-token',
  name: 'john smith',
  username: 'user1',
  displayName: 'John Smith',
}

passport.serializeUser((user, done) => done(null, user))
passport.deserializeUser((user, done) => done(null, user))

async function appSetup(config: ConfigService): Promise<Express> {
  const app = express()

  app.set('view engine', 'njk')

  nunjucksSetup(app)

  app.use(
    session({
      secret: 'test-secret',
    }),
  )

  app.use(passport.initialize())
  app.use(passport.session())

  app.use((req, res, next) => {
    req.login(user, err => {
      if (err) next(err)
      else {
        res.locals = {}
        res.locals.user = req.user
        next()
      }
    })
  })

  app.use(express.json())
  app.use(express.urlencoded({ extended: true }))
  app.use('/', await mvcRouter())
  app.use((req, res, next) => next(createError(404, 'Not found')))
  app.use(errorHandler(config.server.isProduction))

  return app
}

export default async function appFixture(partialConfig: DeepPartial<ConfigService> = {}): Promise<Express> {
  const config = fakeConfig({ ...partialConfig, apis: { tokenVerification: { enabled: false } } })
  Container.set(ConfigService, config)
  Container.set(CacheService, new MockCacheService())
  return appSetup(config)
}
