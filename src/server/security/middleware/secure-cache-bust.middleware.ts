import { NextFunction, Request, Response } from 'express'

export function secureCacheBust(req: Request, res: Response, next: NextFunction) {
  if (req.isAuthenticated()) {
    res.setHeader('Cache-control', 'no-store')
    res.setHeader('Pragma', 'no-cache')
  }
  next()
}
