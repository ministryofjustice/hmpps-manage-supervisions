import { Module } from '@nestjs/common'
import { SessionBuilderService } from './session-builder/session-builder.service'
import { ViewModelFactoryService } from './view-model-factory/view-model-factory.service'
import { StateMachineService } from './state-machine/state-machine.service'
import { RecordOutcomeService } from './record-outcome.service'
import { RecordOutcomeController } from './record-outcome.controller'
import { CommonModule } from '../common/common.module'
import { CommunityApiModule } from '../community-api/community-api.module'
import { DeliusApiModule } from '../delius-api/delius-api.module'

@Module({
  imports: [CommonModule, CommunityApiModule, DeliusApiModule],
  providers: [SessionBuilderService, ViewModelFactoryService, StateMachineService, RecordOutcomeService],
  controllers: [RecordOutcomeController],
})
export class RecordOutcomeModule {}
