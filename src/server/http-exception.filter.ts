import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from '@nestjs/common'
import type { Request, Response } from 'express'
import { SanitisedAxiosError } from './common/rest'
import { LoginService } from './security/login/login.service'
import { Config, ServerConfig } from './config'
import { ConfigService } from '@nestjs/config'
import { NotDeliusUserError } from './common/NotDeliusUserError'

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name)

  catch(exception: Error, host: ArgumentsHost) {
    if (exception instanceof HttpException) {
      return this.handleHttpException(exception, host)
    }

    if (exception instanceof SanitisedAxiosError) {
      return this.handleAxiosError(exception, host)
    }
    if (exception instanceof NotDeliusUserError) {
      return this.handleNotDeliusUserError(host)
    }
    return this.renderErrorPage(exception, host)
  }

  private renderErrorPage(exception: Error, host: ArgumentsHost, status = HttpStatus.INTERNAL_SERVER_ERROR) {
    const { isProduction } = this.config.get<ServerConfig>('server')
    const viewModel = {
      message: isProduction ? null : exception.message,
      status,
      stack: isProduction ? null : exception.stack,
    }
    this.logger.error('unhandled exception', exception)
    return host.switchToHttp().getResponse<Response>().status(status).render('pages/error', viewModel)
  }
  private renderNotFoundPage(exception: Error, host: ArgumentsHost) {
    this.logger.error('unhandled exception', exception)
    return host.switchToHttp().getResponse<Response>().status(HttpStatus.NOT_FOUND).render('pages/not-found')
  }

  private handleAxiosError(exception: SanitisedAxiosError, host: ArgumentsHost) {
    switch (exception.response?.status) {
      case HttpStatus.NOT_FOUND:
        return this.renderNotFoundPage(exception, host)

      default:
        return this.renderErrorPage(exception, host)
    }
  }

  private handleHttpException(exception: HttpException, host: ArgumentsHost) {
    const http = host.switchToHttp()
    const request = http.getRequest<Request>()
    const response = http.getResponse<Response>()
    const status = exception.getStatus()
    const meta: any = exception.getResponse()

    switch (status) {
      case HttpStatus.FORBIDDEN:
        // the authentication guard failed => redirect to login
        request.logout()
        return response.redirect(`/login?${LoginService.REDIRECT_PARAM}=${encodeURIComponent(request.originalUrl)}`)

      case HttpStatus.UNAUTHORIZED:
        // the authorization guard failed
        // or result of oauth failure eg invalid callback, user profile does not exist => display unauthorized page
        // => display unauthorized page
        return response.status(status).render('pages/unauthorized')

      case HttpStatus.MOVED_PERMANENTLY:
      case HttpStatus.FOUND:
      case HttpStatus.SEE_OTHER:
      case HttpStatus.NOT_MODIFIED:
      case HttpStatus.TEMPORARY_REDIRECT:
      case HttpStatus.PERMANENT_REDIRECT:
        if (typeof meta === 'object' && 'url' in meta) {
          return response.redirect(meta.url, status)
        }
        return this.renderErrorPage(new Error('Invalid redirect'), host)

      default:
        return this.renderErrorPage(exception, host, status)
    }
  }
  constructor(private readonly config: ConfigService<Config>) {}

  private handleNotDeliusUserError(host: ArgumentsHost) {
    const http = host.switchToHttp()
    const response = http.getResponse<Response>()
    return response.status(HttpStatus.UNAUTHORIZED).render('pages/not-delius-user')
  }
}
