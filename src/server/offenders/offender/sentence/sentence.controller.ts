import { Controller, Param, Get, Render } from '@nestjs/common'
import { OffencesViewModel, PreviousConvictionsViewModel } from './sentence.types'
import { Breadcrumb, BreadcrumbType, LinksService } from '../../../common/links'
import { OffenderService } from '../offender.service'
import { getDisplayName } from '../../../util'
import { SentenceService } from './sentence.service'

@Controller('offender/:crn(\\w+)/sentence')
export class SentenceController {
  constructor(
    private readonly offender: OffenderService,
    private readonly links: LinksService,
    private readonly sentence: SentenceService,
  ) {}

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
