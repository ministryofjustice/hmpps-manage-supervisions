import { Module } from '@nestjs/common'
import { CommonModule } from '../common/common.module'
import { CommunityApiModule } from '../community-api/community-api.module'
import { OffenderController } from './offender/offender.controller'
import { OffenderService } from './offender/offender.service'

@Module({
  imports: [CommonModule, CommunityApiModule],
  controllers: [OffenderController],
  providers: [OffenderService],
})
export class OffendersModule {}
