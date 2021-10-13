import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus } from '@nestjs/common'
import { Response } from 'express'
import { NonEligibleCaseloadAccessError } from './eligibility.types'
import { BreadcrumbType, LinksService } from '../../common/links'

@Catch(NonEligibleCaseloadAccessError)
export class EligibleCaseloadOnlyFilter implements ExceptionFilter {
  constructor(private readonly links: LinksService) {}

  catch(exception: NonEligibleCaseloadAccessError, host: ArgumentsHost) {
    host
      .switchToHttp()
      .getResponse<Response>()
      .status(HttpStatus.FORBIDDEN)
      .render('security/eligibility/not-on-eligible-caseload', {
        links: { cases: this.links.getUrl(BreadcrumbType.Cases, {}) },
      })
  }
}
