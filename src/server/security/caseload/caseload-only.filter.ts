import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus } from '@nestjs/common'
import { Response } from 'express'
import { NonCaseloadAccessError } from './caseload.types'

@Catch(NonCaseloadAccessError)
export class CaseloadOnlyFilter implements ExceptionFilter {
  catch(exception: NonCaseloadAccessError, host: ArgumentsHost) {
    host
      .switchToHttp()
      .getResponse<Response>()
      .status(HttpStatus.FORBIDDEN)
      .render('security/caseload/not-on-caseload', { crn: exception.crn })
  }
}
