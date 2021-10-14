import { Controller, Get, NotFoundException, Param, ParseIntPipe, Render } from '@nestjs/common'
import { Breadcrumb, BreadcrumbType, LinksService, ResolveBreadcrumbOptions } from '../../common/links'
import { PersonalService } from './personal.service'
import { OffenderService } from '../offender'
import {
  PersonalAddressesViewModel,
  PersonalCircumstancesViewModel,
  PersonalContactViewModel,
  PersonalDisabilitiesViewModel,
  PersonalViewModel,
} from './personal.types'
import { getDisplayName } from '../../util'
import { OffenderDetailSummary } from '../../community-api/client'
import { CasePage, CasePersonalViewModel } from '../case.types'
import { CaseTabbedPage } from '../case-tabbed-page.decorators'
import { RiskService } from '../risk'

@Controller('case/:crn(\\w+)/personal')
export class PersonalController {
  constructor(
    private readonly offender: OffenderService,
    private readonly personal: PersonalService,
    private readonly risk: RiskService,
    private readonly links: LinksService,
  ) {}

  @Get()
  @Render('case/personal/personal')
  @CaseTabbedPage({ page: CasePage.Personal, title: 'Personal details' })
  async getPersonal(@Param('crn') crn: string): Promise<CasePersonalViewModel> {
    const [offender, personalContacts, personalCircumstances, criminogenicNeeds] = await Promise.all([
      this.offender.getOffenderDetail(crn),
      this.personal.getPersonalContacts(crn),
      this.personal.getPersonalCircumstances(crn),
      this.risk.getNeeds(crn),
    ])

    return this.offender.casePageOf<CasePersonalViewModel>(offender, {
      page: CasePage.Personal,
      ...this.personal.getPersonalDetails(offender, personalContacts, personalCircumstances, criminogenicNeeds),
    })
  }

  @Get('addresses')
  @Render('case/personal/addresses')
  @Breadcrumb({
    type: BreadcrumbType.PersonalAddresses,
    parent: BreadcrumbType.PersonalDetails,
    title: 'Addresses',
  })
  async getAddresses(@Param('crn') crn: string): Promise<PersonalAddressesViewModel> {
    const offender = await this.offender.getOffenderDetail(crn)
    return {
      ...this.getViewModel(crn, offender, BreadcrumbType.PersonalAddresses),
      ...this.personal.getAddressDetail(offender),
    }
  }

  @Get('disabilities')
  @Render('case/personal/disabilities')
  @Breadcrumb({
    type: BreadcrumbType.PersonalDisabilities,
    parent: BreadcrumbType.PersonalDetails,
    title: 'Disabilities and adjustments',
  })
  async getDisabilities(@Param('crn') crn: string): Promise<PersonalDisabilitiesViewModel> {
    const offender = await this.offender.getOffenderDetail(crn)
    return {
      ...this.getViewModel(crn, offender, BreadcrumbType.PersonalDisabilities),
      disabilities: this.personal.getDisabilities(offender),
    }
  }

  @Get('circumstances')
  @Render('case/personal/circumstances')
  @Breadcrumb({
    type: BreadcrumbType.PersonalCircumstances,
    parent: BreadcrumbType.PersonalDetails,
    title: 'Personal circumstances',
  })
  async getPersonalCircumstances(@Param('crn') crn: string): Promise<PersonalCircumstancesViewModel> {
    const [offender, circumstances] = await Promise.all([
      this.offender.getOffenderSummary(crn),
      this.personal.getPersonalCircumstances(crn),
    ])
    return {
      ...this.getViewModel(crn, offender, BreadcrumbType.PersonalCircumstances),
      circumstances,
    }
  }

  @Get('personal-contacts/:id(\\d+)')
  @Render('case/personal/personal-contact')
  @Breadcrumb({
    type: BreadcrumbType.PersonalContact,
    parent: BreadcrumbType.PersonalDetails,
    title: x => `Personal contact: ${x.entityName}`,
  })
  async getPersonalContact(
    @Param('crn') crn: string,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<PersonalContactViewModel> {
    const [offender, personalContacts] = await Promise.all([
      this.offender.getOffenderSummary(crn),
      this.personal.getPersonalContacts(crn),
    ])

    const personalContact = personalContacts.find(x => x.id === id)
    if (!personalContact) {
      throw new NotFoundException(`Personal contact with id ${id} does not exist`)
    }

    return {
      ...this.getViewModel(crn, offender, BreadcrumbType.PersonalContact, {
        id,
        entityName: personalContact.description,
      }),
      personalContact,
      ids: {
        crn: offender.otherIds.crn,
      },
    }
  }

  private getViewModel(
    crn: string,
    offender: OffenderDetailSummary,
    breadcrumbType: BreadcrumbType,
    partial: Partial<ResolveBreadcrumbOptions> = {},
  ): PersonalViewModel {
    const displayName = getDisplayName(offender)
    const links = this.links.of({ crn, offenderName: displayName, ...partial })
    return {
      displayName,
      breadcrumbs: links.breadcrumbs(breadcrumbType),
      links: { toDelius: links.url(BreadcrumbType.ExitToDelius) },
    }
  }
}
