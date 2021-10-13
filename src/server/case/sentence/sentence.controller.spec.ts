import { Test } from '@nestjs/testing'
import { SentenceController } from './sentence.controller'
import { createStubInstance, match, SinonStubbedInstance } from 'sinon'
import { OffenderService } from '../offender'
import { SentenceService } from './sentence.service'
import { MockLinksModule } from '../../common/links/links.mock'
import { fakeOffenderDetail, fakeOffenderDetailSummary } from '../../community-api/community-api.fake'
import { fakeConvictionDetails, fakeConvictionOffence, fakePreviousConvictionSummary } from './sentence.fake'
import { PreviousConvictionsViewModel } from './sentence.types'
import { BreadcrumbType } from '../../common/links'
import { ViewModel } from '../../common'
import { CasePage } from '../case.types'
import { EligibilityService } from '../../community-api/eligibility'

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
        { provide: EligibilityService, useValue: null },
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

  it('gets offence details', async () => {
    const offender = fakeOffenderDetail({ firstName: 'Liz', middleNames: ['Danger'], surname: 'Haggis' })
    offenderService.getOffenderDetail.withArgs('some-crn').resolves(offender)

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
    const offender = fakeOffenderDetailSummary()
    offenderService.getOffenderSummary.withArgs('some-crn').resolves(offender)
    const viewModel: any = { page: CasePage.Sentence }
    const stub = offenderService.casePageOf.withArgs(offender, match.any).returns(viewModel)

    const conviction = fakeConvictionDetails()
    sentenceService.getConvictionDetails.withArgs('some-crn').resolves(conviction)

    const observed = await subject.getSentence('some-crn')

    expect(observed).toBe(viewModel)
    expect(stub.getCall(0).args[1]).toEqual({
      page: CasePage.Sentence,
      conviction,
    })
  })
})
