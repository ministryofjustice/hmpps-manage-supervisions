import { Test } from '@nestjs/testing'
import { ActivityController } from './activity.controller'
import { createStubInstance, match, SinonStubbedInstance } from 'sinon'
import { ActivityService } from './activity.service'
import { MockLinksModule } from '../../common/links/links.mock'
import { BreadcrumbType, UtmMedium } from '../../common/links'
import { fakePaginated } from '../../community-api/community-api.fake'
import { getDisplayName } from '../../util'
import { fakeCaseActivityLogEntry, fakeCaseActivityLogGroup } from './activity.fake'
import { ContactTypeCategory } from '../../config'
import {
  ActivityComplianceFilter,
  AppointmentActivityLogEntry,
  AppointmentViewModel,
  CommunicationActivityLogEntry,
  CommunicationViewModel,
  GetActivityLogOptions,
} from './activity.types'
import { SentenceService } from '../sentence'
import { CaseActivityViewModel, CasePage } from '../case.types'
import { fakeConvictionSummary } from '../sentence/sentence.fake'
import { EligibilityService } from '../../community-api/eligibility'
import { MockOffenderModule, OffenderServiceFixture } from '../offender/offender.mock'

describe('ActivityController', () => {
  let subject: ActivityController
  let offenderServiceFixture: OffenderServiceFixture
  let activityService: SinonStubbedInstance<ActivityService>
  let sentenceService: SinonStubbedInstance<SentenceService>

  beforeEach(async () => {
    activityService = createStubInstance(ActivityService)
    sentenceService = createStubInstance(SentenceService)

    const module = await Test.createTestingModule({
      controllers: [ActivityController],
      providers: [
        { provide: ActivityService, useValue: activityService },
        { provide: SentenceService, useValue: sentenceService },
        { provide: EligibilityService, useValue: null },
      ],
      imports: [MockLinksModule, MockOffenderModule.register()],
    }).compile()

    subject = module.get(ActivityController)
    offenderServiceFixture = module.get(OffenderServiceFixture)
  })

  it('gets appointment', async () => {
    offenderServiceFixture.havingOffender()

    const appointment = fakeCaseActivityLogEntry(
      { type: ContactTypeCategory.Appointment },
      { when: 'future' },
    ) as AppointmentActivityLogEntry
    const displayName = getDisplayName(offenderServiceFixture.offender)
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
    offenderServiceFixture.havingOffender()
    const displayName = getDisplayName(offenderServiceFixture.offender)
    const contact = fakeCaseActivityLogEntry({
      type: ContactTypeCategory.Communication,
    }) as CommunicationActivityLogEntry
    activityService.getCommunicationContact.withArgs('some-crn', 111, offenderServiceFixture.offender).resolves(contact)

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
    offenderServiceFixture.havingOffender().havingCasePageOf()

    const contacts = fakePaginated([fakeCaseActivityLogGroup(), fakeCaseActivityLogGroup()])
    const conviction = fakeConvictionSummary()

    sentenceService.getCurrentConvictionSummary.withArgs('some-crn').resolves(conviction)
    activityService.getActivityLogPage
      .withArgs('some-crn', offenderServiceFixture.offender, match({ conviction }))
      .resolves(contacts)

    const observed = await subject.getActivity('some-crn')

    expect(observed).toBe(offenderServiceFixture.caseViewModel)
    offenderServiceFixture.shouldHaveCalledCasePageOf<CaseActivityViewModel>({
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
        'rar-activity': {
          description: 'Appointments with an associated RAR requirement',
          name: 'RAR activity',
        },
      },
      links: {
        addActivity: offenderServiceFixture.links.url(BreadcrumbType.ExitToDelius, {
          utm: { medium: UtmMedium.ActivityLog, campaign: 'add-activity' },
        }),
      },
    })
  })

  it('gets filtered activity list', async () => {
    offenderServiceFixture.havingOffender().havingCasePageOf()

    const contacts = fakePaginated([fakeCaseActivityLogGroup(), fakeCaseActivityLogGroup()])
    const conviction = fakeConvictionSummary()

    sentenceService.getCurrentConvictionSummary.withArgs('some-crn').resolves(conviction)
    activityService.getActivityLogPage
      .withArgs(
        'some-crn',
        offenderServiceFixture.offender,
        match({ conviction, complianceFilter: ActivityComplianceFilter.CompliedAppointments } as GetActivityLogOptions),
      )
      .resolves(contacts)

    const observed = await subject.getActivityFiltered('some-crn', ActivityComplianceFilter.CompliedAppointments)

    expect(observed).toBe(offenderServiceFixture.caseViewModel)
    offenderServiceFixture.shouldHaveCalledCasePageOf<CaseActivityViewModel>({
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
        'rar-activity': {
          description: 'Appointments with an associated RAR requirement',
          name: 'RAR activity',
        },
      },
      title: 'Complied appointments',
      currentFilter: ActivityComplianceFilter.CompliedAppointments,
      links: {
        addActivity: offenderServiceFixture.links.url(BreadcrumbType.ExitToDelius, {
          utm: { medium: UtmMedium.ActivityLog, campaign: 'add-activity' },
        }),
      },
      breadcrumb: {
        type: BreadcrumbType.CaseActivityLogWithComplianceFilter,
        options: { entityName: 'Complied appointments' },
      },
    })
  })
})
