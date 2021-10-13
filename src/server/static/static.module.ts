import { Module } from '@nestjs/common'
import { CommonModule } from '../common/common.module'
import { StaticController } from './static.controller'

@Module({
  imports: [CommonModule],
  controllers: [StaticController],
})
export class StaticModule {}
