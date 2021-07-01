import { Module } from '@nestjs/common'
import { CommonModule } from '../common/common.module'
import { AssessRisksAndNeedsApiService } from './assess-risks-and-needs-api.service'

@Module({
  imports: [CommonModule],
  exports: [AssessRisksAndNeedsApiService],
  providers: [AssessRisksAndNeedsApiService],
})
export class AssessRisksAndNeedsApiModule {}
