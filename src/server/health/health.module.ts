import { Module } from '@nestjs/common'
import { HealthService } from './health.service'
import { HealthController } from './health.controller'
import { CommonModule } from '../common/common.module'
import { OpenApiVersionService } from './open-api-version'

@Module({
  controllers: [HealthController],
  providers: [HealthService, OpenApiVersionService],
  imports: [CommonModule],
})
export class HealthModule {}
