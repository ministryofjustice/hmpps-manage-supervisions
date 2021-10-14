import { Controller, Get, Param, ParseIntPipe, Render } from '@nestjs/common'
import { ActivityService } from './activity.service'
import {
  ActivityComplianceFilter,
  AppointmentViewModel,
  CommunicationViewModel,
  FilterLinks,
  OtherActivityLogEntryViewModel,
} from './activity.types'
import { OffenderService } from '../offender'
import { getDisplayName } from '../../util'
import { Breadcrumb, BreadcrumbType, LinksService } from '../../common/links'
import { CaseActivityViewModel, CasePage } from '../case.types'
import { CaseTabbedPage } from '../case-tabbed-page.decorators'
import { SentenceService } from '../sentence'

@Controller('case/:crn(\\w+)/activity')
export class ActivityController {
  constructor(
    private readonly offender: OffenderService,
    private readonly activity: ActivityService,
    private readonly links: LinksService,
    private readonly sentence: SentenceService,
  ) {}

  @Get()
  @Render('case/activity/activity')
  @CaseTabbedPage({ page: CasePage.Activity, title: 'Activity log' })
  async getActivity(@Param('crn') crn: string): Promise<CaseActivityViewModel> {
    return this.activityPageCommon(crn)
  }

  @Get(':filter')
  @Render('case/activity/activity')
  @Breadcrumb({
    type: BreadcrumbType.CaseActivityLogWithComplianceFilter,
    parent: BreadcrumbType.CaseActivityLog,
    title: options => options.entityName,
  })
  async getActivityFiltered(
    @Param('crn') crn: string,
    @Param('filter') complianceFilter: ActivityComplianceFilter,
  ): Promise<CaseActivityViewModel> {
    return this.activityPageCommon(crn, complianceFilter)
  }

  @Get('appointment/:id(\\d+)')
  @Render('case/activity/appointment')
  @Breadcrumb({
    type: BreadcrumbType.Appointment,
    parent: BreadcrumbType.CaseActivityLog,
    title: options => options.entityName,
  })
  async getAppointment(
    @Param('crn') crn: string,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<AppointmentViewModel> {
    const [offender, appointment] = await Promise.all([
      this.offender.getOffenderSummary(crn),
      this.activity.getAppointment(crn, id),
    ])
    const displayName = getDisplayName(offender)
    return {
      displayName,
      appointment,
      breadcrumbs: this.links.resolveAll(BreadcrumbType.Appointment, {
        crn,
        id,
        offenderName: displayName,
        entityName: appointment.name,
        parentOverrides: {
          [BreadcrumbType.Appointment]: appointment.isFuture
            ? BreadcrumbType.CaseSchedule
            : BreadcrumbType.CaseActivityLog,
        },
      }),
    }
  }

  @Get('communication/:id(\\d+)')
  @Render('case/activity/communication')
  @Breadcrumb({
    type: BreadcrumbType.Communication,
    parent: BreadcrumbType.CaseActivityLog,
    title: options => options.entityName,
  })
  async getCommunication(
    @Param('crn') crn: string,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<CommunicationViewModel> {
    const offender = await this.offender.getOffenderSummary(crn)
    const displayName = getDisplayName(offender)
    const contact = await this.activity.getCommunicationContact(crn, id, offender)
    return {
      displayName,
      contact,
      breadcrumbs: this.links.resolveAll(BreadcrumbType.Communication, {
        crn,
        id,
        offenderName: displayName,
        entityName: contact.name,
      }),
    }
  }

  @Get('other/:id(\\d+)')
  @Render('case/activity/other')
  @Breadcrumb({
    type: BreadcrumbType.OtherActivityLogEntry,
    parent: BreadcrumbType.CaseActivityLog,
    title: options => options.entityName,
  })
  async getUnknown(
    @Param('crn') crn: string,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<OtherActivityLogEntryViewModel> {
    const offender = await this.offender.getOffenderSummary(crn)
    const displayName = getDisplayName(offender)
    const contact = await this.activity.getUnknownContact(crn, id)
    return {
      displayName,
      contact,
      breadcrumbs: this.links.resolveAll(BreadcrumbType.OtherActivityLogEntry, {
        crn,
        id,
        offenderName: displayName,
        entityName: contact.name,
      }),
    }
  }

  private async activityPageCommon(
    crn: string,
    complianceFilter?: ActivityComplianceFilter,
  ): Promise<CaseActivityViewModel> {
    const [offender, conviction] = await Promise.all([
      this.offender.getOffenderSummary(crn),
      this.sentence.getCurrentConvictionSummary(crn),
    ])
    const contacts = await this.activity.getActivityLogPage(crn, offender, { complianceFilter, conviction })
    const complianceFilterDescription = complianceFilter && FilterLinks[complianceFilter].description

    return this.offender.casePageOf<CaseActivityViewModel>(
      offender,
      {
        page: CasePage.Activity,
        groups: contacts.content,
        pagination: {
          page: contacts.number,
          size: contacts.size,
        },
        filters: FilterLinks,
        currentFilter: complianceFilter,
        title: complianceFilterDescription,
      },
      complianceFilterDescription && BreadcrumbType.CaseActivityLogWithComplianceFilter,
      complianceFilterDescription,
    )
  }
}
