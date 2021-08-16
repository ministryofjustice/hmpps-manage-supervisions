import { Module } from '@nestjs/common'
import { HttpModule } from '@nestjs/axios'
import { HealthService } from './health.service'
import { HealthController } from './health.controller'

@Module({
  imports: [HttpModule],
  controllers: [HealthController],
  providers: [HealthService],
})
export class HealthModule {}
