import { Controller, Get, Param, ParseIntPipe, Post, Render } from '@nestjs/common'
import { URL } from 'url'
import { Role, Roles } from '../security'
import { FeaturesEnabled } from '../common/features-enabled'
import { Config, FeatureFlags, ServerConfig } from '../config'
import { Breadcrumb, BreadcrumbType, LinksHelper, LinksService } from '../common/links'
import { EligibleCaseloadOnly } from '../security/eligibility'
import {
  ENFORCEMENT_GROUP,
  UpdateEnforcementAppointmentSummary,
  UpdateEnforcementDto,
  UpdateEnforcementViewModel,
} from './update-enforcement.types'
import { UpdateEnforcementService } from './update-enforcement.service'
import { getDisplayName } from '../util'
import { BodyClass } from '../common'
import { plainToClass } from 'class-transformer'
import { DEFAULT_GROUP } from '../util/mapping'
import { validate } from 'class-validator'
import { DynamicRedirect, DynamicRender, RedirectResponse } from '../common/dynamic-routing'
import { DynamicRouting } from '../common/dynamic-routing/dynamic-routing.decorator'
import { ConfigService } from '@nestjs/config'
import { EnforcementAction } from '../community-api/client'

@Controller(`/case/:crn(\\w+)/appointment/:id(\\d+)/update-enforcement`)
@Roles(Role.ReadWrite)
@FeaturesEnabled(FeatureFlags.UpdateEnforcement)
@EligibleCaseloadOnly()
export class UpdateEnforcementController {
  constructor(
    private readonly service: UpdateEnforcementService,
    private readonly links: LinksService,
    private readonly config: ConfigService<Config>,
  ) {}

  @Get()
  @Render('update-enforcement/index')
  @Breadcrumb({
    type: BreadcrumbType.UpdateEnforcement,
    parent: BreadcrumbType.Appointment,
    title: 'Update enforcement',
  })
  async get(@Param('crn') crn: string, @Param('id', ParseIntPipe) id: number): Promise<UpdateEnforcementViewModel> {
    const { appointment, links, enforcementActions } = await this.getCommon(crn, id)
    return {
      enforcement: appointment.enforcementCode,
      enforcementActions,
      paths: { back: links.url(BreadcrumbType.Appointment) },
    }
  }

  @Post()
  @DynamicRouting(DynamicRedirect(), DynamicRender('update-enforcement/index'))
  async post(
    @Param('crn') crn: string,
    @Param('id', ParseIntPipe) id: number,
    @BodyClass(ENFORCEMENT_GROUP) body: UpdateEnforcementDto,
  ): Promise<UpdateEnforcementViewModel | RedirectResponse> {
    const { appointment, links, enforcementActions } = await this.getCommon(crn, id)

    const model = plainToClass(
      UpdateEnforcementDto,
      { enforcement: body.enforcement, enforcementActions } as UpdateEnforcementDto,
      { groups: [DEFAULT_GROUP], excludeExtraneousValues: true },
    )

    const errors = await validate(model, { groups: [ENFORCEMENT_GROUP] })
    if (errors.length > 0) {
      return {
        enforcement: appointment.enforcementCode,
        enforcementActions,
        paths: { back: links.url(BreadcrumbType.Appointment) },
      }
    }

    await this.service.updateEnforcement(appointment.id, model.enforcement)

    const { domain } = this.config.get<ServerConfig>('server')
    const url = new URL(links.url(BreadcrumbType.Appointment), domain)
    url.searchParams.set('notification', 'enforcement-action-changed')
    return RedirectResponse.found(url.href)
  }

  private async getCommon(
    crn: string,
    id: number,
  ): Promise<{
    appointment: UpdateEnforcementAppointmentSummary
    links: LinksHelper
    enforcementActions: EnforcementAction[]
  }> {
    const [offender, appointment] = await Promise.all([
      this.service.getOffenderDetail(crn),
      this.service.getAppointmentDetail(crn, id),
    ])
    const links = this.links.of({ id, crn, entityName: appointment.name, offenderName: getDisplayName(offender) })
    const enforcementActions = await this.service.getAvailableEnforcements(appointment)
    return { appointment, links, enforcementActions }
  }
}
