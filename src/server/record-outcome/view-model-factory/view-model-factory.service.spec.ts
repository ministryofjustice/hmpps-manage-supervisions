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
import { StateMachineService } from '../state-machine/state-machine.service'
import { createStubInstance, SinonStubbedInstance } from 'sinon'
import { classToPlain } from 'class-transformer'
import { DEFAULT_GROUP } from '../../util/mapping'

describe('ViewModelFactoryService', () => {
  let subject: ViewModelFactoryService
  let service: SinonStubbedInstance<StateMachineService>

  // TODO: I wanted to use fakeRecordOutcomeDto() here, but ran into issues with the date fields
  // fakeRecordOutcomeDto() converts the DateTimes to strings ready for plainToClass, but the partial
  // then gets merged over the top replacing them with DateTimes, which then results in an error.
  const dto = {
    appointment: {
      id: 10,
      name: 'some-appointment',
      start: '2021-11-08',
      end: '2021-11-09',
      contactTypeCode: 'OFF1',
    },
    offender: { offenderId: 1, firstName: 'Daniel' },
    compliance: ComplianceOption.FailedToComply,
    availableOutcomeTypes: {
      outcomeTypes: [
        {
          code: 'DNC',
          description: 'Did not comply',
          compliantAcceptable: false,
          attendance: true,
          enforcements: [
            {
              code: 'ROM',
            },
          ],
        },
        {
          code: 'DNA',
          description: 'Didnt attend',
          compliantAcceptable: false,
          attendance: false,
          enforcements: [
            {
              code: 'ROM',
            },
          ],
        },
        {
          code: 'OK',
          description: 'Compliant attended',
          compliantAcceptable: true,
          attendance: true,
          enforcements: [
            {
              code: 'ROM',
            },
          ],
        },
        {
          code: 'AA',
          description: 'Acceptable absence',
          compliantAcceptable: true,
          attendance: true,
          enforcements: [
            {
              code: 'ROM',
            },
          ],
        },
      ],
    },
  }

  const session: RecordOutcomeSession = {
    crn: 'some-crn',
    dto: classToPlain(dto, { groups: [DEFAULT_GROUP] }),
    breadcrumbOptions: { entityName: 'some-entity' },
  } as RecordOutcomeSession

  beforeAll(async () => {
    service = createStubInstance(StateMachineService)

    const module = await Test.createTestingModule({
      imports: [MockLinksModule],
      providers: [ViewModelFactoryService, { provide: StateMachineService, useValue: service }],
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
        start: DateTime.fromISO(dto.appointment.start),
        end: DateTime.fromISO(dto.appointment.end),
        contactTypeCode: 'OFF1',
      },
      breadcrumbs: links.breadcrumbs(BreadcrumbType.RecordOutcome),
      paths: {
        viewAppointment: links.url(BreadcrumbType.Appointment),
        next: '/next',
      },
    } as RecordOutcomeInitViewModel)
  })

  it('compliance', () => {
    const body = fakeRecordOutcomeDto(
      {
        compliance: ComplianceOption.ComplianceAcceptable,
      },
      { groups: [RecordOutcomeStep.Compliance] },
    )

    const observed = subject.compliance(session, body)
    expect(observed).toEqual({
      errors: [],
      step: RecordOutcomeStep.Compliance,
      offenderFirstName: 'Daniel',
      compliance: ComplianceOption.ComplianceAcceptable,
      paths: { back: './' },
    } as RecordOutcomeViewModel)
  })
  it('failed-to-attend', () => {
    const body = fakeRecordOutcomeDto({
      acceptableAbsence: true,
    })
    service.getBackUrl.returns('/compliance')

    const observed = subject['failed-to-attend'](session, body)
    expect(observed).toEqual({
      errors: [],
      step: RecordOutcomeStep.FailedToAttend,
      offenderFirstName: 'Daniel',
      acceptableAbsence: true,
      paths: { back: '/compliance' },
    } as RecordOutcomeViewModel)
  })

  it('outcome', () => {
    const body = fakeRecordOutcomeDto(
      {
        outcome: 'DNC',
      },
      { groups: [RecordOutcomeStep.Outcome] },
    )

    service.getBackUrl.returns('/previous-page')

    const observed = subject.outcome(session, body)

    expect(observed).toEqual({
      acceptableAbsence: false,
      step: RecordOutcomeStep.Outcome,
      offenderFirstName: 'Daniel',
      errors: [],
      outcome: 'DNC',
      outcomes: [
        {
          code: 'DNC',
          description: 'Did not comply',
        },
      ],
      paths: {
        back: '/previous-page',
      },
    } as RecordOutcomeViewModel)
  })
})
