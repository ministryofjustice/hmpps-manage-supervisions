import { NestExpressApplication } from '@nestjs/platform-express'
import * as passport from 'passport'

export function usePassport(app: NestExpressApplication) {
  app.use(passport.initialize())
  app.use(passport.session())

  app.use((req, res, next) => {
    res.locals.user = req.user
    next()
  })
}
