import { Injectable } from '@nestjs/common'
import { OffenderDetail, OffenderDetailSummary } from '../../community-api/client'
import { CommunityApiService } from '../../community-api'
import { CASE_BREADCRUMBS, CasePage, CasePageLinks, CaseViewModel, CaseViewModelBase } from '../case.types'
import { getDisplayName } from '../../util'
import { BreadcrumbType, LinksService } from '../../common/links'

@Injectable()
export class OffenderService {
  constructor(private readonly community: CommunityApiService, private readonly links: LinksService) {}

  async getOffenderDetail(crn: string): Promise<OffenderDetail> {
    const { data } = await this.community.offender.getOffenderDetailByCrnUsingGET({ crn })
    return data
  }

  async getOffenderSummary(crn: string): Promise<OffenderDetailSummary> {
    const { data } = await this.community.offender.getOffenderSummaryByCrnUsingGET({ crn })
    return data
  }

  casePageOf<Model extends CaseViewModel>(
    offender: OffenderDetailSummary,
    partial: Omit<Model, Exclude<keyof CaseViewModelBase<Model['page']>, 'page'>>,
    breadcrumb = CASE_BREADCRUMBS[partial.page],
    entityName?: string,
  ): Model {
    const crn = offender.otherIds.crn
    const links = this.links.of({ crn, offenderName: getDisplayName(offender), entityName })
    return {
      ...partial,
      ids: {
        crn: crn.toUpperCase(),
        pnc: offender.otherIds.pncNumber,
      },
      displayName: getDisplayName(offender, { preferredName: true }),
      shortName: getDisplayName(offender, { middleNames: false, preferredName: false }),
      breadcrumbs: links.breadcrumbs(breadcrumb),
      links: {
        ...Object.values(CasePage).reduce(
          (agg, x) => ({ ...agg, [x]: links.url(CASE_BREADCRUMBS[x]) }),
          {} as CasePageLinks,
        ),
        arrangeAppointment: links.url(BreadcrumbType.NewAppointment),
        addActivity: links.url(BreadcrumbType.ExitToDelius),
        addressBook: links.url(BreadcrumbType.PersonalAddresses),
        circumstances: links.url(BreadcrumbType.PersonalCircumstances),
        disabilities: links.url(BreadcrumbType.PersonalDisabilities),
        toDelius: links.url(BreadcrumbType.ExitToDelius),
        toOASys: links.url(BreadcrumbType.ExitToOASys),
        viewInactiveRegistrations: links.url(BreadcrumbType.RemovedRisksList),
        previousConvictions: links.url(BreadcrumbType.CasePreviousConvictions),
        startBreach: links.url(BreadcrumbType.ExitToDelius), // TODO: redirecting to delius interstitial for now
        additionalOffences: links.url(BreadcrumbType.CaseSentenceOffences),
      },
    } as Model
  }
}
