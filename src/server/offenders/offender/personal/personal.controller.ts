import { Controller, Get, Param, Render } from '@nestjs/common'
import { Breadcrumb, BreadcrumbType, LinksService } from '../../../common/links'
import { PersonalService } from './personal.service'
import { OffenderService } from '../offender.service'
import {
  OffenderViewModel,
  PersonalAddressesViewModel,
  PersonalCircumstancesViewModel,
  PersonalDisabilitiesViewModel,
} from './personal.types'
import { getDisplayName } from '../../../util'
import { OffenderDetail } from '../../../community-api'

@Controller('offender/:crn(\\w+)/personal')
export class PersonalController {
  constructor(
    private readonly offender: OffenderService,
    private readonly personal: PersonalService,
    private readonly links: LinksService,
  ) {}

  @Get('addresses')
  @Render('offenders/offender/personal/addresses')
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
  @Render('offenders/offender/personal/disabilities')
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
  @Render('offenders/offender/personal/circumstances')
  @Breadcrumb({
    type: BreadcrumbType.PersonalCircumstances,
    parent: BreadcrumbType.PersonalDetails,
    title: 'Personal circumstances',
  })
  async getPersonalCircumstances(@Param('crn') crn: string): Promise<PersonalCircumstancesViewModel> {
    const [offender, circumstances] = await Promise.all([
      this.offender.getOffenderDetail(crn),
      this.personal.getPersonalCircumstances(crn),
    ])
    return {
      ...this.getViewModel(crn, offender, BreadcrumbType.PersonalCircumstances),
      circumstances,
    }
  }

  private getViewModel(crn: string, offender: OffenderDetail, breadcrumbType: BreadcrumbType): OffenderViewModel {
    const displayName = getDisplayName(offender)
    return {
      displayName,
      breadcrumbs: this.links.resolveAll(breadcrumbType, {
        crn,
        offenderName: displayName,
      }),
    }
  }
}
