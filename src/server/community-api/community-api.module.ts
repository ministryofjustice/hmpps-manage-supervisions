import { Module } from '@nestjs/common'
import { CommonModule } from '../common/common.module'
import { CommunityApiService } from './community-api.service'
import { ContactMappingService } from './contact-mapping'
import { ContactTypesService } from './contact-types'
import { BreachService } from './breach'

@Module({
  imports: [CommonModule],
  exports: [CommunityApiService, ContactMappingService, ContactTypesService, BreachService],
  providers: [CommunityApiService, ContactMappingService, ContactTypesService, BreachService],
})
export class CommunityApiModule {}
