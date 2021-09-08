import { Module } from '@nestjs/common'
import { CommonModule } from '../common/common.module'
import { CommunityApiModule } from '../community-api/community-api.module'
import { CasesController } from './cases.controller'
import { CasesService } from './cases.service'

@Module({
  imports: [CommonModule, CommunityApiModule],
  providers: [CasesService],
  controllers: [CasesController],
})
export class CasesModule {}
