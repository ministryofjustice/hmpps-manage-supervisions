import { Test } from '@nestjs/testing'
import { URL } from 'url'
import { ExitController } from './exit.controller'
import { createStubInstance, SinonStubbedInstance } from 'sinon'
import { OffenderService } from '../offender.service'
import { SentenceService } from '../sentence'
import { fakeOffenderDetail } from '../../../community-api/community-api.fake'
import { DeliusExitViewModel, OASysExitViewModel } from './exit.types'
import { OffenderDetail } from '../../../community-api/client'
import { FakeConfigModule } from '../../../config/config.fake'
import { MockLinksModule } from '../../../common/links/links.mock'
import { DateTime } from 'luxon'
import { BreadcrumbType } from '../../../common/links'

describe('ExitController', () => {
  let subject: ExitController
  let offenderService: SinonStubbedInstance<OffenderService>
  let sentenceService: SinonStubbedInstance<SentenceService>
  let offender: OffenderDetail

  beforeEach(async () => {
    offenderService = createStubInstance(OffenderService)
    sentenceService = createStubInstance(SentenceService)

    const module = await Test.createTestingModule({
      controllers: [ExitController],
      imports: [
        FakeConfigModule.register({
          delius: { baseUrl: new URL('https://delius') },
          oasys: { baseUrl: new URL('https://oasys') },
        }),
        MockLinksModule,
      ],
      providers: [
        { provide: OffenderService, useValue: offenderService },
        { provide: SentenceService, useValue: sentenceService },
      ],
    }).compile()

    subject = module.get(ExitController)

    offender = fakeOffenderDetail({
      firstName: 'Liz',
      middleNames: ['Danger'],
      surname: 'Haggis',
      offenderId: 84520,
      dateOfBirth: '1980-02-03',
      otherIds: {
        pncNumber: 'some-pnc',
        crn: 'some-crn',
      },
    })
    offenderService.getOffenderDetail.withArgs('some-crn').resolves(offender)

    sentenceService.getConvictionId.withArgs('some-crn').resolves(1234)
  })

  it('displays delius exit', async () => {
    const observed = await subject.getDeliusExit('some-crn')

    const links = MockLinksModule.of({ crn: 'some-crn', offenderName: 'Liz Danger Haggis' })
    expect(observed).toEqual({
      links: {
        deliusHomePage: 'https://delius/NDelius-war/delius/JSP/homepage.jsp',
        deliusContactLog:
          'https://delius/NDelius-war/delius/JSP/deeplink.jsp?component=ContactList&offenderId=84520&eventId=1234',
      },
      breadcrumbs: links.breadcrumbs(BreadcrumbType.ExitToDelius),
      offender: {
        dateOfBirth: DateTime.fromObject({ year: 1980, month: 2, day: 3 }),
        displayName: 'Liz Danger Haggis',
        shortName: 'Liz Haggis',
        ids: {
          crn: 'SOME-CRN',
          pnc: 'some-pnc',
        },
      },
    } as DeliusExitViewModel)
  })

  it('displays oasys exit', async () => {
    const observed = await subject.getOASysExit('some-crn')

    const links = MockLinksModule.of({ crn: 'some-crn', offenderName: 'Liz Danger Haggis' })
    expect(observed).toEqual({
      links: { oasysHomePage: 'https://oasys/' },
      breadcrumbs: links.breadcrumbs(BreadcrumbType.ExitToOASys),
      offender: {
        dateOfBirth: DateTime.fromObject({ year: 1980, month: 2, day: 3 }),
        displayName: 'Liz Danger Haggis',
        shortName: 'Liz Haggis',
        ids: { crn: 'SOME-CRN', pnc: 'some-pnc' },
      },
    } as OASysExitViewModel)
  })
})
