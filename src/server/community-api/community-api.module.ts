import { Module } from '@nestjs/common'
import { CommonModule } from '../common/common.module'
import { CommunityApiService } from './community-api.service'

@Module({
  imports: [CommonModule],
  exports: [CommunityApiService],
  providers: [CommunityApiService],
})
export class CommunityApiModule {}
