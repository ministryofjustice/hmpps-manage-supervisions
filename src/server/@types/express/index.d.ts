/// <reference types="express" />

interface User {
  token: string
  refreshToken?: string
  authorities: string[]
  scope: string[]
  name: string
  displayName: string
  username: string
  active: boolean
  authSource: string
  userId: string
  uuid: string
  staffCode?: string
}

declare namespace Express {
  interface Request {
    user?: User
  }
}
