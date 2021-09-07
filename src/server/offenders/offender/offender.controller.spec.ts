import { Test } from '@nestjs/testing'
import { createStubInstance, match, SinonStubbedInstance } from 'sinon'
import { OffenderController } from './offender.controller'
import { OffenderService } from './offender.service'
import { OffenderPage, OffenderViewModel } from './offender-view-model'
import { RedirectResponse } from '../../common'
import {
  fakeAppointmentType,
  fakeOffenderDetail,
  fakeOffenderDetailSummary,
  fakePaginated,
} from '../../community-api/community-api.fake'
import {
  fakeContactDetailsViewModel,
  fakePersonalCircumstanceDetail,
  fakePersonalContactDetail,
  fakePersonalDetailsViewModel,
} from './personal/personal.fake'
import { SentenceService } from './sentence'
import { ScheduleService } from './schedule'
import { ActivityComplianceFilter, ActivityService, GetContactsOptions } from './activity'
import { RiskService } from './risk'
import { fakeComplianceDetails, fakeConvictionDetails, fakeConvictionRequirement } from './sentence/sentence.fake'
import { fakeActivityLogEntry } from './activity/activity.fake'
import { fakeAppointmentListViewModel, fakeNextAppointmentSummary } from './schedule/schedule.fake'
import { MockLinksModule } from '../../common/links/links.mock'
import { PersonalService } from './personal'
import { BreadcrumbType } from '../../common/links'
import { fakeCriminogenicNeed, fakeRiskRegistrations, fakeRisks } from './risk/risk.fake'
import { ConfigService } from '@nestjs/config'
import { FakeConfigModule } from '../../config/config.fake'
import { ContactTypesService } from '../../community-api'
import { FeatureFlags } from '../../config'
import { getDisplayName } from '../../util'

