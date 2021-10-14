import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common'
import { Observable, of } from 'rxjs'

@Injectable()
export class CrnInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const crn = context.switchToHttp().getRequest()?.params?.crn
    if (crn && crn != crn.toUpperCase()) {
      const response = context.switchToHttp().getResponse()
      // throw new HttpException({ url: context.switchToHttp().getRequest().url.replace(crn, crn.toUpperCase()) }, HttpStatus.MOVED_PERMANENTLY)
      response.redirect(context.switchToHttp().getRequest().url.replace(crn, crn.toUpperCase()))
      return of()
    }
    return next.handle()
  }
}
