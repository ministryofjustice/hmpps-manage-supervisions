import { RedirectResponse as NestRedirectResponse } from '@nestjs/core/router/router-response-controller'
import { HttpStatus } from '@nestjs/common'

export class RedirectResponse implements NestRedirectResponse {
  constructor(
    public readonly url: string,
    public readonly statusCode:
      | HttpStatus.MOVED_PERMANENTLY
      | HttpStatus.FOUND
      | HttpStatus.SEE_OTHER
      | HttpStatus.NOT_MODIFIED
      | HttpStatus.TEMPORARY_REDIRECT
      | HttpStatus.PERMANENT_REDIRECT,
  ) {}

  static found(url: string) {
    return new RedirectResponse(url, HttpStatus.FOUND)
  }
}