describe('OffenderController', () => {
  let subject: OffenderController
  let offenderService: SinonStubbedInstance<OffenderService>
  let scheduleService: SinonStubbedInstance<ScheduleService>
  let activityService: SinonStubbedInstance<ActivityService>
  let sentenceService: SinonStubbedInstance<SentenceService>
  let riskService: SinonStubbedInstance<RiskService>
  let personalService: SinonStubbedInstance<PersonalService>
  let contactTypesService: SinonStubbedInstance<ContactTypesService>
  let featuresConfig: Partial<Record<FeatureFlags, boolean>>

  beforeEach(async () => {
    offenderService = createStubInstance(OffenderService)
    scheduleService = createStubInstance(ScheduleService)
    activityService = createStubInstance(ActivityService)
    sentenceService = createStubInstance(SentenceService)
    riskService = createStubInstance(RiskService)
    personalService = createStubInstance(PersonalService)
    contactTypesService = createStubInstance(ContactTypesService)

    const module = await Test.createTestingModule({
      controllers: [OffenderController],
      imports: [MockLinksModule, FakeConfigModule.register()],
      providers: [
        { provide: OffenderService, useValue: offenderService },
        { provide: SentenceService, useValue: sentenceService },
        { provide: ScheduleService, useValue: scheduleService },
        { provide: ActivityService, useValue: activityService },
        { provide: RiskService, useValue: riskService },
        { provide: PersonalService, useValue: personalService },
        { provide: ContactTypesService, useValue: contactTypesService },
      ],
    }).compile()
    subject = module.get(OffenderController)

    featuresConfig = module.get(ConfigService).get('server').features
  })

  it('redirects to overview', () => {
    expect(subject.getIndex('some-crn')).toEqual({
      url: '/Case?crn=some-crn',
      statusCode: 302,
    } as RedirectResponse)
  })

  it('gets overview', async () => {
    const offender = havingOffender()

    const circumstances = [fakePersonalCircumstanceDetail()]
    personalService.getPersonalCircumstances.withArgs('some-crn').resolves(circumstances)

    const contactDetails = fakeContactDetailsViewModel()
    const personalDetails = fakePersonalDetailsViewModel()
    personalService.getPersonalDetails
      .withArgs(offender, [], circumstances, [])
      .returns({ contactDetails, personalDetails })

    const conviction = fakeConvictionDetails({
      requirements: [fakeConvictionRequirement({ isRar: true, name: 'Some RAR requirement' })],
    })
    sentenceService.getConvictionDetails.withArgs('some-crn').resolves(conviction)

    const nextAppointment = fakeNextAppointmentSummary()
    scheduleService.getNextAppointment.withArgs('some-crn').resolves(nextAppointment)

    const registrations = fakeRiskRegistrations()
    riskService.getRiskRegistrations.withArgs('some-crn').resolves(registrations)

    const risks = fakeRisks()
    riskService.getRisks.withArgs('some-crn').resolves(risks)

    const compliance = fakeComplianceDetails()
    sentenceService.getSentenceComplianceDetails.withArgs('some-crn').resolves(compliance)

    const observed = await subject.getOverview('some-crn')
    shouldReturnViewModel(observed, BreadcrumbType.Case, {
      page: OffenderPage.Overview,
      contactDetails,
      personalDetails,
      nextAppointment,
      registrations,
      risks,
      compliance,
    })
  })

  it('gets schedule', async () => {
    havingOffenderSummary()

    const appointments = [fakeAppointmentListViewModel()]
    scheduleService.getScheduledAppointments.withArgs('some-crn').resolves(appointments)

    const observed = await subject.getSchedule('some-crn')
    shouldReturnViewModel(observed, BreadcrumbType.CaseSchedule, {
      page: OffenderPage.Schedule,
      appointments,
      appointmentBookingEnabled: featuresConfig[FeatureFlags.EnableAppointmentBooking],
    })
  })

  it('gets activity', async () => {
    const offender = havingOffenderSummary()
    const displayName = getDisplayName(offender)

    const communicationContactTypes = [fakeAppointmentType().contactType, fakeAppointmentType().contactType]

    contactTypesService.getCommunicationContactTypes.resolves(communicationContactTypes)

    const contacts = fakePaginated([fakeActivityLogEntry(), fakeActivityLogEntry()])

    sentenceService.getConvictionId.withArgs('some-crn').resolves(1234)
    activityService.getActivityLogPage
      .withArgs(
        'some-crn',
        displayName,
        match({
          include: ['APPOINTMENTS', 'TYPE_' + communicationContactTypes[0], 'TYPE_' + communicationContactTypes[1]],
          convictionId: 1234,
        }),
      )
      .resolves(contacts)

    const observed = await subject.getActivity('some-crn')
    shouldReturnViewModel(observed, BreadcrumbType.CaseActivityLog, {
      page: OffenderPage.Activity,
      contacts: contacts.content,
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
          description: 'Appointments',
          name: 'Appointments',
        },
        'without-an-outcome': {
          description: 'Appointments without an outcome',
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
      title: null,
      currentFilter: undefined,
    })
  })

  it('gets filtered activity list', async () => {
    const offender = havingOffenderSummary()
    const displayName = getDisplayName(offender)
    const contacts = fakePaginated([fakeActivityLogEntry(), fakeActivityLogEntry()])

    sentenceService.getConvictionId.withArgs('some-crn').resolves(1234)
    activityService.getActivityLogPage
      .withArgs(
        'some-crn',
        displayName,
        match({
          convictionId: 1234,
          complianceFilter: ActivityComplianceFilter.CompliedAppointments,
        } as GetContactsOptions),
      )
      .resolves(contacts)

    const observed = await subject.getActivityFiltered('some-crn', ActivityComplianceFilter.CompliedAppointments)
    shouldReturnViewModel(observed, BreadcrumbType.CaseActivityLog, {
      page: OffenderPage.Activity,
      contacts: contacts.content,
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
          description: 'Appointments',
          name: 'Appointments',
        },
        'without-an-outcome': {
          description: 'Appointments without an outcome',
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

  it('gets personal', async () => {
    const offender = havingOffender()

    const personalContacts = [fakePersonalContactDetail()]
    personalService.getPersonalContacts.withArgs('some-crn').resolves(personalContacts)

    const circumstances = [fakePersonalCircumstanceDetail()]
    personalService.getPersonalCircumstances.withArgs('some-crn').resolves(circumstances)

    const needs = [fakeCriminogenicNeed()]
    riskService.getNeeds.withArgs('some-crn').resolves(needs)

    const contactDetails = fakeContactDetailsViewModel()
    const personalDetails = fakePersonalDetailsViewModel()
    personalService.getPersonalDetails
      .withArgs(offender, personalContacts, circumstances, needs)
      .returns({ contactDetails, personalDetails })

    const observed = await subject.getPersonal('some-crn')

    shouldReturnViewModel(observed, BreadcrumbType.PersonalDetails, {
      page: OffenderPage.Personal,
      contactDetails,
      personalDetails,
    })
  })

  it('gets sentence', async () => {
    havingOffenderSummary()

    const conviction = fakeConvictionDetails()
    sentenceService.getConvictionDetails.withArgs('some-crn').resolves(conviction)

    const observed = await subject.getSentence('some-crn')

    shouldReturnViewModel(observed, BreadcrumbType.CaseSentence, {
      page: OffenderPage.Sentence,
      conviction,
    })
  })

  it('gets compliance', async () => {
    havingOffenderSummary()

    const compliance = fakeComplianceDetails()
    sentenceService.getSentenceComplianceDetails.withArgs('some-crn').resolves(compliance)

    const observed = await subject.getCompliance('some-crn')

    shouldReturnViewModel(observed, BreadcrumbType.Compliance, {
      page: OffenderPage.Compliance,
      compliance,
    })
  })

  it('gets risks', async () => {
    havingOffenderSummary()

    const risks = fakeRisks()
    riskService.getRisks.withArgs('some-crn').resolves(risks)

    const registrations = fakeRiskRegistrations()
    riskService.getRiskRegistrations.withArgs('some-crn').resolves(registrations)

    const observed = await subject.getRisk('some-crn')

    shouldReturnViewModel(observed, BreadcrumbType.CaseRisk, {
      page: OffenderPage.Risk,
      risks,
      registrations,
    })
  })

  function havingOffender() {
    const offender = fakeOffenderDetail({
      otherIds: { crn: 'some-crn', pncNumber: 'some-pnc' },
      firstName: 'Liz',
      middleNames: ['Danger'],
      surname: 'Haggis',
      preferredName: 'Bob',
    })
    offenderService.getOffenderDetail.withArgs('some-crn').resolves(offender)
    return offender
  }

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

  function shouldReturnViewModel(
    observed: OffenderViewModel,
    breadcrumbType: BreadcrumbType,
    expected: Partial<OffenderViewModel>,
  ) {
    const links = MockLinksModule.of({ crn: 'some-crn', offenderName: 'Liz Danger Haggis' })
    expect(observed).toEqual({
      ids: {
        crn: 'SOME-CRN',
        pnc: 'some-pnc',
      },
      breadcrumbs: links.breadcrumbs(breadcrumbType),
      displayName: 'Liz Danger Haggis (Bob)',
      shortName: 'Liz Haggis',
      links: {
        arrangeAppointment: links.url(BreadcrumbType.NewAppointment),
        addActivity: links.url(BreadcrumbType.ExitToDelius),
        addressBook: links.url(BreadcrumbType.PersonalAddresses),
        circumstances: links.url(BreadcrumbType.PersonalCircumstances),
        disabilities: links.url(BreadcrumbType.PersonalDisabilities),
        overview: links.url(BreadcrumbType.Case),
        personal: links.url(BreadcrumbType.PersonalDetails),
        schedule: links.url(BreadcrumbType.CaseSchedule),
        sentence: links.url(BreadcrumbType.CaseSentence),
        activity: links.url(BreadcrumbType.CaseActivityLog),
        compliance: links.url(BreadcrumbType.Compliance),
        risk: links.url(BreadcrumbType.CaseRisk),
        toDelius: links.url(BreadcrumbType.ExitToDelius),
        toOASys: links.url(BreadcrumbType.ExitToOASys),
        viewInactiveRegistrations: links.url(BreadcrumbType.RemovedRisksList),
        previousConvictions: links.url(BreadcrumbType.CasePreviousConvictions),
        startBreach: links.url(BreadcrumbType.ExitToDelius),
      },
      ...expected,
    } as OffenderViewModel)
  }
})
