import { Module } from '@nestjs/common'
import { DeliusApiService } from './delius-api.service'
import { CommonModule } from '../common/common.module'

@Module({
  imports: [CommonModule],
  providers: [DeliusApiService],
  exports: [DeliusApiService],
})
export class DeliusApiModule {}
