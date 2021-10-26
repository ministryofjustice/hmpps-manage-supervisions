import { ArrangeAppointmentService } from './arrange-appointment.service'
import { plainToClass } from 'class-transformer'
import {
  AppointmentBuilderDto,
  MESSAGES,
  UNSPECIFIED_LOCATION_CODE,
  UNSPECIFIED_LOCATION_DESCRIPTION,
} from './dto/AppointmentBuilderDto'
import { validate, ValidationError } from 'class-validator'
import {
  AppointmentAddNotesViewModel,
  AppointmentLocationViewModel,
  AppointmentNotesViewModel,
  AppointmentSchedulingViewModel,
  AppointmentSensitiveViewModel,
  AppointmentTypeViewModel,
  AppointmentWizardStep,
  AppointmentWizardViewModel,
} from './dto/AppointmentWizardViewModel'
import { AppointmentWizardSession } from './dto/AppointmentWizardSession'
import { AppointmentWizardService, getStepUrl } from './appointment-wizard.service'
import { Controller, Get, Param, Post, Redirect, Render, Session } from '@nestjs/common'
import { DynamicRedirect, RedirectResponse, BodyClass } from '../common'
import { DEFAULT_GROUP } from '../util/mapping'
import { AppointmentTypeRequiresLocation } from '../community-api/client'
import { DateTime } from 'luxon'
import { isActiveDateRange } from '../util'
import { Breadcrumb, BreadcrumbType, LinksService } from '../common/links'
import { Role, Roles, CurrentSecurityContext, SecurityContext } from '../security'
import { EligibleCaseloadOnly } from '../security/eligibility'
import { DeepPartial } from '../app.types'

type RenderOrRedirect = AppointmentWizardViewModel | RedirectResponse

/**
 * TODO the form builder stuff is so meta, once we're on nest we should implement it into an interceptor with metadata
 * e.g. @AppointmentWizardStep(ArrangeAppointmentWizardStep.Type)
 * we would then wrap the request in AppointmentWizardStateService::assertStep
 * & AppointmentWizardStateService::nextStep when the builder model is mutated
 */
