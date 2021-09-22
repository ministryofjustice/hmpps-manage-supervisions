import { Module } from '@nestjs/common'
import { CommonModule } from '../common/common.module'
import { CommunityApiService } from './community-api.service'
import { ContactMappingService } from './contact-mapping'
import { BreachService } from './breach'

@Module({
  imports: [CommonModule],
  exports: [CommunityApiService, ContactMappingService, BreachService],
  providers: [CommunityApiService, ContactMappingService, BreachService],
})
export class CommunityApiModule {}
