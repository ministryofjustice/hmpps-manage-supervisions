import { Controller, Get, Param, Render } from '@nestjs/common'
import { Breadcrumb, BreadcrumbType, LinksService } from '../../../common/links'
import { OffenderService } from '../offender.service'
import { PreviousConvictionsViewModel } from './sentence.types'
import { SentenceService } from './sentence.service'
import { getDisplayName } from '../../../util'

@Controller('offender/:crn(\\w+)/sentence')
export class SentenceController {
  constructor(
    private readonly offender: OffenderService,
    private readonly links: LinksService,
    private readonly sentence: SentenceService,
  ) {}

  @Get('previous-convictions')
  @Render('offenders/offender/sentence/previous-convictions')
  @Breadcrumb({
    type: BreadcrumbType.CasePreviousConvictions,
    parent: BreadcrumbType.CaseSentence,
    title: 'Previous orders',
  })
  async getPreviousConvictions(@Param('crn') crn: string): Promise<PreviousConvictionsViewModel> {
    const [offender, previousConvictions] = await Promise.all([
      this.offender.getOffenderDetail(crn),
      this.sentence.getPreviousConvictions(crn),
    ])
    const displayName = getDisplayName(offender)
    const links = this.links.of({ crn, offenderName: displayName })
    return {
      displayName,
      breadcrumbs: links.breadcrumbs(BreadcrumbType.CasePreviousConvictions),
      previousConvictions,
      links: { toDelius: links.url(BreadcrumbType.ExitToDelius) },
    }
  }
}
