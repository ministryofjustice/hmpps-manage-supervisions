import { Test } from '@nestjs/testing'
import { createStubInstance, match, SinonStubbedInstance } from 'sinon'
import { OffenderController } from './offender.controller'
import { OffenderService } from './offender.service'
import { OffenderPage, OffenderViewModel } from './offender-view-model'
import { RedirectResponse } from '../../common'
import { fakeOffenderDetail, fakePaginated } from '../../community-api/community-api.fake'
import {
  fakeContactDetailsViewModel,
  fakePersonalCircumstanceDetail,
  fakePersonalContactDetail,
  fakePersonalDetailsViewModel,
} from './personal/personal.fake'
import { SentenceService } from './sentence'
import { ScheduleService } from './schedule'
import { ActivityService } from './activity'
import { RiskService } from './risk'
import { fakeConvictionDetails } from './sentence/sentence.fake'
import { fakeActivityLogEntry } from './activity/activity.fake'
import { fakeAppointmentSummary, fakeRecentAppointments } from './schedule/schedule.fake'
import { fakeBreadcrumbs, fakeBreadcrumbUrl, MockLinksModule } from '../../common/links/links.mock'
import { PersonalService } from './personal'
import { BreadcrumbType, ResolveBreadcrumbOptions } from '../../common/links'
import { fakeRegistrationFlag } from './risk/risk.fake'

