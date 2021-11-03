import { AppointmentBuilderDto } from './dto/AppointmentBuilderDto'
import { AppointmentWizardStep, AppointmentWizardViewModel } from './dto/AppointmentWizardViewModel'
import { AppointmentWizardSession } from './dto/AppointmentWizardSession'
import { AppointmentFormBuilderService } from './appointment-form-builder.service'
import { Controller, Get, Param, ParseEnumPipe, Post, Redirect, Session } from '@nestjs/common'
import { BodyClassFromParam } from '../common'
import { Breadcrumb, BreadcrumbType } from '../common/links'
import { Role, Roles, CurrentSecurityContext, SecurityContext } from '../security'
import { EligibleCaseloadOnly } from '../security/eligibility'
import { ViewModelFactoryService } from './view-model-factory/view-model-factory.service'
import { SessionBuilderService } from './session-builder/session-builder.service'
import { FormBuilderController } from '../util/form-builder'
import { DynamicRedirect, DynamicRender, RedirectResponse } from '../common/dynamic-routing'
import { DynamicRouting } from '../common/dynamic-routing/dynamic-routing.decorator'

interface AppointmentSessionPartial {
  arrangeAppointment?: AppointmentWizardSession
}

@Controller(`/case/:crn(\\w+)/arrange-appointment`)
@Roles(Role.ReadWrite)
export class ArrangeAppointmentController extends FormBuilderController<
  AppointmentBuilderDto,
  AppointmentWizardStep,
  AppointmentWizardViewModel
> {
  constructor(
    wizard: AppointmentFormBuilderService,
    factory: ViewModelFactoryService,
    sessionBuilder: SessionBuilderService,
  ) {
    super(AppointmentBuilderDto, wizard, factory, sessionBuilder)
  }

  @Get()
  @Redirect()
  @Breadcrumb({
    type: BreadcrumbType.NewAppointment,
    parent: BreadcrumbType.Case,
    title: 'New appointment',
  })
  @EligibleCaseloadOnly()
  async get(
    @Param('crn') crn: string,
    @Session() session: AppointmentSessionPartial,
    @CurrentSecurityContext() security: SecurityContext,
  ): Promise<RedirectResponse> {
    session.arrangeAppointment = {}
    return this.init(crn, session.arrangeAppointment, security)
  }

  @Get(':step([-\\w]+)')
  @DynamicRouting(DynamicRedirect, DynamicRender('arrange-appointment/views/param:step'))
  @Breadcrumb({
    type: BreadcrumbType.NewAppointmentStep,
    parent: BreadcrumbType.Case,
    title: 'New appointment',
  })
  async getStep(
    @Param('crn') crn: string,
    @Param('step', new ParseEnumPipe(AppointmentWizardStep)) step: AppointmentWizardStep,
    @Session() session: AppointmentSessionPartial,
  ): Promise<AppointmentWizardViewModel | RedirectResponse> {
    if (!session.arrangeAppointment) {
      session.arrangeAppointment = {}
    }
    return this.viewStep(crn, step, session.arrangeAppointment)
  }

  @Post(':step([-\\w]+)')
  @DynamicRouting(DynamicRedirect, DynamicRender('arrange-appointment/views/param:step'))
  @DynamicRedirect()
  async postStep(
    @Param('crn') crn: string,
    @Param('step', new ParseEnumPipe(AppointmentWizardStep)) step: AppointmentWizardStep,
    @Session() session: AppointmentSessionPartial,
    @BodyClassFromParam('step') body: AppointmentBuilderDto,
  ): Promise<AppointmentWizardViewModel | RedirectResponse> {
    if (!session.arrangeAppointment) {
      session.arrangeAppointment = {}
    }
    return this.updateStep(crn, step, session.arrangeAppointment, body)
  }
}
