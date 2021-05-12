import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from '@nestjs/common'
import type { Response } from 'express'

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name)

  catch(exception: Error, host: ArgumentsHost) {
    const response: Response = host.switchToHttp().getResponse()

    if (exception instanceof HttpException) {
      return this.handleHttpException(exception, response)
    }

    return this.renderErrorPage(exception, response)
  }

  private renderErrorPage(exception: Error, response: Response, status = 500) {
    const viewModel = { message: exception.message, status, stack: exception.stack }
    this.logger.error(JSON.stringify(viewModel))
    return response.status(status).render('pages/error', viewModel)
  }

  private handleHttpException(exception: HttpException, response: Response) {
    const status = exception.getStatus()
    const meta: any = exception.getResponse()

    switch (status) {
      case HttpStatus.FORBIDDEN:
        return response.redirect('/login')

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
        return this.renderErrorPage(exception, response, status)
    }
  }
}
