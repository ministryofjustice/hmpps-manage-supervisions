import { Controller, Get, Param, Render } from '@nestjs/common'
import { OffenderService } from '../offender.service'
import { SentenceService } from '../sentence'
import { ConfigService } from '@nestjs/config'
import { Config, DeliusConfig, OASysConfig } from '../../../config'
import { Breadcrumb, BreadcrumbType, LinksService } from '../../../common/links'
import { DeliusExitViewModel, ExitViewModel, OASysExitViewModel } from './exit.types'
import { getDisplayName } from '../../../util'
import { DateTime } from 'luxon'
import { OffenderDetail } from '../../../community-api/client'

@Controller('offender/:crn(\\w+)')
export class ExitController {
  constructor(
    private readonly offender: OffenderService,
    private readonly sentence: SentenceService,
    private readonly config: ConfigService<Config>,
    private readonly links: LinksService,
  ) {}

  @Get('to-delius')
  @Render('offenders/offender/exit/to-delius')
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
    if (convictionId) contactLog.searchParams.set('eventId', convictionId.toString())

    const homePage = new URL('/NDelius-war/delius/JSP/homepage.jsp', this.config.get<DeliusConfig>('delius').baseUrl)

    return {
      ...this.getBase(offender, BreadcrumbType.ExitToDelius),
      links: {
        deliusContactLog: contactLog.href,
        deliusHomePage: homePage.href,
      },
    }
  }

  @Get('to-oasys')
  @Render('offenders/offender/exit/to-oasys')
  @Breadcrumb({
    type: BreadcrumbType.ExitToOASys,
    parent: BreadcrumbType.Case,
    title: 'Continue on OASys',
  })
  async getOASysExit(@Param('crn') crn: string): Promise<OASysExitViewModel> {
    const offender = await this.offender.getOffenderDetail(crn)
    return {
      ...this.getBase(offender, BreadcrumbType.ExitToOASys),
      links: {
        oasysHomePage: this.config.get<OASysConfig>('oasys').baseUrl.href,
      },
    }
  }

  private getBase(offender: OffenderDetail, breadcrumb: BreadcrumbType): ExitViewModel {
    const displayName = getDisplayName(offender)
    return {
      breadcrumbs: this.links.resolveAll(breadcrumb, { crn: offender.otherIds.crn, offenderName: displayName }),
      offender: {
        ids: {
          crn: offender.otherIds.crn.toUpperCase(),
          pnc: offender.otherIds.pncNumber,
        },
        displayName,
        shortName: getDisplayName(offender, { middleNames: false }),
        dateOfBirth: offender.dateOfBirth && DateTime.fromISO(offender.dateOfBirth),
      },
    }
  }
}
