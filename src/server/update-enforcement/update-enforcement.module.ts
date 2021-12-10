import { Module } from '@nestjs/common'
import { CommonModule } from '../common/common.module'
import { CommunityApiModule } from '../community-api/community-api.module'
import { DeliusApiModule } from '../delius-api/delius-api.module'
import { UpdateEnforcementController } from './update-enforcement.controller'
import { UpdateEnforcementService } from './update-enforcement.service'

@Module({
  imports: [CommonModule, CommunityApiModule, DeliusApiModule],
  controllers: [UpdateEnforcementController],
  providers: [UpdateEnforcementService],
})
export class UpdateEnforcementModule {}
