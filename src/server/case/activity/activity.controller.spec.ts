import { Test } from '@nestjs/testing'
import { ActivityController } from './activity.controller'
import { createStubInstance, match, SinonStubbedInstance } from 'sinon'
import { OffenderService } from '../offender'
import { ActivityService, GetContactsOptions } from './activity.service'
import { MockLinksModule } from '../../common/links/links.mock'
import { BreadcrumbType } from '../../common/links'
import { fakeOffenderDetailSummary, fakePaginated } from '../../community-api/community-api.fake'
import { getDisplayName } from '../../util'
import { fakeActivityLogEntry, fakeActivityLogEntryGroup } from './activity.fake'
import { ContactTypeCategory } from '../../config'
import {
  ActivityComplianceFilter,
  AppointmentActivityLogEntry,
  AppointmentViewModel,
  CommunicationActivityLogEntry,
  CommunicationViewModel,
} from './activity.types'
import { SentenceService } from '../sentence'
import { CasePage } from '../case.types'

describe('ActivityController', () => {
  let subject: ActivityController
  let offenderService: SinonStubbedInstance<OffenderService>
  let activityService: SinonStubbedInstance<ActivityService>
  let sentenceService: SinonStubbedInstance<SentenceService>

  beforeEach(async () => {
    offenderService = createStubInstance(OffenderService)
    activityService = createStubInstance(ActivityService)
    sentenceService = createStubInstance(SentenceService)

    const module = await Test.createTestingModule({
      controllers: [ActivityController],
      providers: [
        { provide: OffenderService, useValue: offenderService },
        { provide: ActivityService, useValue: activityService },
        { provide: SentenceService, useValue: sentenceService },
      ],
      imports: [MockLinksModule],
    }).compile()

    subject = module.get(ActivityController)
  })

  it('gets appointment', async () => {
    const offender = havingOffenderSummary()

    const appointment = fakeActivityLogEntry(
      { type: ContactTypeCategory.Appointment },
      { when: 'future' },
    ) as AppointmentActivityLogEntry
    const displayName = getDisplayName(offender)
    activityService.getAppointment.withArgs('some-crn', 111).resolves(appointment)

    const observed = await subject.getAppointment('some-crn', 111)
    const links = MockLinksModule.of({
      crn: 'some-crn',
      offenderName: displayName,
      entityName: appointment.name,
      id: 111,
      parentOverrides: {
        [BreadcrumbType.Appointment]: BreadcrumbType.CaseSchedule,
      },
    })
    expect(observed).toEqual({
      displayName,
      breadcrumbs: links.breadcrumbs(BreadcrumbType.Appointment),
      appointment,
    } as AppointmentViewModel)
  })

  it('gets communication', async () => {
    const offender = havingOffenderSummary()
    const displayName = getDisplayName(offender)
    const contact = fakeActivityLogEntry({ type: ContactTypeCategory.Communication }) as CommunicationActivityLogEntry
    activityService.getCommunicationContact.withArgs('some-crn', 111, offender).resolves(contact)

    const observed = await subject.getCommunication('some-crn', 111)
    const links = MockLinksModule.of({
      crn: 'some-crn',
      offenderName: displayName,
      entityName: contact.name,
      id: 111,
    })
    expect(observed).toEqual({
      displayName,
      breadcrumbs: links.breadcrumbs(BreadcrumbType.Communication),
      contact,
    } as CommunicationViewModel)
  })

  it('gets activity', async () => {
    const offender = havingOffenderSummary()
    const viewModel: any = { page: CasePage.Activity }
    const stub = offenderService.casePageOf.withArgs(offender, match.any).returns(viewModel)

    const contacts = fakePaginated([fakeActivityLogEntryGroup(), fakeActivityLogEntryGroup()])

    sentenceService.getConvictionId.withArgs('some-crn').resolves(1234)
    activityService.getActivityLogPage
      .withArgs(
        'some-crn',
        offender,
        match({
          convictionId: 1234,
        }),
      )
      .resolves(contacts)

    const observed = await subject.getActivity('some-crn')

    expect(observed).toBe(viewModel)
    expect(stub.getCall(0).args[1]).toEqual({
      page: CasePage.Activity,
      groups: contacts.content,
      pagination: {
        page: contacts.number,
        size: contacts.size,
      },
      filters: {
        'acceptable-absence-appointments': {
          description: 'Acceptable abscences',
          name: 'Acceptable absences',
        },
        appointments: {
          description: 'National Standard appointments',
          name: 'Appointments',
        },
        'without-an-outcome': {
          description: 'National Standard appointments without an outcome',
          name: 'Without an outcome',
        },
        'complied-appointments': {
          description: 'Complied appointments',
          name: 'Complied',
        },
        'failed-to-comply-appointments': {
          description: 'Failures to comply within 12 months',
          name: 'Failures to comply',
        },
        'warning-letters': {
          description: 'Warning letters',
          name: 'Warning letters',
        },
      },
      title: undefined,
      currentFilter: undefined,
    })
  })

  it('gets filtered activity list', async () => {
    const offender = havingOffenderSummary()
    const viewModel: any = { page: CasePage.Activity }
    const stub = offenderService.casePageOf.withArgs(offender, match.any).returns(viewModel)
    const contacts = fakePaginated([fakeActivityLogEntryGroup(), fakeActivityLogEntryGroup()])

    sentenceService.getConvictionId.withArgs('some-crn').resolves(1234)
    activityService.getActivityLogPage
      .withArgs(
        'some-crn',
        offender,
        match({
          convictionId: 1234,
          complianceFilter: ActivityComplianceFilter.CompliedAppointments,
        } as GetContactsOptions),
      )
      .resolves(contacts)

    const observed = await subject.getActivityFiltered('some-crn', ActivityComplianceFilter.CompliedAppointments)

    expect(observed).toBe(viewModel)
    expect(stub.getCall(0).args[1]).toEqual({
      page: CasePage.Activity,
      groups: contacts.content,
      pagination: {
        page: contacts.number,
        size: contacts.size,
      },
      filters: {
        'acceptable-absence-appointments': {
          description: 'Acceptable abscences',
          name: 'Acceptable absences',
        },
        appointments: {
          description: 'National Standard appointments',
          name: 'Appointments',
        },
        'without-an-outcome': {
          description: 'National Standard appointments without an outcome',
          name: 'Without an outcome',
        },
        'complied-appointments': {
          description: 'Complied appointments',
          name: 'Complied',
        },
        'failed-to-comply-appointments': {
          description: 'Failures to comply within 12 months',
          name: 'Failures to comply',
        },
        'warning-letters': {
          description: 'Warning letters',
          name: 'Warning letters',
        },
      },
      title: 'Complied appointments',
      currentFilter: ActivityComplianceFilter.CompliedAppointments,
    })
  })

  function havingOffenderSummary() {
    const offender = fakeOffenderDetailSummary({
      otherIds: { crn: 'some-crn', pncNumber: 'some-pnc' },
      firstName: 'Liz',
      middleNames: ['Danger'],
      surname: 'Haggis',
      preferredName: 'Bob',
    })
    offenderService.getOffenderSummary.withArgs('some-crn').resolves(offender)
    return offender
  }
})
