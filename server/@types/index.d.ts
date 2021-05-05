// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Session } from 'express-session'

declare module 'express-session' {
  interface Session {
    returnTo?: string
    nowInMinutes?: number
  }
}

declare global {
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
}
