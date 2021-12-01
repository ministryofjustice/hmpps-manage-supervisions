import { createStubInstance, SinonStubbedInstance } from 'sinon'
import { DynamicModule, Module } from '@nestjs/common'
import { DeliusApiService } from './delius-api.service'
import { ContactV1Api, DocumentV1Api } from './client'

export type MockDeliusApiService = { [P in keyof DeliusApiService]: SinonStubbedInstance<DeliusApiService[P]> }

export function mockDeliusApiService(): MockDeliusApiService {
  return {
    contactV1: createStubInstance(ContactV1Api),
    documentV1: createStubInstance(DocumentV1Api),
  }
}

@Module({})
export class MockDeliusApiModule {
  static register(): DynamicModule {
    return {
      module: MockDeliusApiModule,
      providers: [{ provide: DeliusApiService, useValue: mockDeliusApiService() }],
      exports: [DeliusApiService],
    }
  }
}
