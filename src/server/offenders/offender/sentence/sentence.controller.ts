import { Controller, Param, Get, Render } from '@nestjs/common'
import { OffencesViewModel } from './sentence.types'
import { Breadcrumb, BreadcrumbType, LinksService } from '../../../common/links'
import { OffenderService } from '../offender.service'
import { getDisplayName } from '../../../util/person'

@Controller('offender/:crn(\\w+)/sentence')
export class SentenceController {
  constructor(private readonly offender: OffenderService, private readonly links: LinksService) {}

  @Get('offences')
  @Render('offenders/offender/sentence/offences')
  @Breadcrumb({
    type: BreadcrumbType.CaseSentenceOffences,
    parent: BreadcrumbType.CaseSentence,
    title: 'Offences',
  })
  async getOffences(@Param('crn') crn: string): Promise<OffencesViewModel> {
    const offender = await this.offender.getOffenderDetail(crn)
    const displayName = getDisplayName(offender)
    return {
      displayName,
      breadcrumbs: this.links.resolveAll(BreadcrumbType.CaseSentenceOffences, {
        crn,
        offenderName: displayName,
      }),
    }
  }
}
