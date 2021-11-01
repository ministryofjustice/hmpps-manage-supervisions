import { Controller, Get, Param, Render } from '@nestjs/common'
import { CaseComplianceViewModel, CasePage } from '../case.types'
import { CaseTabbedPage } from '../case-tabbed-page.decorators'
import { OffenderService } from '../offender'
import { SentenceService } from '../sentence'
import { BreadcrumbType, UtmMedium } from '../../common/links'
import { DateTime } from 'luxon'

@Controller('case/:crn(\\w+)/compliance')
export class ComplianceController {
  constructor(private readonly offender: OffenderService, private readonly sentence: SentenceService) {}

  @Get()
  @Render('case/compliance/compliance')
  @CaseTabbedPage({ page: CasePage.Compliance, title: 'Compliance' })
  async getCompliance(@Param('crn') crn: string): Promise<CaseComplianceViewModel> {
    const complianceFrom = DateTime.now()
      .minus({ years: 2 })
      .set({ day: 1, hour: 0, minute: 0, second: 0, millisecond: 0 })
    const [offender, compliance] = await Promise.all([
      this.offender.getOffenderSummary(crn),
      this.sentence.getSentenceComplianceDetails(crn, complianceFrom),
    ])

    return this.offender.casePageOf<CaseComplianceViewModel>(offender, {
      page: CasePage.Compliance,
      compliance,
      links: links => ({
        startBreach: links.url(BreadcrumbType.ExitToDelius, {
          utm: { medium: UtmMedium.Compliance, campaign: 'start-breach' },
        }),
        multipleBreachDetail: links.url(BreadcrumbType.ExitToDelius, {
          utm: {
            medium: UtmMedium.Compliance,
            campaign: 'multiple-breach-detail',
            content: { convictionId: compliance.current?.id },
          },
        }),
        viewAllOrders: links.url(BreadcrumbType.CasePreviousConvictions),
      }),
    })
  }
}
