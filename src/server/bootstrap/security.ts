import { NestExpressApplication } from '@nestjs/platform-express'
import * as helmet from 'helmet'
import * as csurf from 'csurf'
import type { NextFunction, Request, Response } from 'express'

export function useHelmet(app: NestExpressApplication) {
  // Secure code best practice - see:
  // 1. https://expressjs.com/en/advanced/best-practice-security.html,
  // 2. https://www.npmjs.com/package/helmet
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          // Hash allows inline script pulled in from https://github.com/alphagov/govuk-frontend/blob/master/src/govuk/template.njk
          scriptSrc: ["'self'", "'sha256-+6WnXIl4mbFTCARd8N3COQmT3bJJmo32N8q8ZSQAIcU='"],
          styleSrc: ["'self'", 'code.jquery.com'],
          fontSrc: ["'self'"],
        },
      },
    }),
  )
}

export function useCsrf(app: NestExpressApplication) {
  app.use(csurf())
  app.use((req: Request, res: Response, next: NextFunction) => {
    if (typeof req.csrfToken === 'function') {
      res.locals.csrfToken = req.csrfToken()
    }
    next()
  })
}
