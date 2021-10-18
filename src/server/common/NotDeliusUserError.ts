export class NotDeliusUserError extends Error {
  constructor(readonly username: string) {
    super(`user '${username}' is not a delius user`)
  }
}
