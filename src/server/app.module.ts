import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { configFactory, ServerConfig } from './config'
import { HealthModule } from './health/health.module'
import { SecurityModule } from './security/security.module'
import { APP_FILTER } from '@nestjs/core'
import { HttpExceptionFilter } from './http-exception.filter'
import { ArrangeAppointmentModule } from './arrange-appointment/arrange-appointment.module'
import { CommunityApiModule } from './community-api/community-api.module'
import { CaseModule } from './case/case.module'
import { LoggerModule } from './logger/logger.module'
import { CasesModule } from './cases/cases.module'
import { StaticModule } from './static/static.module'
import { SentryModule } from '@ntegral/nestjs-sentry'
import { RecordOutcomeModule } from './record-outcome/record-outcome.module'
import { EditSensitivityModule } from './edit-sensitivity/edit-sensitivity.module'

@Module({
  imports: [
    SentryModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => {
        const { deploymentEnvironment, version, sentryDsn } = config.get<ServerConfig>('server')
        return {
          environment: deploymentEnvironment,
          release: version,
          dsn: sentryDsn,
        }
      },
      inject: [ConfigService],
    }),
    ConfigModule.forRoot({ isGlobal: true, load: [configFactory] }),
    HealthModule,
    CasesModule,
    StaticModule,
    SecurityModule,
    LoggerModule,
    ArrangeAppointmentModule,
    CommunityApiModule,
    CaseModule,
    RecordOutcomeModule,
    EditSensitivityModule,
  ],
  providers: [{ provide: APP_FILTER, useClass: HttpExceptionFilter }],
})
export class AppModule {}
