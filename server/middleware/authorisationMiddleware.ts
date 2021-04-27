import jwtDecode from 'jwt-decode'
import { RequestHandler } from 'express'

import logger from '../../logger'

// TODO HACK this will not be required if authentication is baked into the MVC application
const PUBLIC_URLS = ['/health']

export default function authorisationMiddleware(authorisedRoles: string[] = []): RequestHandler {
  return (req, res, next) => {
    if (res.locals?.user?.token) {
      const { authorities: roles = [] } = jwtDecode(res.locals.user.token) as { authorities?: string[] }

      if (authorisedRoles.length && !roles.some(role => authorisedRoles.includes(role))) {
        logger.error('User is not authorised to access this')
        return res.redirect('/authError')
      }

      return next()
    }

    if (PUBLIC_URLS.some(x => req.url.startsWith(x))) {
      res.locals.publicEndpoint = true
      return next()
    }

    req.session.returnTo = req.originalUrl
    return res.redirect('/login')
  }
}
