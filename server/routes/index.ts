import { Router } from 'express'
import * as path from 'path'
import tokenVerificationMiddleware from '../authentication/token-verification.middleware'
import { useMvc } from '../mvc'

export async function mvcRouter(): Promise<Router> {
  const router = Router({ mergeParams: true })

  router.use(tokenVerificationMiddleware())

  // populate some response local data
  router.use((req, res, next) => {
    res.locals.user = req.user
    if (typeof req.csrfToken === 'function') {
      res.locals.csrfToken = req.csrfToken()
    }
    next()
  })

  const rootPath = path.resolve(__dirname, '..')
  await useMvc(router, { controllers: `${rootPath}/**/*@(.c|C)ontroller.js` })

  return router
}
