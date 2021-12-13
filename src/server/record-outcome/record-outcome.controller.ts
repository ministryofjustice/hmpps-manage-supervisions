import { Controller, Get, Param, ParseEnumPipe, ParseIntPipe, Post, Render, Session } from '@nestjs/common'
import { FormBuilderController } from '../util/form-builder'
import { RecordOutcomeDto, RecordOutcomeSession } from './record-outcome.dto'
import { RecordOutcomeInitViewModel, RecordOutcomeStep, RecordOutcomeViewModel } from './record-outcome.types'
import { SessionBuilderService } from './session-builder/session-builder.service'
import { StateMachineService } from './state-machine/state-machine.service'
import { ViewModelFactoryService } from './view-model-factory/view-model-factory.service'
import { CurrentSecurityContext, Role, Roles, SecurityContext } from '../security'
import { Breadcrumb, BreadcrumbType } from '../common/links'
import { EligibleCaseloadOnly } from '../security/eligibility'
import { DynamicRedirect, DynamicRender, RedirectResponse } from '../common/dynamic-routing'
import { DynamicRouting } from '../common/dynamic-routing/dynamic-routing.decorator'
import { BodyClassFromParam } from '../common'
import { FeaturesEnabled } from '../common/features-enabled'
import { FeatureFlags } from '../config'

// TODO split by appointment id
interface RecordOutcomeSessionPartial {
  recordOutcome?: RecordOutcomeSession
}

@Controller(`/case/:crn(\\w+)/appointment/:id(\\d+)/record-outcome`)
@Roles(Role.ReadWrite)
@FeaturesEnabled(FeatureFlags.RecordOutcome)
export class RecordOutcomeController extends FormBuilderController<
  RecordOutcomeDto,
  RecordOutcomeStep,
  RecordOutcomeViewModel
> {
  constructor(
    stateMachine: StateMachineService,
    private readonly viewModelFactory: ViewModelFactoryService,
    sessionBuilder: SessionBuilderService,
  ) {
    super(RecordOutcomeDto, stateMachine, viewModelFactory, sessionBuilder)
  }

  @Get()
  @Render('record-outcome/views/init')
  @Breadcrumb({
    type: BreadcrumbType.RecordOutcome,
    parent: BreadcrumbType.Appointment,
    title: 'Record outcome',
  })
  @EligibleCaseloadOnly()
  async get(
    @Param('crn') crn: string,
    @Param('id', ParseIntPipe) id: number,
    @Session() session: RecordOutcomeSessionPartial,
    @CurrentSecurityContext() security: SecurityContext,
  ): Promise<RecordOutcomeInitViewModel> {
    session.recordOutcome = {}
    const response = await this.init(crn, session.recordOutcome, security, { id })
    return this.viewModelFactory.init(session.recordOutcome, response.url)
  }

  @Get(':step([-\\w]+)')
  @DynamicRouting(DynamicRedirect(), DynamicRender('record-outcome/views/param:step'))
  @Breadcrumb({
    type: BreadcrumbType.RecordOutcomeStep,
    parent: BreadcrumbType.Appointment,
    title: 'Record outcome',
  })
  async getStep(
    @Param('crn') crn: string,
    @Param('id', ParseIntPipe) id: number,
    @Param('step', new ParseEnumPipe(RecordOutcomeStep)) step: RecordOutcomeStep,
    @Session() session: RecordOutcomeSessionPartial,
  ): Promise<RecordOutcomeViewModel | RedirectResponse> {
    if (!session.recordOutcome) {
      session.recordOutcome = {}
    }
    return this.viewStep(crn, step, session.recordOutcome, { id })
  }

  @Post(':step([-\\w]+)')
  @DynamicRouting(DynamicRedirect(), DynamicRender('record-outcome/views/param:step'))
  async postStep(
    @Param('crn') crn: string,
    @Param('id', ParseIntPipe) id: number,
    @Param('step', new ParseEnumPipe(RecordOutcomeStep)) step: RecordOutcomeStep,
    @Session() session: RecordOutcomeSessionPartial,
    @BodyClassFromParam('step') body: RecordOutcomeDto,
  ): Promise<RecordOutcomeViewModel | RedirectResponse> {
    if (!session.recordOutcome) {
      session.recordOutcome = {}
    }
    return this.updateStep(crn, step, session.recordOutcome, body, { id })
  }
}
