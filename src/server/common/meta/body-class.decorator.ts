import { ArgumentMetadata, Body, createParamDecorator, ExecutionContext, PipeTransform } from '@nestjs/common'
import { ClassTransformerPipe } from './class-transformer.pipe'
import { Request } from 'express'
import { plainToClass } from 'class-transformer'

export function BodyClass(...groups: string[]) {
  return Body(new ClassTransformerPipe({ groups }))
}

export function BodyClassFromParam(param: string) {
  return BodyAndParam(param, new ClassTransformerFromBodyAndParamPipe())
}

const BodyAndParam = createParamDecorator((data: string, ctx: ExecutionContext) => {
  if (!data) {
    throw new Error('must provide a param name')
  }
  const { body, params } = ctx.switchToHttp().getRequest<Request>()

  const param = params[data]
  if (!param) {
    throw new Error('invalid param name')
  }

  return { body, param }
})

class ClassTransformerFromBodyAndParamPipe implements PipeTransform {
  transform({ body, param }: { body: any; param: string }, { metatype }: ArgumentMetadata) {
    if (!metatype) {
      return body
    }
    return plainToClass(metatype, body, { groups: [param], excludeExtraneousValues: true })
  }
}