describe('OffenderController', () => {
  let subject: OffenderController
  let offenderService: SinonStubbedInstance<OffenderService>
  let scheduleService: SinonStubbedInstance<ScheduleService>
  let activityService: SinonStubbedInstance<ActivityService>
  let sentenceService: SinonStubbedInstance<SentenceService>
  let riskService: SinonStubbedInstance<RiskService>
  let personalService: SinonStubbedInstance<PersonalService>

  beforeEach(async () => {
    offenderService = createStubInstance(OffenderService)
    scheduleService = createStubInstance(ScheduleService)
    activityService = createStubInstance(ActivityService)
    sentenceService = createStubInstance(SentenceService)
    riskService = createStubInstance(RiskService)
    personalService = createStubInstance(PersonalService)

    const module = await Test.createTestingModule({
      controllers: [OffenderController],
      imports: [MockLinksModule],
      providers: [
        { provide: OffenderService, useValue: offenderService },
        { provide: SentenceService, useValue: sentenceService },
        { provide: ScheduleService, useValue: scheduleService },
        { provide: ActivityService, useValue: activityService },
        { provide: RiskService, useValue: riskService },
        { provide: PersonalService, useValue: personalService },
      ],
    }).compile()

    subject = module.get(OffenderController)
  })

  it('redirects to overview', () => {
    expect(subject.getIndex('some-crn')).toEqual({
      url: '/Case?crn=some-crn',
      statusCode: 302,
    } as RedirectResponse)
  })

  it('gets overview', async () => {
    const offender = havingOffender()

    const personalContacts = [fakePersonalContactDetail()]
    personalService.getPersonalContacts.withArgs('some-crn').resolves(personalContacts)

    const circumstances = [fakePersonalCircumstanceDetail()]
    personalService.getPersonalCircumstances.withArgs('some-crn').resolves(circumstances)

    const contactDetails = fakeContactDetailsViewModel()
    const personalDetails = fakePersonalDetailsViewModel()
    personalService.getPersonalDetails
      .withArgs(offender, personalContacts, circumstances)
      .returns({ contactDetails, personalDetails })

    const conviction = fakeConvictionDetails()
    sentenceService.getConvictionDetails.withArgs('some-crn').resolves(conviction)

    const appointmentSummary = fakeAppointmentSummary()
    scheduleService.getAppointmentSummary.withArgs('some-crn').resolves(appointmentSummary)

    const registrations = [fakeRegistrationFlag()]
    riskService.getRiskRegistrations.withArgs('some-crn').resolves(registrations)

    const observed = await subject.getOverview('some-crn')
    shouldReturnViewModel(observed, BreadcrumbType.Case, {
      page: OffenderPage.Overview,
      conviction,
      contactDetails,
      personalDetails,
      appointmentSummary,
      registrations,
    })
  })

  it('gets schedule', async () => {
    havingOffender()

    const appointments = fakeRecentAppointments()
    scheduleService.getRecentAppointments.withArgs('some-crn').resolves(appointments)

    const registrations = [fakeRegistrationFlag()]
    riskService.getRiskRegistrations.withArgs('some-crn').resolves(registrations)

    const observed = await subject.getSchedule('some-crn')
    shouldReturnViewModel(observed, BreadcrumbType.CaseSchedule, {
      page: OffenderPage.Schedule,
      appointments,
      registrations,
    })
  })

  it('gets activity', async () => {
    havingOffender()

    const contacts = fakePaginated([fakeActivityLogEntry(), fakeActivityLogEntry()])

    activityService.getActivityLogPage.withArgs('some-crn', match({ appointmentsOnly: true })).resolves(contacts)

    const registrations = [fakeRegistrationFlag()]
    riskService.getRiskRegistrations.withArgs('some-crn').resolves(registrations)

    const observed = await subject.getActivity('some-crn')
    shouldReturnViewModel(observed, BreadcrumbType.CaseActivityLog, {
      page: OffenderPage.Activity,
      contacts: contacts.content,
      pagination: {
        page: contacts.number,
        size: contacts.size,
      },
      registrations,
    })
  })

  it('gets personal', async () => {
    const offender = havingOffender()

    const personalContacts = [fakePersonalContactDetail()]
    personalService.getPersonalContacts.withArgs('some-crn').resolves(personalContacts)

    const circumstances = [fakePersonalCircumstanceDetail()]
    personalService.getPersonalCircumstances.withArgs('some-crn').resolves(circumstances)

    const contactDetails = fakeContactDetailsViewModel()
    const personalDetails = fakePersonalDetailsViewModel()
    personalService.getPersonalDetails
      .withArgs(offender, personalContacts, circumstances)
      .returns({ contactDetails, personalDetails })

    const registrations = [fakeRegistrationFlag()]
    riskService.getRiskRegistrations.withArgs('some-crn').resolves(registrations)

    const observed = await subject.getPersonal('some-crn')

    shouldReturnViewModel(observed, BreadcrumbType.PersonalDetails, {
      page: OffenderPage.Personal,
      contactDetails,
      personalDetails,
      registrations,
    })
  })

  it('gets sentence', async () => {
    havingOffender()

    const conviction = fakeConvictionDetails()
    sentenceService.getConvictionDetails.withArgs('some-crn').resolves(conviction)

    const registrations = [fakeRegistrationFlag()]
    riskService.getRiskRegistrations.withArgs('some-crn').resolves(registrations)

    const observed = await subject.getSentence('some-crn')

    shouldReturnViewModel(observed, BreadcrumbType.CaseSentence, {
      page: OffenderPage.Sentence,
      conviction,
      registrations,
    })
  })

  function havingOffender() {
    const offender = fakeOffenderDetail({
      otherIds: { crn: 'some-crn', pncNumber: 'some-prn' },
      firstName: 'Liz',
      middleNames: ['Danger'],
      surname: 'Haggis',
      preferredName: 'Bob',
    })
    offenderService.getOffenderDetail.withArgs('some-crn').resolves(offender)
    return offender
  }

  function shouldReturnViewModel(
    observed: OffenderViewModel,
    breadcrumbType: BreadcrumbType,
    expected: Partial<OffenderViewModel>,
  ) {
    const breadcrumbOptions: ResolveBreadcrumbOptions = { crn: 'some-crn', offenderName: 'Liz Danger Haggis' }
    expect(observed).toEqual({
      ids: {
        crn: 'SOME-CRN',
        pnc: 'some-prn',
      },
      breadcrumbs: fakeBreadcrumbs(breadcrumbType, { crn: 'some-crn', offenderName: 'Liz Danger Haggis' }),
      displayName: 'Liz Danger Haggis (Bob)',
      links: {
        arrangeAppointment: fakeBreadcrumbUrl(BreadcrumbType.NewAppointment, breadcrumbOptions),
        addActivity: '/offender/some-crn/activity/new',
        addressBook: fakeBreadcrumbUrl(BreadcrumbType.PersonalAddresses, breadcrumbOptions),
        circumstances: fakeBreadcrumbUrl(BreadcrumbType.PersonalCircumstances, breadcrumbOptions),
        disabilities: fakeBreadcrumbUrl(BreadcrumbType.PersonalDisabilities, breadcrumbOptions),
        overview: fakeBreadcrumbUrl(BreadcrumbType.Case, breadcrumbOptions),
        personal: fakeBreadcrumbUrl(BreadcrumbType.PersonalDetails, breadcrumbOptions),
        schedule: fakeBreadcrumbUrl(BreadcrumbType.CaseSchedule, breadcrumbOptions),
        sentence: fakeBreadcrumbUrl(BreadcrumbType.CaseSentence, breadcrumbOptions),
        activity: fakeBreadcrumbUrl(BreadcrumbType.CaseActivityLog, breadcrumbOptions),
      },
      ...expected,
    } as OffenderViewModel)
  }
})
