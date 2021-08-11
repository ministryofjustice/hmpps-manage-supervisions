import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from '@nestjs/common'
import type { Request, Response } from 'express'
import { SanitisedAxiosError } from './common/rest'
import { UrlService } from './security/url/url.service'

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

    return this.renderErrorPage(exception, host)
  }

  private renderErrorPage(exception: Error, host: ArgumentsHost, status = 500) {
    const viewModel = { message: exception.message, status, stack: exception.stack }
    this.logger.error('unhandled exception', exception)
    return host.switchToHttp().getResponse<Response>().status(status).render('pages/error', viewModel)
  }

  private handleAxiosError(exception: SanitisedAxiosError, host: ArgumentsHost) {
    switch (exception.status) {
      case HttpStatus.NOT_FOUND:
        return this.renderErrorPage(exception, host, exception.status)

      default:
        return this.renderErrorPage(exception, host, 500)
    }
  }

  private handleHttpException(exception: HttpException, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<Response>()
    const status = exception.getStatus()
    const meta: any = exception.getResponse()

    switch (status) {
      case HttpStatus.FORBIDDEN: {
        const request = host.switchToHttp().getRequest<Request>()
        request.logout()
        return response.redirect(`/login?${UrlService.REDIRECT_PARAM}=${encodeURIComponent(request.originalUrl)}`)
      }

      case HttpStatus.MOVED_PERMANENTLY:
      case HttpStatus.FOUND:
      case HttpStatus.SEE_OTHER:
      case HttpStatus.NOT_MODIFIED:
      case HttpStatus.TEMPORARY_REDIRECT:
      case HttpStatus.PERMANENT_REDIRECT:
        if (typeof meta === 'object' && 'url' in meta) {
          return response.redirect(meta.url, status)
        }
        return response.status(500).render('pages/error', {
          message: 'Invalid redirect',
          status: 500,
        })

      default:
        return this.renderErrorPage(exception, host, status)
    }
  }
}
