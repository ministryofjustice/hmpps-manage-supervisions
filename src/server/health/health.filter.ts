import { Catch, ExceptionFilter, ArgumentsHost } from '@nestjs/common'
import { HealthException } from './types'

@Catch(HealthException)
export class HealthFilter implements ExceptionFilter {
  catch(exception: HealthException, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse()
    response.status(503).json(exception.health)
  }
}
