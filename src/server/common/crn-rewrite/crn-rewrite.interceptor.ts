import { CallHandler, ExecutionContext, HttpException, HttpStatus, Injectable, NestInterceptor } from '@nestjs/common'
import type { Request } from 'express'
import { Observable } from 'rxjs'

@Injectable()
export class CrnRewriteInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const crn = context.switchToHttp().getRequest<Request>().params?.crn
    if (crn && crn != crn.toUpperCase()) {
      throw new HttpException(
        { url: context.switchToHttp().getRequest().url.replace(crn, crn.toUpperCase()) },
        HttpStatus.MOVED_PERMANENTLY,
      )
    }
    return next.handle()
  }
}
