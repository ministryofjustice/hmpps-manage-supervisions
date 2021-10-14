import { Test } from '@nestjs/testing'
import { ComplianceController } from './compliance.controller'
import { createStubInstance, match, SinonStubbedInstance } from 'sinon'
import { OffenderService } from '../offender'
import { SentenceService } from '../sentence'
import { fakeOffenderDetailSummary } from '../../community-api/community-api.fake'
import { CasePage } from '../case.types'
import { fakeComplianceDetails } from '../sentence/sentence.fake'
import { EligibilityService } from '../../community-api/eligibility'
import { LinksService } from '../../common/links'

describe('ComplianceController', () => {
  let subject: ComplianceController
  let offenderService: SinonStubbedInstance<OffenderService>
  let sentenceService: SinonStubbedInstance<SentenceService>

  beforeEach(async () => {
    offenderService = createStubInstance(OffenderService)
    sentenceService = createStubInstance(SentenceService)

    const module = await Test.createTestingModule({
      controllers: [ComplianceController],
      providers: [
        { provide: OffenderService, useValue: offenderService },
        { provide: SentenceService, useValue: sentenceService },
        { provide: EligibilityService, useValue: null },
        { provide: LinksService, useValue: null },
      ],
    }).compile()

    subject = module.get(ComplianceController)
  })

  it('gets compliance', async () => {
    const offender = fakeOffenderDetailSummary()
    offenderService.getOffenderSummary.withArgs('some-crn').resolves(offender)
    const viewModel: any = { page: CasePage.Compliance }
    const stub = offenderService.casePageOf.withArgs(offender, match.any).returns(viewModel)

    const compliance = fakeComplianceDetails()
    sentenceService.getSentenceComplianceDetails.withArgs('some-crn').resolves(compliance)

    const observed = await subject.getCompliance('some-crn')

    expect(observed).toBe(viewModel)
    expect(stub.getCall(0).args[1]).toEqual({
      page: CasePage.Compliance,
      compliance,
    })
  })
})
