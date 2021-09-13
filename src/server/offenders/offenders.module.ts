import { Module } from '@nestjs/common'
import { CommonModule } from '../common/common.module'
import { CommunityApiModule } from '../community-api/community-api.module'
import { AssessRisksAndNeedsApiModule } from '../assess-risks-and-needs-api/assess-risks-and-needs-api.module'
import { OffenderController } from './offender/offender.controller'
import { OffenderService } from './offender/offender.service'
import { SentenceService } from './offender/sentence'
import { ScheduleService } from './offender/schedule'
import { ActivityService } from './offender/activity'
import { RiskService } from './offender/risk'
import { PersonalController } from './offender/personal/personal.controller'
import { PersonalService } from './offender/personal'
import { ActivityController } from './offender/activity/activity.controller'
import { RequirementService } from './offender/sentence/requirement.service'
import { ContactTypesService } from '../community-api'
import { ComplianceService } from './offender/sentence/compliance.service'
import { RiskController } from './offender/risk/risk.controller'
import { SentenceController } from './offender/sentence/sentence.controller'
import { ExitController } from './offender/exit/exit.controller'

@Module({
  imports: [CommonModule, CommunityApiModule, AssessRisksAndNeedsApiModule],
  controllers: [
    OffenderController,
    PersonalController,
    ExitController,
    ActivityController,
    RiskController,
    SentenceController,
  ],
  providers: [
    OffenderService,
    SentenceService,
    ScheduleService,
    ActivityService,
    RiskService,
    PersonalService,
    RequirementService,
    ContactTypesService,
    ComplianceService,
  ],
})
export class OffendersModule {}
