import { Body } from '@nestjs/common'
import { ClassTransformerPipe } from './class-transformer.pipe'

export function BodyClass(...groups: string[]) {
  return Body(new ClassTransformerPipe({ groups }))
}
