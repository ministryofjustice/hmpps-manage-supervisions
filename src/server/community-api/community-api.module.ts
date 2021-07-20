import { Module } from '@nestjs/common'
import { CommonModule } from '../common/common.module'
import { CommunityApiService } from './community-api.service'
import { ContactMappingService } from './contact-mapping'
import { ContactTypesService } from './contact-types'

@Module({
  imports: [CommonModule],
  exports: [CommunityApiService, ContactMappingService, ContactTypesService],
  providers: [CommunityApiService, ContactMappingService, ContactTypesService],
})
export class CommunityApiModule {}
