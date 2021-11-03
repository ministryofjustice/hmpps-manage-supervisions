import { Controller, Get, Param, ParseIntPipe, Render } from '@nestjs/common'
import { Breadcrumb, BreadcrumbType, LinksService, ResolveBreadcrumbOptions, UtmMedium } from '../../common/links'
import { RiskService } from './risk.service'
import { RemovedRisksListViewModel, RiskDetailsViewModel, RiskViewModel } from './risk.types'
import { getDisplayName } from '../../util'
import { OffenderDetailSummary } from '../../community-api/client'
import { OffenderService } from '../offender'
import { RedirectResponse } from '../../common/dynamic-routing'
import { CasePage, CaseRiskViewModel } from '../case.types'
import { CaseTabbedPage } from '../case-tabbed-page.decorators'

@Controller('case/:crn(\\w+)/risk')
export class RiskController {
  constructor(
    private readonly offender: OffenderService,
    private readonly risk: RiskService,
    private readonly links: LinksService,
  ) {}

  @Get()
  @Render('case/risk/risk')
  @CaseTabbedPage({ page: CasePage.Risk, title: 'Risk' })
  async getRisk(@Param('crn') crn: string): Promise<CaseRiskViewModel> {
    const [offender, registrations, risks] = await Promise.all([
      this.offender.getOffenderSummary(crn),
      this.risk.getRiskRegistrations(crn),
      this.risk.getRisks(crn),
    ])

    return this.offender.casePageOf<CaseRiskViewModel>(offender, {
      page: CasePage.Risk,
      assessRisksAndNeedsApiStatus: risks.status,
      risks,
      registrations,
      links: links => ({
        viewInactiveRegistrations: links.url(BreadcrumbType.RemovedRisksList),
        roshCommunity: links.url(BreadcrumbType.ExitToOASys, {
          utm: { medium: UtmMedium.Risk, campaign: 'rosh-community' },
        }),
        roshSelf: links.url(BreadcrumbType.ExitToOASys, {
          utm: { medium: UtmMedium.Risk, campaign: 'rosh-self' },
        }),
        noAssessment: links.url(BreadcrumbType.ExitToOASys, {
          utm: { medium: UtmMedium.Risk, campaign: 'no-assessment' },
        }),
        addRiskFlag: links.url(BreadcrumbType.ExitToDelius, {
          utm: { medium: UtmMedium.Risk, campaign: 'add-risk-flag' },
        }),
      }),
    })
  }

  @Get('removed-risk-flags')
  @Render('case/risk/removed-risk-flags')
  @Breadcrumb({
    type: BreadcrumbType.RemovedRisksList,
    parent: BreadcrumbType.CaseRisk,
    title: 'Removed risk flags',
  })
  async getRemovedRiskFlags(@Param('crn') crn: string): Promise<RemovedRisksListViewModel> {
    const [offender, registrationFlags] = await Promise.all([
      this.offender.getOffenderSummary(crn),
      this.risk.getRiskRegistrations(crn),
    ])
    return {
      ...this.getViewModel(crn, offender, BreadcrumbType.RemovedRisksList),
      removedRisks: registrationFlags.inactive,
    }
  }

  @Get('removed-risk/:id(\\d+)')
  @Render('case/risk/registration-detail')
  @Breadcrumb({
    type: BreadcrumbType.RemovedRiskDetails,
    parent: BreadcrumbType.RemovedRisksList,
    title: options => options.entityName,
  })
  async getRemovedRiskDetails(
    @Param('crn') crn: string,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<RiskDetailsViewModel | RedirectResponse> {
    const [offender, registration] = await Promise.all([
      this.offender.getOffenderSummary(crn),
      this.risk.getRiskRegistrationDetails(crn, id),
    ])

    if (!registration.removed) {
      return RedirectResponse.found(registration.links.view)
    }

    return {
      ...this.getViewModel(crn, offender, BreadcrumbType.RemovedRiskDetails, {
        entityName: registration.text,
      }),
      registration,
    }
  }

  @Get(':id(\\d+)')
  @Render('case/risk/registration-detail')
  @Breadcrumb({
    type: BreadcrumbType.RiskDetails,
    parent: BreadcrumbType.CaseRisk,
    title: options => options.entityName,
  })
  async getRiskDetails(
    @Param('crn') crn: string,
    @Param('id', ParseIntPipe) riskId: number,
  ): Promise<RiskDetailsViewModel | RedirectResponse> {
    const [offender, registration] = await Promise.all([
      this.offender.getOffenderSummary(crn),
      this.risk.getRiskRegistrationDetails(crn, riskId),
    ])

    if (registration.removed) {
      return RedirectResponse.found(registration.links.view)
    }

    return {
      ...this.getViewModel(crn, offender, BreadcrumbType.RiskDetails, {
        entityName: registration.text,
      }),
      registration,
    }
  }

  private getViewModel(
    crn: string,
    offender: OffenderDetailSummary,
    breadcrumbType: BreadcrumbType,
    partial: Partial<ResolveBreadcrumbOptions> = {},
  ): RiskViewModel {
    const displayName = getDisplayName(offender)
    const links = this.links.of({ crn, offenderName: displayName, ...partial })
    return {
      displayName,
      breadcrumbs: links.breadcrumbs(breadcrumbType),
    }
  }
}
