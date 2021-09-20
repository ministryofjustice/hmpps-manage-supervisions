import { Controller, Get, Param, Render } from '@nestjs/common'
import { CaseComplianceViewModel, CasePage } from '../case.types'
import { CaseBreadcrumb } from '../case.decorators'
import { OffenderService } from '../offender'
import { SentenceService } from '../sentence'

@Controller('case/:crn(\\w+)/compliance')
export class ComplianceController {
  constructor(private readonly offender: OffenderService, private readonly sentence: SentenceService) {}

  @Get()
  @Render('case/compliance/compliance')
  @CaseBreadcrumb({ page: CasePage.Compliance, title: 'Compliance' })
  async getCompliance(@Param('crn') crn: string): Promise<CaseComplianceViewModel> {
    const [offender, compliance] = await Promise.all([
      this.offender.getOffenderSummary(crn),
      this.sentence.getSentenceComplianceDetails(crn),
    ])

    return this.offender.casePageOf<CaseComplianceViewModel>(offender, {
      page: CasePage.Compliance,
      compliance,
    })
  }
}