@Controller(`/arrange-appointment/:crn(\\w+)`)
@Roles(Role.ReadWrite)
export class ArrangeAppointmentController {
  constructor(
    private readonly service: ArrangeAppointmentService,
    private readonly wizard: AppointmentWizardService,
    private readonly links: LinksService,
  ) {}

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
    @Session() session: AppointmentWizardSession,
    @CurrentSecurityContext() security: SecurityContext,
  ): Promise<RedirectResponse> {
    const response = this.wizard.reset(session, crn)

    const [offender, { conviction }] = await Promise.all([
      this.service.getOffenderDetails(crn),
      this.service.getConvictionAndRarRequirement(crn),
    ])

    const offenderManager = offender.offenderManagers.find(om => om.staff.code == security.staffCode)
    if (!offenderManager) {
      throw new Error(
        `current user with staff code '${security.staffCode}' is not an offender manager for offender with crn '${crn}'`,
      )
    }

    session.appointment.staffCode = offenderManager.staff.code
    session.appointment.teamCode = offenderManager.team.code
    session.appointment.providerCode = offenderManager.probationArea.code
    session.appointment.convictionId = conviction.convictionId
    // Book everything against the event, even if we have a RAR requirement, as we're not asking about RAR requirements yet.
    // When RAR appointment functionality is added, the list of available appointment types will need to be filtered to those that
    // can be used against the RAR requirement main category
    // session.appointment.requirementId = requirement.id
    session.appointment.cja2003Order = conviction.sentence.cja2003Order
    session.appointment.legacyOrder = conviction.sentence.legacyOrder
    return response
  }

  @Get('type')
  @Render('arrange-appointment/views/type')
  @DynamicRedirect()
  async getType(@Param('crn') crn: string, @Session() session: AppointmentWizardSession): Promise<RenderOrRedirect> {
    const redirect = this.wizard.assertStep(session, AppointmentWizardStep.Type, crn)
    if (redirect) {
      return redirect
    }

    return await this.getAppointmentTypeViewModel(session)
  }

  @Post('type')
  @Render('arrange-appointment/views/type')
  @DynamicRedirect()
  async postType(
    @Param('crn') crn: string,
    @Session() session: AppointmentWizardSession,
    @BodyClass(AppointmentWizardStep.Type) body: AppointmentBuilderDto,
  ): Promise<RenderOrRedirect> {
    const redirect = this.wizard.assertStep(session, AppointmentWizardStep.Type, crn)
    if (redirect) {
      return redirect
    }

    const errors = await ArrangeAppointmentController.validateWithSession(body, session, AppointmentWizardStep.Type)
    if (errors.length > 0) {
      return await this.getAppointmentTypeViewModel(session, body, errors)
    }

    body.cja2003Order = session.appointment.cja2003Order
    body.legacyOrder = session.appointment.legacyOrder

    const type = await this.service.getAppointmentType(body)
    if (!type) {
      return await this.getAppointmentTypeViewModel(session, body, [
        {
          property: 'type',
          constraints: {
            isAppointmentType: MESSAGES.type.required,
          },
        },
      ])
    }

    Object.assign(session.appointment, body)
    session.appointment.typeDescription = type.description
    session.appointment.requiresLocation = type.requiresLocation

    if (type.requiresLocation === AppointmentTypeRequiresLocation.Optional) {
      const locations = await this.service.getTeamOfficeLocations(session.appointment.teamCode)
      session.appointment.locationsAvailableForTeam = locations.length > 0

      if (!session.appointment.locationsAvailableForTeam) {
        session.appointment.location = UNSPECIFIED_LOCATION_CODE
        session.appointment.locationDescription = UNSPECIFIED_LOCATION_DESCRIPTION
      }
    }

    if (type.requiresLocation === AppointmentTypeRequiresLocation.NotRequired && session.appointment.location) {
      session.appointment.location = null
      session.appointment.locationDescription = null
    }

    return this.wizard.nextStep(session, AppointmentWizardStep.Type)
  }

  @Get('where')
  @Render('arrange-appointment/views/where')
  @DynamicRedirect()
  async getWhere(@Param('crn') crn: string, @Session() session: AppointmentWizardSession): Promise<RenderOrRedirect> {
    const redirect = this.wizard.assertStep(session, AppointmentWizardStep.Where, crn)
    if (redirect) {
      return redirect
    }

    return this.getAppointmentLocationViewModel(session)
  }

  @Post('where')
  @Render('arrange-appointment/views/where')
  @DynamicRedirect()
  async postWhere(
    @Param('crn') crn: string,
    @Session() session: AppointmentWizardSession,
    @BodyClass(AppointmentWizardStep.Where) body: AppointmentBuilderDto,
  ): Promise<RenderOrRedirect> {
    const redirect = this.wizard.assertStep(session, AppointmentWizardStep.Where, crn)
    if (redirect) {
      return redirect
    }

    const errors = await ArrangeAppointmentController.validateWithSession(body, session, AppointmentWizardStep.Where)
    const viewModel = await this.getAppointmentLocationViewModel(session, body, errors)

    if (errors.length > 0) {
      return viewModel
    }

    const location = viewModel.locations.find(x => x.code === body.location)
    if (!location) {
      viewModel.errors.push({
        property: 'location',
        constraints: { isLocation: MESSAGES.location.required },
      })
      return viewModel
    }

    Object.assign(session.appointment, body)
    session.appointment.locationDescription = location.description

    return this.wizard.nextStep(session, AppointmentWizardStep.Where)
  }

  @Get('when')
  @Render('arrange-appointment/views/when')
  @DynamicRedirect()
  async getWhen(@Param('crn') crn: string, @Session() session: AppointmentWizardSession): Promise<RenderOrRedirect> {
    const redirect = this.wizard.assertStep(session, AppointmentWizardStep.When, crn)
    if (redirect) {
      return redirect
    }

    return await this.getAppointmentSchedulingViewModel(session, crn)
  }

  @Post('when')
  @Render('arrange-appointment/views/when')
  @DynamicRedirect()
  async postWhen(
    @Param('crn') crn: string,
    @Session() session: AppointmentWizardSession,
    @BodyClass(AppointmentWizardStep.When) body: AppointmentBuilderDto,
  ): Promise<RenderOrRedirect> {
    this.wizard.assertStep(session, AppointmentWizardStep.When, crn)

    const errors = await ArrangeAppointmentController.validateWithSession(body, session, AppointmentWizardStep.When)
    if (errors.length > 0) {
      return await this.getAppointmentSchedulingViewModel(session, crn, body, errors)
    }

    Object.assign(session.appointment, body)

    return this.wizard.nextStep(session, AppointmentWizardStep.When)
  }

  @Get('add-notes')
  @Render('arrange-appointment/views/add-notes')
  async getAddNotes(
    @Param('crn') crn: string,
    @Session() session: AppointmentWizardSession,
  ): Promise<RenderOrRedirect> {
    const redirect = this.wizard.assertStep(session, AppointmentWizardStep.AddNotes, crn)
    if (redirect) {
      return redirect
    }

    return this.getAddNotesViewModel(session)
  }

  @Post('add-notes')
  @Render('arrange-appointment/views/add-notes')
  @DynamicRedirect()
  async postAddNotes(
    @Param('crn') crn: string,
    @Session() session: AppointmentWizardSession,
    @BodyClass(AppointmentWizardStep.AddNotes) body: AppointmentBuilderDto,
  ): Promise<RenderOrRedirect> {
    this.wizard.assertStep(session, AppointmentWizardStep.AddNotes, crn)

    const errors = await ArrangeAppointmentController.validateWithSession(body, session, AppointmentWizardStep.AddNotes)
    if (errors.length > 0) {
      return this.getAddNotesViewModel(session, body, errors)
    }

    session.appointment.addNotes = body.addNotes

    if (!body.addNotes) {
      session.appointment.notes = null
    }

    return this.wizard.nextStep(session, AppointmentWizardStep.AddNotes)
  }

  @Get('notes')
  @Render('arrange-appointment/views/notes')
  async getNotes(@Param('crn') crn: string, @Session() session: AppointmentWizardSession): Promise<RenderOrRedirect> {
    const redirect = this.wizard.assertStep(session, AppointmentWizardStep.Notes, crn)
    if (redirect) {
      return redirect
    }

    return this.getNotesViewModel(session)
  }

  @Post('notes')
  @Render('arrange-appointment/views/notes')
  @DynamicRedirect()
  async postNotes(
    @Param('crn') crn: string,
    @Session() session: AppointmentWizardSession,
    @BodyClass(AppointmentWizardStep.Notes) body: AppointmentBuilderDto,
  ): Promise<RenderOrRedirect> {
    const redirect = this.wizard.assertStep(session, AppointmentWizardStep.Notes, crn)
    if (redirect) {
      return redirect
    }

    const errors = await ArrangeAppointmentController.validateWithSession(body, session, AppointmentWizardStep.Notes)
    if (errors.length > 0) {
      return this.getNotesViewModel(session, body, errors)
    }

    session.appointment.notes = body.notes

    return this.wizard.nextStep(session, AppointmentWizardStep.Notes)
  }

  @Get('sensitive')
  @Render('arrange-appointment/views/sensitive')
  @DynamicRedirect()
  async getSensitive(
    @Param('crn') crn: string,
    @Session() session: AppointmentWizardSession,
  ): Promise<RenderOrRedirect> {
    const redirect = this.wizard.assertStep(session, AppointmentWizardStep.Sensitive, crn)
    if (redirect) {
      return redirect
    }

    return this.getSensitiveViewModel(session)
  }

  @Post('sensitive')
  @Render('arrange-appointment/views/sensitive')
  @DynamicRedirect()
  async postSensitive(
    @Param('crn') crn: string,
    @Session() session: AppointmentWizardSession,
    @BodyClass(AppointmentWizardStep.Sensitive) body: AppointmentBuilderDto,
  ): Promise<RenderOrRedirect> {
    const redirect = this.wizard.assertStep(session, AppointmentWizardStep.Sensitive, crn)
    if (redirect) {
      return redirect
    }

    const errors = await ArrangeAppointmentController.validateWithSession(
      body,
      session,
      AppointmentWizardStep.Sensitive,
    )
    if (errors.length > 0) {
      return this.getSensitiveViewModel(session, body, errors)
    }

    Object.assign(session.appointment, body)

    return this.wizard.nextStep(session, AppointmentWizardStep.Sensitive)
  }

  @Get('check')
  @Render('arrange-appointment/views/check')
  @DynamicRedirect()
  async getCheck(@Param('crn') crn: string, @Session() session: AppointmentWizardSession): Promise<RenderOrRedirect> {
    const redirect = this.wizard.assertStep(session, AppointmentWizardStep.Check, crn)
    if (redirect) {
      return redirect
    }
    const appointment = plainToClass(AppointmentBuilderDto, session.appointment, {
      groups: [DEFAULT_GROUP],
      excludeExtraneousValues: true,
    })
    return {
      step: AppointmentWizardStep.Check,
      appointment,
      paths: {
        back: this.wizard.getBackUrl(session, AppointmentWizardStep.Check),
        type: getStepUrl(session, AppointmentWizardStep.Type),
        where: getStepUrl(session, AppointmentWizardStep.Where),
        when: getStepUrl(session, AppointmentWizardStep.When),
        notes: getStepUrl(session, AppointmentWizardStep.Notes),
        sensitive: getStepUrl(session, AppointmentWizardStep.Sensitive),
      },
      rarDetails: {
        category: '', // TODO from nsiType.description
        subCategory: '', // TODO from nsiSubType.description
      },
    }
  }

  @Post('check')
  @Redirect()
  async postCheck(@Param('crn') crn: string, @Session() session: AppointmentWizardSession): Promise<RedirectResponse> {
    const redirect = this.wizard.assertStep(session, AppointmentWizardStep.Check, crn)
    if (redirect) {
      return redirect
    }
    const appointment = plainToClass(AppointmentBuilderDto, session.appointment, {
      groups: [DEFAULT_GROUP],
      excludeExtraneousValues: true,
    })
    await this.service.createAppointment(appointment, crn)

    return this.wizard.nextStep(session, AppointmentWizardStep.Check)
  }

  @Get('confirm')
  @Render('arrange-appointment/views/confirm')
  @DynamicRedirect()
  async getConfirm(@Param('crn') crn: string, @Session() session: AppointmentWizardSession): Promise<RenderOrRedirect> {
    const redirect = this.wizard.assertStep(session, AppointmentWizardStep.Confirm, crn)
    if (redirect) {
      return redirect
    }
    const appointment = plainToClass(AppointmentBuilderDto, session.appointment, {
      groups: [DEFAULT_GROUP],
      excludeExtraneousValues: true,
    })
    const offenderDetails = await this.service.getOffenderDetails(crn)
    const phoneNumber =
      offenderDetails.contactDetails?.phoneNumbers?.length > 0
        ? offenderDetails.contactDetails.phoneNumbers[0].number
        : null

    // nothing to submit on the confirmation page, so just viewing it counts
    this.wizard.recordStep(session, AppointmentWizardStep.Confirm)

    return {
      step: AppointmentWizardStep.Confirm,
      appointment,
      paths: {
        next: this.links.getUrl(BreadcrumbType.Case, { crn: offenderDetails.otherIds.crn }),
      },
      offender: {
        firstName: offenderDetails.firstName,
        phoneNumber: phoneNumber,
      },
    }
  }

  private static async validateWithSession(
    body: AppointmentBuilderDto,
    session: AppointmentWizardSession,
    step: AppointmentWizardStep,
  ) {
    const merged = plainToClass(
      AppointmentBuilderDto,
      { ...session.appointment, ...body },
      { groups: [DEFAULT_GROUP], excludeExtraneousValues: true },
    )
    return await validate(merged, { groups: [step] })
  }

  private async getAppointmentTypeViewModel(
    session: AppointmentWizardSession,
    body?: DeepPartial<AppointmentBuilderDto>,
    errors: ValidationError[] = [],
  ): Promise<AppointmentTypeViewModel> {
    const appointment = plainToClass(AppointmentBuilderDto, session.appointment, {
      groups: [DEFAULT_GROUP],
      excludeExtraneousValues: true,
    })

    const types = await this.service.getAppointmentTypes(
      session.appointment.cja2003Order,
      session.appointment.legacyOrder,
    )
    const currentType = await this.service.getAppointmentType(appointment)

    const [type, other] = currentType
      ? currentType.wellKnownType
        ? [currentType.wellKnownType, null]
        : ['other', currentType.contactType]
      : [null, null]

    return {
      step: AppointmentWizardStep.Type,
      errors,
      appointment,
      paths: {
        back: this.wizard.getBackUrl(session, AppointmentWizardStep.Type),
      },
      types,
      type: body?.type || type,
      otherType: body?.otherType || other,
    }
  }

  private async getAppointmentSchedulingViewModel(
    session: AppointmentWizardSession,
    crn: string,
    body?: DeepPartial<AppointmentBuilderDto>,
    errors: ValidationError[] = [],
  ): Promise<AppointmentSchedulingViewModel> {
    const [offender, employment] = await Promise.all([
      this.service.getOffenderDetails(crn),
      this.service.getCurrentEmploymentCircumstances(crn),
    ])

    const disabilities = (offender.offenderProfile.disabilities || [])
      .filter(isActiveDateRange)
      .map(d => {
        const provisions = (d.provisions || [])
          .filter(
            p =>
              (!p.finishDate || DateTime.fromISO(p.finishDate) > DateTime.now()) &&
              DateTime.fromISO(d.startDate) < DateTime.now(),
          )
          .map(p => p.provisionType.description)

        if (provisions.length > 0) {
          return d.disabilityType.description + ` (adjustments: ${provisions?.join(', ')})`
        }
        return d.disabilityType.description
      })
      .join(', ')

    const language = offender.offenderProfile.offenderLanguages?.primaryLanguage

    const appointment = plainToClass(AppointmentBuilderDto, session.appointment, {
      groups: [DEFAULT_GROUP],
      excludeExtraneousValues: true,
    })
    return {
      step: AppointmentWizardStep.When,
      errors,
      appointment,
      paths: {
        back: this.wizard.getBackUrl(session, AppointmentWizardStep.When),
      },
      date: (body?.date as any) || appointment.date,
      startTime: body?.startTime || appointment.startTime,
      endTime: body?.endTime || appointment.endTime,

      offender: {
        firstName: offender.firstName,
        personalCircumstances: {
          language,
          employment,
          disabilities,
        },
      },
    }
  }

  private async getAppointmentLocationViewModel(
    session: AppointmentWizardSession,
    body?: DeepPartial<AppointmentBuilderDto>,
    errors: ValidationError[] = [],
  ): Promise<AppointmentLocationViewModel> {
    const locations = await this.service.getTeamOfficeLocations(session.appointment.teamCode)
    const appointment = plainToClass(AppointmentBuilderDto, session.appointment, {
      groups: [DEFAULT_GROUP],
      excludeExtraneousValues: true,
    })

    if (session.appointment.requiresLocation == AppointmentTypeRequiresLocation.Optional) {
      locations.push({ code: UNSPECIFIED_LOCATION_CODE, description: UNSPECIFIED_LOCATION_DESCRIPTION })
    }

    return {
      step: AppointmentWizardStep.Where,
      appointment,
      locations,
      location: body?.location || appointment.location,
      paths: {
        back: this.wizard.getBackUrl(session, AppointmentWizardStep.Where),
      },
      errors,
    }
  }

  private getAddNotesViewModel(
    session: AppointmentWizardSession,
    body?: DeepPartial<AppointmentBuilderDto>,
    errors: ValidationError[] = [],
  ): AppointmentAddNotesViewModel {
    const appointment = plainToClass(AppointmentBuilderDto, session.appointment, {
      groups: [DEFAULT_GROUP],
      excludeExtraneousValues: true,
    })
    return {
      step: AppointmentWizardStep.AddNotes,
      appointment,
      paths: {
        back: this.wizard.getBackUrl(session, AppointmentWizardStep.AddNotes),
      },
      errors,
      addNotes: body?.addNotes || appointment.addNotes,
    }
  }

  private getNotesViewModel(
    session: AppointmentWizardSession,
    body?: DeepPartial<AppointmentBuilderDto>,
    errors: ValidationError[] = [],
  ): AppointmentNotesViewModel {
    const appointment = plainToClass(AppointmentBuilderDto, session.appointment, {
      groups: [DEFAULT_GROUP],
      excludeExtraneousValues: true,
    })
    return {
      step: AppointmentWizardStep.Notes,
      appointment,
      paths: {
        back: this.wizard.getBackUrl(session, AppointmentWizardStep.Notes),
      },
      errors,
      notes: body?.notes || appointment.notes,
    }
  }

  private getSensitiveViewModel(
    session: AppointmentWizardSession,
    body?: DeepPartial<AppointmentBuilderDto>,
    errors: ValidationError[] = [],
  ): AppointmentSensitiveViewModel {
    const appointment = plainToClass(AppointmentBuilderDto, session.appointment, {
      groups: [DEFAULT_GROUP],
      excludeExtraneousValues: true,
    })
    return {
      step: AppointmentWizardStep.Sensitive,
      appointment,
      paths: {
        back: this.wizard.getBackUrl(session, AppointmentWizardStep.Sensitive),
      },
      errors,
      sensitive: body?.sensitive || appointment.sensitive,
    }
  }
}
