import { Controller, Get, Param, Render } from '@nestjs/common'
import { OffenderService } from '../offender.service'
import { DeliusExitViewModel } from './delius-exit.types'
import { SentenceService } from '../sentence'
import { ConfigService } from '@nestjs/config'
import { Config, DeliusConfig } from '../../../config'
import { getDisplayName } from '../../../util'
import { DateTime } from 'luxon'
import { Breadcrumb, BreadcrumbType, LinksService } from '../../../common/links'

@Controller('offender/:crn(\\w+)/to-delius')
export class DeliusExitController {
  constructor(
    private readonly offender: OffenderService,
    private readonly sentence: SentenceService,
    private readonly config: ConfigService<Config>,
    private readonly links: LinksService,
  ) {}

  @Get()
  @Render('offenders/offender/delius-exit/delius-exit')
  @Breadcrumb({
    type: BreadcrumbType.ExitToDelius,
    parent: BreadcrumbType.Case,
    title: 'Continue on National Delius',
  })
  async getDeliusExit(@Param('crn') crn: string): Promise<DeliusExitViewModel> {
    const [offender, convictionId] = await Promise.all([
      this.offender.getOffenderDetail(crn),
      this.sentence.getConvictionId(crn),
    ])

    const contactLog = new URL('/NDelius-war/delius/JSP/deeplink.jsp', this.config.get<DeliusConfig>('delius').baseUrl)
    contactLog.searchParams.set('component', 'ContactList')
    contactLog.searchParams.set('offenderId', offender.offenderId.toString())
    contactLog.searchParams.set('eventId', convictionId.toString())

    const homePage = new URL('/NDelius-war/delius/JSP/homepage.jsp', this.config.get<DeliusConfig>('delius').baseUrl)

    const displayName = getDisplayName(offender)
    return {
      breadcrumbs: this.links.resolveAll(BreadcrumbType.ExitToDelius, { crn, offenderName: displayName }),
      links: {
        deliusContactLog: contactLog.href,
        deliusHomePage: homePage.href,
      },
      ids: {
        crn: crn.toUpperCase(),
        pnc: offender.otherIds.pncNumber,
      },
      displayName,
      shortName: getDisplayName(offender, { middleNames: false }),
      dateOfBirth: offender.dateOfBirth && DateTime.fromISO(offender.dateOfBirth),
    }
  }
}
