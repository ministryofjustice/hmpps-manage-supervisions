import { Module } from '@nestjs/common'
import { CommonModule } from '../common/common.module'
import { CommunityApiModule } from '../community-api/community-api.module'
import { AssessRisksAndNeedsApiModule } from '../assess-risks-and-needs-api/assess-risks-and-needs-api.module'
import { OffenderController } from './offender/offender.controller'
import { OffenderService } from './offender/offender.service'
import { SentenceService } from './offender/sentence/sentence.service'
import { ScheduleService } from './offender/schedule/schedule.service'
import { ActivityService } from './offender/activity/activity.service'
import { RiskService } from './offender/risk/risk.service'
import { PersonalController } from './offender/personal/personal.controller'
import { PersonalService } from './offender/personal/personal.service'
import { DeliusExitController } from './offender/delius-exit/delius-exit.controller'

@Module({
  imports: [CommonModule, CommunityApiModule, AssessRisksAndNeedsApiModule],
  controllers: [OffenderController, PersonalController, DeliusExitController],
  providers: [OffenderService, SentenceService, ScheduleService, ActivityService, RiskService, PersonalService],
})
export class OffendersModule {}
