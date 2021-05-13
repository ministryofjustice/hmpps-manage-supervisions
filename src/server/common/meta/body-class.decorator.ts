import { Body } from '@nestjs/common'
import { ClassTransformerPipe } from './class-transformer.pipe'

export const BodyClass = () => Body(ClassTransformerPipe)
