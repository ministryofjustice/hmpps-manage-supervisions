import { Module } from '@nestjs/common'
import { CommonModule } from '../common/common.module'
import { CommunityApiService } from './community-api.service'
import { ContactMappingService } from './contact-mapping'
import { BreachService } from './breach'
import { RequirementService, ConvictionService } from './conviction'
import { EligibilityService } from './eligibility'

@Module({
  imports: [CommonModule],
  providers: [
    CommunityApiService,
    ContactMappingService,
    BreachService,
    RequirementService,
    ConvictionService,
    EligibilityService,
  ],
  exports: [
    CommunityApiService,
    ContactMappingService,
    BreachService,
    RequirementService,
    ConvictionService,
    EligibilityService,
  ],
})
export class CommunityApiModule {}
