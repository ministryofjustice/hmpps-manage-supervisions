import { HttpModule, Module } from '@nestjs/common'
import { HealthService } from './health.service'
import { HealthController } from './health.controller'

@Module({
  imports: [HttpModule],
  controllers: [HealthController],
  providers: [HealthService],
})
export class HealthModule {}
