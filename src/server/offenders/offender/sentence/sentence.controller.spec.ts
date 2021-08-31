import { Test } from '@nestjs/testing'
import { SentenceController } from './sentence.controller'
import { createStubInstance, SinonStubbedInstance } from 'sinon'
import { OffenderService } from '../offender.service'
import { SentenceService } from './sentence.service'
import { MockLinksModule } from '../../../common/links/links.mock'
import { fakeOffenderDetail } from '../../../community-api/community-api.fake'
import { fakePreviousConvictionSummary } from './sentence.fake'
import { PreviousConvictionsViewModel } from './sentence.types'
import { BreadcrumbType } from '../../../common/links'

describe('SentenceController', () => {
  let subject: SentenceController
  let offenderService: SinonStubbedInstance<OffenderService>
  let sentenceService: SinonStubbedInstance<SentenceService>

  beforeEach(async () => {
    offenderService = createStubInstance(OffenderService)
    sentenceService = createStubInstance(SentenceService)

    const module = await Test.createTestingModule({
      controllers: [SentenceController],
      imports: [MockLinksModule],
      providers: [
        { provide: OffenderService, useValue: offenderService },
        { provide: SentenceService, useValue: sentenceService },
      ],
    }).compile()

    subject = module.get(SentenceController)
  })

  it('gets previous convictions', async () => {
    const offender = fakeOffenderDetail({ firstName: 'Liz', middleNames: ['Danger'], surname: 'Haggis' })
    offenderService.getOffenderDetail.withArgs('some-crn').resolves(offender)

    const previousConvictions = [fakePreviousConvictionSummary()]
    sentenceService.getPreviousConvictions.withArgs('some-crn').resolves(previousConvictions)

    const observed = await subject.getPreviousConvictions('some-crn')
    const links = MockLinksModule.of({ crn: 'some-crn', offenderName: 'Liz Danger Haggis' })
    expect(observed).toEqual({
      previousConvictions,
      displayName: 'Liz Danger Haggis',
      breadcrumbs: links.breadcrumbs(BreadcrumbType.CasePreviousConvictions),
      links: {
        toDelius: links.url(BreadcrumbType.ExitToDelius),
      },
    } as PreviousConvictionsViewModel)
  })
})
