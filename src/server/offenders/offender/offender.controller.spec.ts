import { Test } from '@nestjs/testing'
import { createStubInstance, SinonStubbedInstance, match } from 'sinon'
import { OffenderController } from './offender.controller'
import { OffenderService } from './offender.service'
import { OffenderPage, OffenderViewModel } from './offender-view-model'
import { RedirectResponse } from '../../common'
import { fakeOffenderDetail, fakePaginated } from '../../community-api/community-api.fake'
import { fakeActivityLogEntry, fakeRecentAppointments } from './offender.fake'

describe('OffenderController', () => {
  let subject: OffenderController
  let service: SinonStubbedInstance<OffenderService>

  beforeEach(async () => {
    service = createStubInstance(OffenderService)
    const module = await Test.createTestingModule({
      controllers: [OffenderController],
      providers: [{ provide: OffenderService, useValue: service }],
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
    const observed = await subject.getOverview('some-crn')
    shouldReturnViewModel(observed, {
      page: OffenderPage.Overview,
      contactDetails: offender.contactDetails,
    })
  })

  it('gets schedule', async () => {
    havingOffender()

    const appointments = fakeRecentAppointments()
    service.getRecentAppointments.withArgs('some-crn').resolves(appointments)

    const observed = await subject.getSchedule('some-crn')
    shouldReturnViewModel(observed, {
      page: OffenderPage.Schedule,
      appointments,
    })
  })

  it('gets activity', async () => {
    havingOffender()

    const contacts = fakePaginated([fakeActivityLogEntry(), fakeActivityLogEntry()])

    service.getActivityLogPage.withArgs('some-crn', match({ appointmentsOnly: true })).resolves(contacts)

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

  function havingOffender() {
    const offender = fakeOffenderDetail({
      otherIds: { crn: 'some-crn' },
      firstName: 'Mark',
      middleNames: ['Danger'],
      surname: 'Berridge',
    })
    service.getOffenderDetail.withArgs('some-crn').resolves(offender)
    return offender
  }

  function shouldReturnViewModel(observed: OffenderViewModel, expected: Partial<OffenderViewModel>) {
    expect(observed).toEqual({
      ids: {
        crn: 'SOME-CRN',
      },
      displayName: 'Mark Danger Berridge',
      links: {
        [OffenderPage.Overview]: '/offender/some-crn/overview',
        [OffenderPage.Schedule]: '/offender/some-crn/schedule',
        [OffenderPage.Activity]: '/offender/some-crn/activity',
        [OffenderPage.Personal]: '/offender/some-crn/personal',
        [OffenderPage.Sentence]: '/offender/some-crn/sentence',
        arrangeAppointment: '/arrange-appointment/some-crn',
        addActivity: '/offender/some-crn/activity/new',
      },
      ...expected,
    } as OffenderViewModel)
  }
})
