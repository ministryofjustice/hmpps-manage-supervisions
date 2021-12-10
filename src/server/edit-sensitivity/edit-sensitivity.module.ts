import { Module } from '@nestjs/common'
import { EditSensitivityController } from './edit-sensitivity.controller'
import { EditSensitivityService } from './edit-sensitivity.service'
import { CommunityApiModule } from '../community-api/community-api.module'

@Module({
  imports: [CommunityApiModule],
  controllers: [EditSensitivityController],
  providers: [EditSensitivityService],
})
export class EditSensitivityModule {}
