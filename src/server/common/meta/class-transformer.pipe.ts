import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common'
import { plainToClass, TransformOptions } from 'class-transformer'

@Injectable()
export class ClassTransformerPipe implements PipeTransform {
  constructor(private readonly options: TransformOptions) {}

  transform(value: any, { metatype }: ArgumentMetadata) {
    if (!metatype) {
      return value
    }
    return plainToClass(metatype, value, { ...this.options, excludeExtraneousValues: true })
  }
}
