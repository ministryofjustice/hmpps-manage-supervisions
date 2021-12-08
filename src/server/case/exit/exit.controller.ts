import { Controller, Get, Logger, Param, ParseIntPipe, Redirect, Render } from '@nestjs/common'
import { OffenderService } from '../offender'
import { SentenceService } from '../sentence'
import { ConfigService } from '@nestjs/config'
import { Config, DeliusConfig, OASysConfig } from '../../config'
import { Breadcrumb, BreadcrumbType, LinksService, Utm } from '../../common/links'
import { DeliusExitViewModel, OASysExitViewModel } from './exit.types'
import { getDisplayName, urlJoin } from '../../util'
import { DateTime } from 'luxon'
import { OffenderDetail } from '../../community-api/client'
import { UtmTags, ViewModel } from '../../common'
import { URL } from 'url'
import { RedirectResponse } from '../../common/dynamic-routing'
import { OffenderExitViewModel } from '../../views/partials/exit/exit.types'

@Controller('case/:crn(\\w+)')
export class ExitController {
  private readonly exitTrackingLogger = new Logger('ExitTracking')

  constructor(
    private readonly offender: OffenderService,
    private readonly sentence: SentenceService,
    private readonly config: ConfigService<Config>,
    private readonly links: LinksService,
  ) {}

  @Get('to-delius')
  @Render('case/exit/to-delius')
  @Breadcrumb({
    type: BreadcrumbType.ExitToDelius,
    parent: BreadcrumbType.Case,
    title: 'Continue on National Delius',
    requiresUtm: true,
  })
  async getDeliusExit(@Param('crn') crn: string, @UtmTags() utm: Utm): Promise<DeliusExitViewModel> {
    return this.getDeliusExitViewModel(crn, utm)
  }

  @Get('to-delius-homepage-now')
  @Redirect()
  @Breadcrumb({ type: BreadcrumbType.ExitToDeliusHomepageNow, requiresUtm: true })
  async toDeliusHomepageNow(@Param('crn') crn: string, @UtmTags() utm: Utm): Promise<RedirectResponse> {
    const result = await this.getDeliusExitViewModel(crn, utm)
    return RedirectResponse.found(result.links.deliusHomePage)
  }

  @Get('to-delius-contact-log-now')
  @Redirect()
  @Breadcrumb({ type: BreadcrumbType.ExitToDeliusContactLogNow, requiresUtm: true })
  async toDeliusContactLogNow(@Param('crn') crn: string, @UtmTags() utm: Utm): Promise<RedirectResponse> {
    const result = await this.getDeliusExitViewModel(crn, utm)
    return RedirectResponse.found(result.links.deliusContactLog)
  }

  @Get('contact/:id(\\d+)/to-delius')
  @Render('case/exit/to-delius')
  @Breadcrumb({
    type: BreadcrumbType.ExitToDeliusContact,
    parent: BreadcrumbType.Case,
    title: 'Continue on National Delius',
    requiresUtm: true,
  })
  async getDeliusContactExit(
    @Param('crn') crn: string,
    @Param('id', ParseIntPipe) contactId: number,
    @UtmTags() utm: Utm,
  ): Promise<DeliusExitViewModel> {
    return this.getDeliusExitViewModel(crn, utm, contactId)
  }

  @Get('contact/:id(\\d+)/to-delius-now')
  @Redirect()
  @Breadcrumb({ type: BreadcrumbType.ExitToDeliusContactNow, requiresUtm: true })
  async toDeliusContactNow(
    @Param('crn') crn: string,
    @Param('id', ParseIntPipe) contactId: number,
    @UtmTags() utm: Utm,
  ): Promise<RedirectResponse> {
    const result = await this.getDeliusExitViewModel(crn, utm, contactId)
    return RedirectResponse.found(result.links.deliusContactLog)
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

  private async getDeliusExitViewModel(crn: string, utm: Utm, contactId?: number) {
    this.exitTrackingLogger.log('delius exit', { crn, contactId, utm, exit: 'delius' })

    const [offender, conviction] = await Promise.all([
      this.offender.getOffenderDetail(crn),
      this.sentence.getCurrentConvictionSummary(crn),
    ])

    const { baseUrl } = this.config.get<DeliusConfig>('delius')

    const deep = new URL(urlJoin(baseUrl, '/NDelius-war/delius/JSP/deeplink.jsp'))
    if (contactId) {
      deep.searchParams.set('component', 'Contact')
      deep.searchParams.set('componentId', contactId.toString())
    } else {
      deep.searchParams.set('component', 'ContactList')
      deep.searchParams.set('offenderId', offender.offenderId.toString())
      if (conviction) {
        deep.searchParams.set('eventId', conviction.id.toString())
      }
    }

    return {
      ...this.getBase(
        offender,
        contactId === undefined ? BreadcrumbType.ExitToDelius : BreadcrumbType.ExitToDeliusContact,
      ),
      links: {
        deliusContactLog: deep.href,
        deliusHomePage: new URL(urlJoin(baseUrl, '/NDelius-war/delius/JSP/homepage.jsp')).href,
      },
    }
  }

  private getBase(
    offender: OffenderDetail,
    breadcrumb: BreadcrumbType,
  ): { offender: OffenderExitViewModel } & ViewModel {
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
