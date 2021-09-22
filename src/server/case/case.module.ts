import { Module } from '@nestjs/common'
import { CommonModule } from '../common/common.module'
import { CommunityApiModule } from '../community-api/community-api.module'
import { AssessRisksAndNeedsApiModule } from '../assess-risks-and-needs-api/assess-risks-and-needs-api.module'
import { CaseController } from './case.controller'
import { OffenderService } from './offender'
import { SentenceService } from './sentence'
import { ScheduleService } from './schedule'
import { ActivityService } from './activity'
import { RiskService } from './risk'
import { PersonalController } from './personal/personal.controller'
import { PersonalService } from './personal'
import { ActivityController } from './activity/activity.controller'
import { RequirementService } from './sentence/requirement.service'
import { ComplianceService } from './compliance'
import { RiskController } from './risk/risk.controller'
import { SentenceController } from './sentence/sentence.controller'
import { ExitController } from './exit/exit.controller'
import { ActivityLogEntryService } from './activity/activity-log-entry.service'
import { ScheduleController } from './schedule/schedule.controller'
import { ComplianceController } from './compliance/compliance.controller'

@Module({
  imports: [CommonModule, CommunityApiModule, AssessRisksAndNeedsApiModule],
  controllers: [
    CaseController,
    PersonalController,
    ExitController,
    ActivityController,
    RiskController,
    SentenceController,
    ScheduleController,
    ComplianceController,
  ],
  providers: [
    OffenderService,
    SentenceService,
    ScheduleService,
    ActivityService,
    RiskService,
    PersonalService,
    RequirementService,
    ComplianceService,
    ActivityLogEntryService,
  ],
})
export class CaseModule {}
