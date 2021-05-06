export default {}

declare module 'express-session' {
  interface Session {
    returnTo?: string
    nowInMinutes?: number
  }
}
