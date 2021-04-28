export default {}

declare module 'express-session' {
  // Declare that the session will potentially contain these additional fields
  interface SessionData {
    returnTo: string
    nowInMinutes: number
  }
}

export declare global {
  interface UserPrincipal {
    username: string
    token: string
  }
  namespace Express {
    interface Request {
      verified?: boolean
      user: UserPrincipal
    }
  }
}
