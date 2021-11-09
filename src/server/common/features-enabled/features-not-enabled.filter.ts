import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus } from '@nestjs/common'
import { FeaturesNotEnabledError } from './features-enabled.types'
import { Response } from 'express'

@Catch(FeaturesNotEnabledError)
export class FeaturesNotEnabledFilter implements ExceptionFilter<FeaturesNotEnabledError> {
  catch(exception: FeaturesNotEnabledError, host: ArgumentsHost) {
    host
      .switchToHttp()
      .getResponse<Response>()
      .status(HttpStatus.FORBIDDEN)
      .render('common/features-enabled/features-not-enabled')
  }
}
