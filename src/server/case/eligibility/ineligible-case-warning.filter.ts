import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus } from '@nestjs/common'
import { IneligibilityCaseWarningRequired } from './eligibility.types'
import { Response } from 'express'
import { LinksService } from '../../common/links'

@Catch(IneligibilityCaseWarningRequired)
export class IneligibleCaseWarningFilter implements ExceptionFilter {
  constructor(private readonly links: LinksService) {}

  catch(exception: IneligibilityCaseWarningRequired, host: ArgumentsHost) {
    host
      .switchToHttp()
      .getResponse<Response>()
      .status(HttpStatus.OK)
      .render('case/eligibility/ineligible-case-warning', {
        links: { continue: this.links.getUrl(exception.page, { crn: exception.crn }) },
      })
  }
}
