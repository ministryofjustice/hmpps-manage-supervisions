import { CallHandler, ExecutionContext, HttpException, Injectable, NestInterceptor } from '@nestjs/common'
import { tap, map, Observable } from 'rxjs'
import { Request, Response } from 'express'
import { Reflector } from '@nestjs/core'
import {
  DYNAMIC_REDIRECT_KEY,
  DYNAMIC_RENDER_KEY,
  DynamicRedirectOptions,
  DynamicRenderOptions,
} from './dynamic-routing.types'
import { RedirectResponse } from './redirect-response'

@Injectable()
export class DynamicRoutingInterceptor implements NestInterceptor {
  constructor(private readonly reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const host = context.switchToHttp()
    const request = host.getRequest<Request>()
    const response = host.getResponse<Response>()

    const { templateFn } =
      this.reflector.getAllAndOverride<DynamicRenderOptions>(DYNAMIC_RENDER_KEY, [
        context.getHandler(),
        context.getClass(),
      ]) || {}

    const { enabled: redirectEnabled } =
      this.reflector.getAllAndOverride<DynamicRedirectOptions>(DYNAMIC_REDIRECT_KEY, [
        context.getHandler(),
        context.getClass(),
      ]) || {}

    let result = next.handle()

    if (redirectEnabled) {
      result = result.pipe(
        tap(model => {
          if (model instanceof RedirectResponse) {
            throw new HttpException({ url: model.url }, model.statusCode)
          }
        }),
      )
    }

    if (templateFn) {
      result = result.pipe(
        map(async model => {
          const templateUrl = templateFn(request, model)
          return await new Promise((resolve, reject) =>
            response.render(templateUrl, model, (err, res) => {
              if (err) reject(err)
              else resolve(res)
            }),
          )
        }),
      )
    }

    return result
  }
}
