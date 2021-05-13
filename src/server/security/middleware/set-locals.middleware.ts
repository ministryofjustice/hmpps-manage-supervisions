import type { Request, Response, NextFunction } from 'express'

export function setLocals(req: Request, res: Response, next: NextFunction) {
  res.locals.user = req.user
  if (typeof req.csrfToken === 'function') {
    res.locals.csrfToken = req.csrfToken()
  }
  next()
}
