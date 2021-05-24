import { Test } from '@nestjs/testing'
import { createStubInstance, SinonStubbedInstance } from 'sinon'
import { OffenderController } from './offender.controller'
import { OffenderService } from './offender.service'
import { OffenderOverviewViewModel, OffenderPage } from './offender-view-model'
import { RedirectResponse } from '../../common'
import { fakeOffenderDetail } from '../../community-api/community-api.fake'

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
    const offender = fakeOffenderDetail({
      otherIds: { crn: 'some-crn' },
      firstName: 'Alex',
      middleNames: ['Danger'],
      surname: 'Haslehurst',
    })
    service.getOffenderDetail.withArgs('some-crn').resolves(offender)
    const observed = await subject.getOverview('some-crn')
    expect(observed).toEqual({
      page: OffenderPage.Overview,
      contactDetails: offender.contactDetails,
      ids: {
        crn: 'SOME-CRN',
      },
      displayName: 'Alex Danger Haslehurst',
      links: {
        [OffenderPage.Overview]: '/offender/some-crn/overview',
        [OffenderPage.Schedule]: '/offender/some-crn/schedule',
        [OffenderPage.Activity]: '/offender/some-crn/activity',
        [OffenderPage.Personal]: '/offender/some-crn/personal',
        [OffenderPage.Sentence]: '/offender/some-crn/sentence',
        arrangeAppointment: '/arrange-appointment/some-crn',
      },
    } as OffenderOverviewViewModel)
  })
})
