export class RedirectException extends Error {
  constructor(public url: string, public status: number = 302) {
    super(`redirecting -> ${url}`)
  }
}
