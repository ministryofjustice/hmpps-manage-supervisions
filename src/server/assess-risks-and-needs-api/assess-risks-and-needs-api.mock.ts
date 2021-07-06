import { DynamicModule, Module } from '@nestjs/common'
import { AssessRisksAndNeedsApiService } from './assess-risks-and-needs-api.service'
import { SinonStubbedInstance, createStubInstance } from 'sinon'
import { RisksControllerApi } from './client'

export type MockAssessRisksAndNeedsApiService = {
  [P in keyof AssessRisksAndNeedsApiService]: SinonStubbedInstance<AssessRisksAndNeedsApiService[P]>
}

@Module({})
export class MockAssessRisksAndNeedsApiModule {
  static register(): DynamicModule {
    const stub: MockAssessRisksAndNeedsApiService = {
      risk: createStubInstance(RisksControllerApi),
    }

    return {
      module: MockAssessRisksAndNeedsApiModule,
      providers: [{ provide: AssessRisksAndNeedsApiService, useValue: stub }],
      exports: [AssessRisksAndNeedsApiService],
    }
  }
}
