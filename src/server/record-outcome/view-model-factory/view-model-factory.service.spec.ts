import { Test } from '@nestjs/testing'
import { ViewModelFactoryService } from './view-model-factory.service'
import { MockLinksModule } from '../../common/links/links.mock'
import { RecordOutcomeSession } from '../record-outcome.dto'
import {
  ComplianceOption,
  RecordOutcomeInitViewModel,
  RecordOutcomeStep,
  RecordOutcomeViewModel,
} from '../record-outcome.types'
import { DateTime } from 'luxon'
import { BreadcrumbType } from '../../common/links'
import { fakeRecordOutcomeDto } from '../record-outcome.fake'

describe('ViewModelFactoryService', () => {
  let subject: ViewModelFactoryService
  const session = {
    crn: 'some-crn',
    dto: { appointment: { id: 10, name: 'some-appointment', start: '2021-11-08', end: '2021-11-09' } },
    breadcrumbOptions: { entityName: 'some-entity' },
  } as RecordOutcomeSession

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [MockLinksModule],
      providers: [ViewModelFactoryService],
    }).compile()

    subject = module.get(ViewModelFactoryService)
  })

  it('builds init view model', () => {
    const observed = subject.init(session, '/next')

    const links = MockLinksModule.of({ crn: 'some-crn', entityName: 'some-entity' })
    expect(observed).toEqual({
      appointment: {
        id: 10,
        name: 'some-appointment',
        start: DateTime.fromISO('2021-11-08'),
        end: DateTime.fromISO('2021-11-09'),
      },
      breadcrumbs: links.breadcrumbs(BreadcrumbType.RecordOutcome),
      paths: {
        viewAppointment: links.url(BreadcrumbType.Appointment),
        next: '/next',
      },
    } as RecordOutcomeInitViewModel)
  })
  it('compliance', () => {
    const body = fakeRecordOutcomeDto({
      compliance: ComplianceOption.ComplianceAcceptable,
    })
    const session = {
      crn: 'some-crn',
      dto: {
        appointment: { id: 10, name: 'some-appointment', start: '2021-11-08', end: '2021-11-09' },
        offender: { firstName: 'Daniel' },
      },
      breadcrumbOptions: { entityName: 'some-entity' },
    } as RecordOutcomeSession
    const observed = subject.compliance(session, body)
    expect(observed).toEqual({
      errors: [],
      step: RecordOutcomeStep.Compliance,
      offenderFirstName: 'Daniel',
      compliance: ComplianceOption.ComplianceAcceptable,
      paths: { back: './' },
    } as RecordOutcomeViewModel)
  })
})
