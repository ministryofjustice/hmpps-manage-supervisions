import { CallHandler, ExecutionContext, HttpException, Injectable, NestInterceptor } from '@nestjs/common'
import { Observable } from 'rxjs'
import { tap } from 'rxjs/operators'
import { RedirectResponse } from './redirect-response'

@Injectable()
export class RedirectInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      tap(x => {
        if (x instanceof RedirectResponse) {
          throw new HttpException({ url: x.url }, x.statusCode)
        }
      }),
    )
  }
}
