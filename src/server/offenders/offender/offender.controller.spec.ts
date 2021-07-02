import { Test } from '@nestjs/testing'
import { createStubInstance, SinonStubbedInstance, match } from 'sinon'
import { OffenderController } from './offender.controller'
import { OffenderService } from './offender.service'
import { OffenderPage, OffenderViewModel } from './offender-view-model'
import { RedirectResponse } from '../../common'
import { fakeOffenderDetail, fakePaginated } from '../../community-api/community-api.fake'
import { fakeContactDetailsViewModel, fakePersonalDetailsViewModel } from './offender.fake'
import { SentenceService } from './sentence'
import { ScheduleService } from './schedule'
import { ActivityService } from './activity'
import { fakeConvictionDetails } from './sentence/sentence.fake'
import { fakeActivityLogEntry } from './activity/activity.fake'
import { fakeAppointmentSummary, fakeRecentAppointments } from './schedule/schedule.fake'

describe('OffenderController', () => {
  let subject: OffenderController
  let offenderService: SinonStubbedInstance<OffenderService>
  let scheduleService: SinonStubbedInstance<ScheduleService>
  let activityService: SinonStubbedInstance<ActivityService>
  let sentenceService: SinonStubbedInstance<SentenceService>

  beforeEach(async () => {
    offenderService = createStubInstance(OffenderService)
    scheduleService = createStubInstance(ScheduleService)
    activityService = createStubInstance(ActivityService)
    sentenceService = createStubInstance(SentenceService)

    const module = await Test.createTestingModule({
      controllers: [OffenderController],
      providers: [
        { provide: OffenderService, useValue: offenderService },
        { provide: SentenceService, useValue: sentenceService },
        { provide: ScheduleService, useValue: scheduleService },
        { provide: ActivityService, useValue: activityService },
      ],
    }).compile()

    subject = module.get(OffenderController)
  })

  it('redirects to overview', () => {
    expect(subject.getIndex('some-crn')).toEqual({
      url: '/offender/some-crn/overview',
      statusCode: 302,
    } as RedirectResponse)
  })

  it('gets overview', async () => {
    const offender = havingOffender()

    const contactDetails = fakeContactDetailsViewModel()
    const personalDetails = fakePersonalDetailsViewModel()
    offenderService.getPersonalDetails.withArgs(offender).resolves({ contactDetails, personalDetails })

    const conviction = fakeConvictionDetails()
    sentenceService.getConvictionDetails.withArgs('some-crn').resolves(conviction)

    const appointmentSummary = fakeAppointmentSummary()
    scheduleService.getAppointmentSummary.withArgs('some-crn').resolves(appointmentSummary)

    const observed = await subject.getOverview('some-crn')
    shouldReturnViewModel(observed, {
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
    shouldReturnViewModel(observed, {
      page: OffenderPage.Schedule,
      appointments,
    })
  })

  it('gets activity', async () => {
    havingOffender()

    const contacts = fakePaginated([fakeActivityLogEntry(), fakeActivityLogEntry()])

    activityService.getActivityLogPage.withArgs('some-crn', match({ appointmentsOnly: true })).resolves(contacts)

    const observed = await subject.getActivity('some-crn')
    shouldReturnViewModel(observed, {
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

    offenderService.getPersonalDetails.withArgs(offender).resolves({ contactDetails, personalDetails })

    const observed = await subject.getPersonal('some-crn')

    shouldReturnViewModel(observed, {
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

    shouldReturnViewModel(observed, {
      page: OffenderPage.Sentence,
      conviction,
    })
  })

  function havingOffender() {
    const offender = fakeOffenderDetail({
      otherIds: { crn: 'some-crn' },
      firstName: 'Liz',
      middleNames: ['Danger'],
      surname: 'Haggis',
      preferredName: 'Bob',
    })
    offenderService.getOffenderDetail.withArgs('some-crn').resolves(offender)
    return offender
  }

  function shouldReturnViewModel(observed: OffenderViewModel, expected: Partial<OffenderViewModel>) {
    expect(observed).toEqual({
      ids: {
        crn: 'SOME-CRN',
      },
      displayName: 'Liz Danger Haggis (Bob)',
      links: {
        [OffenderPage.Overview]: '/offender/some-crn/overview',
        [OffenderPage.Schedule]: '/offender/some-crn/schedule',
        [OffenderPage.Activity]: '/offender/some-crn/activity',
        [OffenderPage.Personal]: '/offender/some-crn/personal',
        [OffenderPage.Sentence]: '/offender/some-crn/sentence',
        arrangeAppointment: '/arrange-appointment/some-crn',
        addActivity: '/offender/some-crn/activity/new',
        addressBook: '/offender/some-crn/address-book',
        circumstances: '/offender/some-crn/circumstances',
        disabilities: '/offender/some-crn/disabilities',
      },
      ...expected,
    } as OffenderViewModel)
  }
})
