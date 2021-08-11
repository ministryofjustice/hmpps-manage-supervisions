import { ConsoleLogger, Module } from '@nestjs/common'
import { ContextualNestLoggerService, LoggerService } from './logger.service'

class MockLoggerService extends ConsoleLogger implements ContextualNestLoggerService {
  child() {
    return this
  }

  of() {
    return this
  }
}

@Module({
  providers: [{ provide: LoggerService, useClass: MockLoggerService }],
  exports: [LoggerService],
})
export class MockLoggerModule {}
