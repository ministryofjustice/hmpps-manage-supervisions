import { Controller, Get, Param, Render } from '@nestjs/common'
import { Breadcrumb, BreadcrumbType, LinksService } from '../../../common/links'
import { PersonalService } from './personal.service'
import { OffenderService } from '../offender.service'
import { PersonalAddressesViewModel, PersonalDisabilitiesViewModel } from './personal.types'
import { getDisplayName } from '../../../util'

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

    const displayName = getDisplayName(offender)
    return {
      ...this.personal.getAddressDetail(offender),
      displayName,
      breadcrumbs: this.links.resolveAll(BreadcrumbType.PersonalAddresses, {
        crn,
        offenderName: displayName,
      }),
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
    const displayName = getDisplayName(offender)
    return {
      disabilities: this.personal.getDisabilities(offender),
      displayName,
      breadcrumbs: this.links.resolveAll(BreadcrumbType.PersonalDisabilities, {
        crn,
        offenderName: displayName,
      }),
    }
  }

  @Get('circumstances')
  @Render('offenders/offender/personal/circumstances')
  @Breadcrumb({
    type: BreadcrumbType.PersonalCircumstances,
    parent: BreadcrumbType.PersonalDetails,
    title: 'Personal circumstances',
  })
  async getPersonalCircumstances(): Promise<any> {
    throw new Error('not implemented')
  }
}
