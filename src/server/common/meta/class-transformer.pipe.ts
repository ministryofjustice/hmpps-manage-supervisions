import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common'
import { plainToClass } from 'class-transformer'

@Injectable()
export class ClassTransformerPipe implements PipeTransform<any> {
  transform(value: any, { metatype }: ArgumentMetadata) {
    if (!metatype) {
      return value
    }
    return plainToClass(metatype, value, { excludeExtraneousValues: true })
  }
}
