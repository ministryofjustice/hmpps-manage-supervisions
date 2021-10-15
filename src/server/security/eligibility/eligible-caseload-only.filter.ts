import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus } from '@nestjs/common'
import { Response } from 'express'
import { NonEligibleCaseloadAccessError } from './eligibility.types'

@Catch(NonEligibleCaseloadAccessError)
export class EligibleCaseloadOnlyFilter implements ExceptionFilter {
  catch(exception: NonEligibleCaseloadAccessError, host: ArgumentsHost) {
    host
      .switchToHttp()
      .getResponse<Response>()
      .status(HttpStatus.FORBIDDEN)
      .render('security/eligibility/not-on-eligible-caseload')
  }
}
