import { Controller, Get, Param, ParseIntPipe, Render } from '@nestjs/common'
import { Breadcrumb, BreadcrumbType, LinksService, ResolveBreadcrumbOptions } from '../../../common/links'
import { RiskService } from './risk.service'
import { RemovedRisksListViewModel, RiskDetailsViewModel, RiskViewModel } from './risk.types'
import { getDisplayName } from '../../../util'
import { OffenderDetailSummary } from '../../../community-api/client'
import { OffenderService } from '../offender.service'
import { RedirectResponse } from '../../../common'

@Controller('offender/:crn(\\w+)/risk')
export class RiskController {
  constructor(
    private readonly offender: OffenderService,
    private readonly risk: RiskService,
    private readonly links: LinksService,
  ) {}

  @Get('removed-risk-flags')
  @Render('offenders/offender/risk/removed-risk-flags')
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
  @Render('offenders/offender/risk/registration-detail')
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
      return RedirectResponse.found(registration.link)
    }

    return {
      ...this.getViewModel(crn, offender, BreadcrumbType.RemovedRiskDetails, {
        entityName: registration.text,
      }),
      registration,
    }
  }

  @Get(':id(\\d+)')
  @Render('offenders/offender/risk/registration-detail')
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
      return RedirectResponse.found(registration.link)
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
    return {
      displayName,
      breadcrumbs: this.links.resolveAll(breadcrumbType, {
        crn,
        offenderName: displayName,
        ...partial,
      }),
    }
  }
}
