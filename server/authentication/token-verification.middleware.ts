import { RequestHandler } from 'express'
import { TokenVerificationService } from './TokenVerificationService'
import { Container } from 'typedi'

const PUBLIC_URLS = ['/health']

/**
 * TODO this is essentially doing two things, token verification AND authentication, we should split it
 */
export default function tokenVerificationMiddleware(): RequestHandler {
  const tokenVerification = Container.get(TokenVerificationService)
  return async (req, res, next) => {
    if (req.isAuthenticated()) {
      if (!tokenVerification.isEnabled() || (await tokenVerification.verifyToken(req.user))) {
        return next()
      } else {
        req.logOut()
      }
    }

    if (PUBLIC_URLS.some(x => req.url.startsWith(x))) {
      // TODO HACK this will not be required if authentication is baked into the MVC application
      return next()
    }

    req.session.returnTo = req.originalUrl
    return res.redirect('/login')
  }
}
