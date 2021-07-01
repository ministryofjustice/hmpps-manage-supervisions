import { DynamicModule, Module } from '@nestjs/common'
import { CommunityApiService } from './community-api.service'
import { SinonStubbedInstance, createStubInstance } from 'sinon'
import {
  AppointmentsApi,
  ContactAndAttendanceApi,
  CoreOffenderApi,
  PersonalCircumstancesApi,
  RisksAndRegistrationsApi,
  SentenceRequirementsAndBreachApi,
  StaffApi,
  TeamsApi,
} from './client'

export type MockCommunityApiService = { [P in keyof CommunityApiService]: SinonStubbedInstance<CommunityApiService[P]> }

@Module({})
export class MockCommunityApiModule {
  static register(): DynamicModule {
    const stub: MockCommunityApiService = {
      appointment: createStubInstance(AppointmentsApi),
      offender: createStubInstance(CoreOffenderApi),
      team: createStubInstance(TeamsApi),
      requirement: createStubInstance(SentenceRequirementsAndBreachApi),
      staff: createStubInstance(StaffApi),
      personalCircumstances: createStubInstance(PersonalCircumstancesApi),
      contactAndAttendance: createStubInstance(ContactAndAttendanceApi),
      risks: createStubInstance(RisksAndRegistrationsApi),
    }

    return {
      module: MockCommunityApiModule,
      providers: [{ provide: CommunityApiService, useValue: stub }],
      exports: [CommunityApiService],
    }
  }
}
