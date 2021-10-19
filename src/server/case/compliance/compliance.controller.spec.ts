import { Test } from '@nestjs/testing'
import { ComplianceController } from './compliance.controller'
import { createStubInstance, SinonStubbedInstance } from 'sinon'
import { SentenceService } from '../sentence'
import { CaseComplianceViewModel, CasePage } from '../case.types'
import { fakeComplianceDetails } from '../sentence/sentence.fake'
import { EligibilityService } from '../../community-api/eligibility'
import { BreadcrumbType, LinksService, UtmMedium } from '../../common/links'
import { MockOffenderModule, OffenderServiceFixture } from '../offender/offender.mock'

describe('ComplianceController', () => {
  let subject: ComplianceController
  let offenderFixture: OffenderServiceFixture
  let sentenceService: SinonStubbedInstance<SentenceService>

  beforeEach(async () => {
    sentenceService = createStubInstance(SentenceService)

    const module = await Test.createTestingModule({
      controllers: [ComplianceController],
      providers: [
        { provide: SentenceService, useValue: sentenceService },
        { provide: EligibilityService, useValue: null },
        { provide: LinksService, useValue: null },
      ],
      imports: [MockOffenderModule.register()],
    }).compile()

    subject = module.get(ComplianceController)
    offenderFixture = module.get(OffenderServiceFixture)
  })

  it('gets compliance', async () => {
    offenderFixture.havingOffender().havingCasePageOf()

    const compliance = fakeComplianceDetails()
    sentenceService.getSentenceComplianceDetails.withArgs('some-crn').resolves(compliance)

    const observed = await subject.getCompliance('some-crn')

    expect(observed).toBe(offenderFixture.caseViewModel)
    offenderFixture.shouldHaveCalledCasePageOf<CaseComplianceViewModel>({
      page: CasePage.Compliance,
      compliance,
      links: {
        startBreach: offenderFixture.links.url(BreadcrumbType.ExitToDelius, {
          utm: { medium: UtmMedium.Compliance, campaign: 'start-breach' },
        }),
        multipleBreachDetail: offenderFixture.links.url(BreadcrumbType.ExitToDelius, {
          utm: {
            medium: UtmMedium.Compliance,
            campaign: 'multiple-breach-detail',
            content: { convictionId: compliance.current?.id },
          },
        }),
        viewAllOrders: offenderFixture.links.url(BreadcrumbType.ExitToDelius, {
          utm: { medium: UtmMedium.Compliance, campaign: 'view-all-orders' },
        }),
      },
    })
  })
})
