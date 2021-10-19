import { Injectable } from '@nestjs/common'
import { OffenderDetail, OffenderDetailSummary } from '../../community-api/client'
import { CommunityApiService } from '../../community-api'
import { CASE_BREADCRUMBS, CasePage, CasePageLinks, CaseViewModel, CaseViewModelBase } from '../case.types'
import { getDisplayName } from '../../util'
import { BreadcrumbType, LinksHelper, LinksService, ResolveBreadcrumbOptions } from '../../common/links'

export type CasePageLinksOnly<Model extends CaseViewModel> = Omit<Model['links'], keyof CasePageLinks>

export type CasePageOfOptions<Model extends CaseViewModel> = Omit<
  Model,
  Exclude<keyof CaseViewModelBase<Model['page'], {}>, 'page'>
> & {
  breadcrumb?: { type?: BreadcrumbType; options?: ResolveBreadcrumbOptions }
  links?: (links: LinksHelper) => CasePageLinksOnly<Model>
}

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
    {
      breadcrumb: { type: breadcrumb, options: breadcrumbOptions } = {},
      links: linksFactory,
      ...partial
    }: CasePageOfOptions<Model>,
  ): Model {
    const crn = offender.otherIds.crn
    const links = this.links.of({ crn, offenderName: getDisplayName(offender), ...breadcrumbOptions })
    return {
      ...partial,
      ids: {
        crn: crn.toUpperCase(),
        pnc: offender.otherIds.pncNumber,
      },
      displayName: getDisplayName(offender, { preferredName: true }),
      shortName: getDisplayName(offender, { middleNames: false, preferredName: false }),
      breadcrumbs: links.breadcrumbs(breadcrumb || CASE_BREADCRUMBS[partial.page]),
      links: {
        ...Object.values(CasePage).reduce(
          (agg, x) => ({ ...agg, [x]: links.url(CASE_BREADCRUMBS[x]) }),
          {} as CasePageLinks,
        ),
        ...(linksFactory ? linksFactory(links) : {}),
      },
    } as any as Model
  }
}
