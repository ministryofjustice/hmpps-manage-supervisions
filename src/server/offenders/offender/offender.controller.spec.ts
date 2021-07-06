import { Test } from '@nestjs/testing'
import { createStubInstance, match, SinonStubbedInstance } from 'sinon'
import { OffenderController } from './offender.controller'
import { OffenderService } from './offender.service'
import { OffenderPage, OffenderViewModel } from './offender-view-model'
import { RedirectResponse } from '../../common'
import { fakeOffenderDetail, fakePaginated } from '../../community-api/community-api.fake'
import { fakeContactDetailsViewModel, fakePersonalDetailsViewModel } from './personal/personal.fake'
import { SentenceService } from './sentence'
import { ScheduleService } from './schedule'
import { ActivityService } from './activity'
import { RiskService } from './risk'
import { fakeConvictionDetails } from './sentence/sentence.fake'
import { fakeActivityLogEntry } from './activity/activity.fake'
import { fakeAppointmentSummary, fakeRecentAppointments } from './schedule/schedule.fake'
import { fakeBreadcrumbs, MockLinksModule } from '../../common/links/links.mock'
import { PersonalService } from './personal'
import { BreadcrumbType } from '../../common/links'

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

    const contactDetails = fakeContactDetailsViewModel()
    const personalDetails = fakePersonalDetailsViewModel()
    personalService.getPersonalDetails.withArgs(offender).resolves({ contactDetails, personalDetails })

    const conviction = fakeConvictionDetails()
    sentenceService.getConvictionDetails.withArgs('some-crn').resolves(conviction)

    const appointmentSummary = fakeAppointmentSummary()
    scheduleService.getAppointmentSummary.withArgs('some-crn').resolves(appointmentSummary)

    const observed = await subject.getOverview('some-crn')
    shouldReturnViewModel(observed, BreadcrumbType.Case, {
      page: OffenderPage.Overview,
      conviction,
      contactDetails,
      personalDetails,
      appointmentSummary,
    })
  })

  it('gets schedule', async () => {
    havingOffender()

    const appointments = fakeRecentAppointments()
    scheduleService.getRecentAppointments.withArgs('some-crn').resolves(appointments)

    const observed = await subject.getSchedule('some-crn')
    shouldReturnViewModel(observed, BreadcrumbType.CaseSchedule, {
      page: OffenderPage.Schedule,
      appointments,
    })
  })

  it('gets activity', async () => {
    havingOffender()

    const contacts = fakePaginated([fakeActivityLogEntry(), fakeActivityLogEntry()])

    activityService.getActivityLogPage.withArgs('some-crn', match({ appointmentsOnly: true })).resolves(contacts)

    const observed = await subject.getActivity('some-crn')
    shouldReturnViewModel(observed, BreadcrumbType.CaseActivityLog, {
      page: OffenderPage.Activity,
      contacts: contacts.content,
      pagination: {
        page: contacts.number,
        size: contacts.size,
      },
    })
  })

  it('gets personal', async () => {
    const offender = havingOffender()

    const contactDetails = fakeContactDetailsViewModel()
    const personalDetails = fakePersonalDetailsViewModel()

    personalService.getPersonalDetails.withArgs(offender).resolves({ contactDetails, personalDetails })

    const observed = await subject.getPersonal('some-crn')

    shouldReturnViewModel(observed, BreadcrumbType.PersonalDetails, {
      page: OffenderPage.Personal,
      contactDetails,
      personalDetails,
    })
  })

  it('gets sentence', async () => {
    havingOffender()

    const conviction = fakeConvictionDetails()
    sentenceService.getConvictionDetails.withArgs('some-crn').resolves(conviction)

    const observed = await subject.getSentence('some-crn')

    shouldReturnViewModel(observed, BreadcrumbType.CaseSentence, {
      page: OffenderPage.Sentence,
      conviction,
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
    expect(observed).toEqual({
      ids: {
        crn: 'SOME-CRN',
        pnc: 'some-prn',
      },
      breadcrumbs: fakeBreadcrumbs(breadcrumbType, { crn: 'some-crn', offenderName: 'Liz Danger Haggis' }),
      displayName: 'Liz Danger Haggis (Bob)',
      links: {
        activity: '/CaseActivityLog?crn=some-crn&offenderName=Liz%20Danger%20Haggis',
        addActivity: '/offender/some-crn/activity/new',
        addressBook: '/PersonalAddresses?crn=some-crn&offenderName=Liz%20Danger%20Haggis',
        arrangeAppointment: '/NewAppointment?crn=some-crn&offenderName=Liz%20Danger%20Haggis',
        circumstances: '/PersonalCircumstances?crn=some-crn&offenderName=Liz%20Danger%20Haggis',
        disabilities: '/PersonalDisabilities?crn=some-crn&offenderName=Liz%20Danger%20Haggis',
        overview: '/Case?crn=some-crn&offenderName=Liz%20Danger%20Haggis',
        personal: '/PersonalDetails?crn=some-crn&offenderName=Liz%20Danger%20Haggis',
        schedule: '/CaseSchedule?crn=some-crn&offenderName=Liz%20Danger%20Haggis',
        sentence: '/CaseSentence?crn=some-crn&offenderName=Liz%20Danger%20Haggis',
      },
      ...expected,
    } as OffenderViewModel)
  }
})
