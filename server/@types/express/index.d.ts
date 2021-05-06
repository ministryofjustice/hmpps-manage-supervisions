/// <reference types="express" />

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

declare namespace Express {
  interface Request {
    user: UserPrincipal
  }
}
