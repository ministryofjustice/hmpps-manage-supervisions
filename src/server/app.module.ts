import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { configFactory } from './config'
import { HealthModule } from './health/health.module'
import { HomeModule } from './home/home.module'
import { SecurityModule } from './security/security.module'
import { APP_FILTER } from '@nestjs/core'
import { HttpExceptionFilter } from './http-exception.filter'
import { ArrangeAppointmentModule } from './arrange-appointment/arrange-appointment.module'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [configFactory] }),
    HealthModule,
    HomeModule,
    SecurityModule,
    ArrangeAppointmentModule,
  ],
  providers: [{ provide: APP_FILTER, useClass: HttpExceptionFilter }],
})
export class AppModule {}
