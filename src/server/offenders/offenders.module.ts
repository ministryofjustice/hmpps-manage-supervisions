import { Module } from '@nestjs/common'
import { CommonModule } from '../common/common.module'
import { CommunityApiModule } from '../community-api/community-api.module'
import { OffenderController } from './offender/offender.controller'
import { OffenderService } from './offender/offender.service'
import { SentenceService } from './offender/sentence/sentence.service'
import { ScheduleService } from './offender/schedule/schedule.service'
import { ActivityService } from './offender/activity/activity.service'

@Module({
  imports: [CommonModule, CommunityApiModule],
  controllers: [OffenderController],
  providers: [OffenderService, SentenceService, ScheduleService, ActivityService],
})
export class OffendersModule {}
