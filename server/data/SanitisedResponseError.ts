import type { ResponseError } from 'superagent'

export class SanitisedResponseError extends Error {
  constructor(
    message: string,
    stack: string,
    public readonly text?: string,
    public readonly status?: number,
    public readonly headers?: any,
    public readonly data?: any,
  ) {
    super(message)
    this.stack = stack
  }
}

export function sanitiseResponseError(error: ResponseError): SanitisedResponseError {
  const { message, stack } = error
  if (error.response) {
    const { text, status, headers, body } = error.response
    return new SanitisedResponseError(message, stack, text, status, headers, body)
  }
  return new SanitisedResponseError(message, stack)
}
