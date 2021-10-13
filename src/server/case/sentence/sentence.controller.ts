import { Controller, Param, Get, Render } from '@nestjs/common'
import { OffencesViewModel, PreviousConvictionsViewModel } from './sentence.types'
import { Breadcrumb, BreadcrumbType, LinksService } from '../../common/links'
import { OffenderService } from '../offender'
import { getDisplayName } from '../../util'
import { SentenceService } from './sentence.service'
import { CasePage, CaseSentenceViewModel } from '../case.types'
import { CaseTabbedPage } from '../case-tabbed-page.decorators'

@Controller('case/:crn(\\w+)/sentence')
export class SentenceController {
  constructor(
    private readonly offender: OffenderService,
    private readonly links: LinksService,
    private readonly sentence: SentenceService,
  ) {}

  @Get()
  @Render('case/sentence/sentence')
  @CaseTabbedPage({ page: CasePage.Sentence, title: 'Sentence' })
  async getSentence(@Param('crn') crn: string): Promise<CaseSentenceViewModel> {
    const [offender, conviction] = await Promise.all([
      this.offender.getOffenderSummary(crn),
      this.sentence.getConvictionDetails(crn),
    ])

    return this.offender.casePageOf<CaseSentenceViewModel>(offender, {
      page: CasePage.Sentence,
      conviction,
    })
  }

  @Get('offences')
  @Render('case/sentence/offences')
  @Breadcrumb({
    type: BreadcrumbType.CaseSentenceOffences,
    parent: BreadcrumbType.CaseSentence,
    title: 'Offences',
  })
  async getOffences(@Param('crn') crn: string): Promise<OffencesViewModel> {
    const [offender, offence] = await Promise.all([
      this.offender.getOffenderDetail(crn),
      this.sentence.getOffenceDetails(crn),
    ])
    const displayName = getDisplayName(offender)
    return {
      displayName,
      breadcrumbs: this.links.resolveAll(BreadcrumbType.CaseSentenceOffences, {
        crn,
        offenderName: displayName,
      }),
      offence,
    }
  }

  @Get('previous-convictions')
  @Render('case/sentence/previous-convictions')
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
