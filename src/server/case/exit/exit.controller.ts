import { Controller, Get, Logger, Param, Redirect, Render } from '@nestjs/common'
import { OffenderService } from '../offender'
import { SentenceService } from '../sentence'
import { ConfigService } from '@nestjs/config'
import { Config, DeliusConfig, OASysConfig } from '../../config'
import { Breadcrumb, BreadcrumbType, LinksService, Utm } from '../../common/links'
import { DeliusExitViewModel, ExitViewModel, OASysExitViewModel } from './exit.types'
import { getDisplayName, urlJoin } from '../../util'
import { DateTime } from 'luxon'
import { OffenderDetail } from '../../community-api/client'
import { UtmTags } from '../../common'
import { URL } from 'url'
import { RedirectResponse } from '../../common/dynamic-routing'

@Controller('case/:crn(\\w+)')
export class ExitController {
  private readonly exitTrackingLogger = new Logger('ExitTracking')

  constructor(
    private readonly offender: OffenderService,
    private readonly sentence: SentenceService,
    private readonly config: ConfigService<Config>,
    private readonly links: LinksService,
  ) {}

  @Get('to-delius-now')
  @Redirect()
  @Breadcrumb({
    type: BreadcrumbType.ExitToDeliusNow,
    requiresUtm: true,
  })
  async getDeliusExitNow(@Param('crn') crn: string, @UtmTags() utm: Utm): Promise<RedirectResponse> {
    const result = await this.getDeliusExit(crn, utm)
    return RedirectResponse.found(result.links.deliusContactLog)
  }

  @Get('to-delius')
  @Render('case/exit/to-delius')
  @Breadcrumb({
    type: BreadcrumbType.ExitToDelius,
    parent: BreadcrumbType.Case,
    title: 'Continue on National Delius',
    requiresUtm: true,
  })
  async getDeliusExit(@Param('crn') crn: string, @UtmTags() utm: Utm): Promise<DeliusExitViewModel> {
    this.exitTrackingLogger.log('delius exit', { crn, utm, exit: 'delius' })

    const [offender, conviction] = await Promise.all([
      this.offender.getOffenderDetail(crn),
      this.sentence.getCurrentConvictionSummary(crn),
    ])

    const { baseUrl } = this.config.get<DeliusConfig>('delius')
    const contactLog = new URL(urlJoin(baseUrl, '/NDelius-war/delius/JSP/deeplink.jsp'))
    contactLog.searchParams.set('component', 'ContactList')
    contactLog.searchParams.set('offenderId', offender.offenderId.toString())
    if (conviction) {
      contactLog.searchParams.set('eventId', conviction.id.toString())
    }

    const homePage = new URL(urlJoin(baseUrl, '/NDelius-war/delius/JSP/homepage.jsp'))

    return {
      ...this.getBase(offender, BreadcrumbType.ExitToDelius),
      links: {
        deliusContactLog: contactLog.href,
        deliusHomePage: homePage.href,
      },
    }
  }

  @Get('to-oasys')
  @Render('case/exit/to-oasys')
  @Breadcrumb({
    type: BreadcrumbType.ExitToOASys,
    parent: BreadcrumbType.Case,
    title: 'Continue on OASys',
    requiresUtm: true,
  })
  async getOASysExit(@Param('crn') crn: string, @UtmTags() utm: Utm): Promise<OASysExitViewModel> {
    this.exitTrackingLogger.log('oasys exit', { crn, utm, exit: 'oasys' })

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
