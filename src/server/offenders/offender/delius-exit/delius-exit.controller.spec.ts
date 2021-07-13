import { Test } from '@nestjs/testing'
import { DeliusExitController } from './delius-exit.controller'
import { createStubInstance, SinonStubbedInstance } from 'sinon'
import { OffenderService } from '../offender.service'
import { SentenceService } from '../sentence'
import { fakeOffenderDetail } from '../../../community-api/community-api.fake'
import { DeliusExitViewModel } from './delius-exit.types'
import { OffenderDetail } from '../../../community-api'
import { ConfigService } from '@nestjs/config'
import { DeliusConfig } from '../../../config'
import { FakeConfigModule } from '../../../config/config.fake'

describe('DeliusExitController', () => {
  let subject: DeliusExitController
  let offenderService: SinonStubbedInstance<OffenderService>
  let sentenceService: SinonStubbedInstance<SentenceService>
  let config: DeliusConfig
  let offender: OffenderDetail

  beforeEach(async () => {
    offenderService = createStubInstance(OffenderService)
    sentenceService = createStubInstance(SentenceService)

    const module = await Test.createTestingModule({
      controllers: [DeliusExitController],
      imports: [FakeConfigModule.register()],
      providers: [
        { provide: OffenderService, useValue: offenderService },
        { provide: SentenceService, useValue: sentenceService },
      ],
    }).compile()

    subject = module.get(DeliusExitController)

    offender = fakeOffenderDetail({ firstName: 'Liz', middleNames: ['Danger'], surname: 'Haggis', offenderId: 84520 })
    offenderService.getOffenderDetail.withArgs('some-crn').resolves(offender)

    sentenceService.getConvictionId.withArgs('some-crn').resolves(1234)

    config = module.get(ConfigService).get('delius')
  })

  it('gets addresses', async () => {
    const observed = await subject.getDeliusExit('some-crn')

    expect(observed).toEqual({
      exitLink:
        config.baseUrl + 'NDelius-war/delius/JSP/deeplink.jsp?component=ContactList&offenderId=84520&eventId=1234',
    } as DeliusExitViewModel)
  })
})
