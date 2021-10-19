import { Test } from '@nestjs/testing'
import { SentenceController } from './sentence.controller'
import { createStubInstance, SinonStubbedInstance } from 'sinon'
import { SentenceService } from './sentence.service'
import { MockLinksModule } from '../../common/links/links.mock'
import { fakeConvictionDetails, fakeConvictionOffence, fakePreviousConvictionSummary } from './sentence.fake'
import { PreviousConvictionsViewModel } from './sentence.types'
import { BreadcrumbType } from '../../common/links'
import { ViewModel } from '../../common'
import { CasePage, CaseSentenceViewModel } from '../case.types'
import { EligibilityService } from '../../community-api/eligibility'
import { MockOffenderModule, OffenderServiceFixture } from '../offender/offender.mock'

describe('SentenceController', () => {
  let subject: SentenceController
  let offenderFixture: OffenderServiceFixture
  let sentenceService: SinonStubbedInstance<SentenceService>

  beforeEach(async () => {
    sentenceService = createStubInstance(SentenceService)

    const module = await Test.createTestingModule({
      controllers: [SentenceController],
      imports: [MockLinksModule, MockOffenderModule.register()],
      providers: [
        { provide: SentenceService, useValue: sentenceService },
        { provide: EligibilityService, useValue: null },
      ],
    }).compile()

    subject = module.get(SentenceController)
    offenderFixture = module.get(OffenderServiceFixture)
  })

  it('gets previous convictions', async () => {
    offenderFixture.havingOffenderDetail()

    const previousConvictions = [fakePreviousConvictionSummary()]
    sentenceService.getPreviousConvictions.withArgs('some-crn').resolves(previousConvictions)

    const observed = await subject.getPreviousConvictions('some-crn')
    const links = MockLinksModule.of({ crn: 'some-crn', offenderName: 'Liz Danger Haggis' })
    expect(observed).toEqual({
      previousConvictions,
      displayName: 'Liz Danger Haggis',
      breadcrumbs: links.breadcrumbs(BreadcrumbType.CasePreviousConvictions),
    } as PreviousConvictionsViewModel)
  })

  it('gets offence details', async () => {
    offenderFixture.havingOffenderDetail()

    const offenceDetails = fakeConvictionOffence()
    sentenceService.getOffenceDetails.withArgs('some-crn').resolves(offenceDetails)

    const observed = await subject.getOffences('some-crn')
    const links = MockLinksModule.of({ crn: 'some-crn', offenderName: 'Liz Danger Haggis' })
    expect(observed).toEqual({
      displayName: 'Liz Danger Haggis',
      breadcrumbs: links.breadcrumbs(BreadcrumbType.CaseSentenceOffences),
      offence: offenceDetails,
    } as ViewModel)
  })

  it('gets sentence', async () => {
    offenderFixture.havingOffender().havingCasePageOf()

    const conviction = fakeConvictionDetails()
    sentenceService.getConvictionDetails.withArgs('some-crn').resolves(conviction)

    const observed = await subject.getSentence('some-crn')

    expect(observed).toBe(offenderFixture.caseViewModel)
    offenderFixture.shouldHaveCalledCasePageOf<CaseSentenceViewModel>({
      page: CasePage.Sentence,
      conviction,
      links: {
        previousConvictions: offenderFixture.links.url(BreadcrumbType.CasePreviousConvictions),
        additionalOffences: offenderFixture.links.url(BreadcrumbType.CaseSentenceOffences),
      },
    })
  })
})
