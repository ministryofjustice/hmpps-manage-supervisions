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
    token: string
    name: string
    displayName: string
    username: string
    active: boolean
    authSource: string
    userId: string
    uuid: string
  }
  namespace Express {
    interface Request {
      verified?: boolean
      user: UserPrincipal
    }
  }
}
