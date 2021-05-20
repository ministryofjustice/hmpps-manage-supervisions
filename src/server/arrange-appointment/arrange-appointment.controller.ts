import { ArrangeAppointmentService } from './arrange-appointment.service'
import { plainToClass } from 'class-transformer'
import { AppointmentBuilderDto, MESSAGES } from './dto/AppointmentBuilderDto'
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
import { AuthenticatedUser, DynamicRedirect, RedirectResponse } from '../common'
import { BodyClass } from '../common/meta/body-class.decorator'
import { DEFAULT_GROUP } from '../util/mapping'
import { RequiredOptional } from './dto/AppointmentTypeDto'

type RenderOrRedirect = AppointmentWizardViewModel | RedirectResponse

/**
 * TODO the form builder stuff is so meta, once we're on nest we should implement it into an interceptor with metadata
 * e.g. @AppointmentWizardStep(ArrangeAppointmentWizardStep.Type)
 * we would then wrap the request in AppointmentWizardStateService::assertStep
 * & AppointmentWizardStateService::nextStep when the builder model is mutated
 */
@Controller(`/arrange-appointment/:crn(\\w+)`)
export class ArrangeAppointmentController {
  constructor(private readonly service: ArrangeAppointmentService, private readonly wizard: AppointmentWizardService) {}

  @Get()
  @Redirect()
  get(@Param('crn') crn: string, @Session() session: AppointmentWizardSession): RedirectResponse {
    return this.wizard.reset(session, crn)
  }

  @Get('type')
  @Render('pages/arrange-appointment/type')
  @DynamicRedirect()
  async getType(
    @Param('crn') crn: string,
    @Session() session: AppointmentWizardSession,
    @AuthenticatedUser() user: User,
  ): Promise<RenderOrRedirect> {
    const redirect = this.wizard.assertStep(session, AppointmentWizardStep.Type, crn)
    if (redirect) {
      return redirect
    }

    return await this.getAppointmentTypeViewModel(session, user)
  }

  @Post('type')
  @Render('pages/arrange-appointment/type')
  @DynamicRedirect()
  async postType(
    @Param('crn') crn: string,
    @Session() session: AppointmentWizardSession,
    @AuthenticatedUser() user: User,
    @BodyClass(AppointmentWizardStep.Type) body: AppointmentBuilderDto,
  ): Promise<RenderOrRedirect> {
    const redirect = this.wizard.assertStep(session, AppointmentWizardStep.Type, crn)
    if (redirect) {
      return redirect
    }

    const errors = await this.validateWithSession(body, session, AppointmentWizardStep.Type)
    if (errors.length > 0) {
      return await this.getAppointmentTypeViewModel(session, user, body, errors)
    }

    const types = await this.service.getAppointmentTypes(user)
    const type = types.find(x => x.contactType === body.contactType)

    if (!type) {
      return await this.getAppointmentTypeViewModel(session, user, body, [
        {
          property: 'type',
          constraints: {
            isAppointmentType: MESSAGES.type.required,
          },
        },
      ])
    }

    Object.assign(session.appointment, body)
    session.appointment.typeDescription = type.name
    session.appointment.requiresLocation = type.requiresLocation
    if (type.requiresLocation === RequiredOptional.NotRequired && session.appointment.location) {
      session.appointment.location = null
      session.appointment.locationDescription = null
    }

    return this.wizard.nextStep(session, AppointmentWizardStep.Type)
  }

  @Get('where')
  @Render('pages/arrange-appointment/where')
  @DynamicRedirect()
  async getWhere(
    @Param('crn') crn: string,
    @Session() session: AppointmentWizardSession,
    @AuthenticatedUser() user: User,
  ): Promise<RenderOrRedirect> {
    const redirect = this.wizard.assertStep(session, AppointmentWizardStep.Where, crn)
    if (redirect) {
      return redirect
    }

    return this.getAppointmentLocationViewModel(session, user)
  }

  @Post('where')
  @Render('pages/arrange-appointment/where')
  @DynamicRedirect()
  async postWhere(
    @Param('crn') crn: string,
    @Session() session: AppointmentWizardSession,
    @AuthenticatedUser() user: User,
    @BodyClass(AppointmentWizardStep.Where) body: AppointmentBuilderDto,
  ): Promise<RenderOrRedirect> {
    const redirect = this.wizard.assertStep(session, AppointmentWizardStep.Where, crn)
    if (redirect) {
      return redirect
    }

    const errors = await this.validateWithSession(body, session, AppointmentWizardStep.Where)
    const viewModel = await this.getAppointmentLocationViewModel(session, user, body, errors)

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
  @Render('pages/arrange-appointment/when')
  @DynamicRedirect()
  async getWhen(@Param('crn') crn: string, @Session() session: AppointmentWizardSession): Promise<RenderOrRedirect> {
    const redirect = this.wizard.assertStep(session, AppointmentWizardStep.When, crn)
    if (redirect) {
      return redirect
    }

    return await this.getAppointmentSchedulingViewModel(session)
  }

  @Post('when')
  @Render('pages/arrange-appointment/when')
  @DynamicRedirect()
  async postWhen(
    @Param('crn') crn: string,
    @Session() session: AppointmentWizardSession,
    @BodyClass(AppointmentWizardStep.When) body: AppointmentBuilderDto,
  ): Promise<RenderOrRedirect> {
    this.wizard.assertStep(session, AppointmentWizardStep.When, crn)

    const errors = await this.validateWithSession(body, session, AppointmentWizardStep.When)
    if (errors.length > 0) {
      return await this.getAppointmentSchedulingViewModel(session, body, errors)
    }

    Object.assign(session.appointment, body)

    return this.wizard.nextStep(session, AppointmentWizardStep.When)
  }

  @Get('add-notes')
  @Render('pages/arrange-appointment/add-notes')
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
  @Render('pages/arrange-appointment/add-notes')
  @DynamicRedirect()
  async postAddNotes(
    @Param('crn') crn: string,
    @Session() session: AppointmentWizardSession,
    @BodyClass(AppointmentWizardStep.AddNotes) body: AppointmentBuilderDto,
  ): Promise<RenderOrRedirect> {
    this.wizard.assertStep(session, AppointmentWizardStep.AddNotes, crn)

    const errors = await this.validateWithSession(body, session, AppointmentWizardStep.AddNotes)
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
  @Render('pages/arrange-appointment/notes')
  async getNotes(@Param('crn') crn: string, @Session() session: AppointmentWizardSession): Promise<RenderOrRedirect> {
    const redirect = this.wizard.assertStep(session, AppointmentWizardStep.Notes, crn)
    if (redirect) {
      return redirect
    }

    return this.getNotesViewModel(session)
  }

  @Post('notes')
  @Render('pages/arrange-appointment/notes')
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

    const errors = await this.validateWithSession(body, session, AppointmentWizardStep.Notes)
    if (errors.length > 0) {
      return this.getNotesViewModel(session, body, errors)
    }

    session.appointment.notes = body.notes

    return this.wizard.nextStep(session, AppointmentWizardStep.Notes)
  }

  @Get('sensitive')
  @Render('pages/arrange-appointment/sensitive')
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
  @Render('pages/arrange-appointment/sensitive')
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

    const errors = await this.validateWithSession(body, session, AppointmentWizardStep.Sensitive)
    if (errors.length > 0) {
      return this.getSensitiveViewModel(session, body, errors)
    }

    Object.assign(session.appointment, body)

    return this.wizard.nextStep(session, AppointmentWizardStep.Sensitive)
  }

  @Get('check')
  @Render('pages/arrange-appointment/check')
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
  async postCheck(
    @Param('crn') crn: string,
    @Session() session: AppointmentWizardSession,
    @AuthenticatedUser() user: User,
  ): Promise<RedirectResponse> {
    const redirect = this.wizard.assertStep(session, AppointmentWizardStep.Check, crn)
    if (redirect) {
      return redirect
    }
    const appointment = plainToClass(AppointmentBuilderDto, session.appointment, {
      groups: [DEFAULT_GROUP],
      excludeExtraneousValues: true,
    })
    await this.service.createAppointment(appointment, crn, user)

    return this.wizard.nextStep(session, AppointmentWizardStep.Check)
  }

  @Get('confirm')
  @Render('pages/arrange-appointment/confirm')
  @DynamicRedirect()
  async getConfirm(
    @Param('crn') crn: string,
    @Session() session: AppointmentWizardSession,
    @AuthenticatedUser() user: User,
  ): Promise<RenderOrRedirect> {
    const redirect = this.wizard.assertStep(session, AppointmentWizardStep.Confirm, crn)
    if (redirect) {
      return redirect
    }
    const appointment = plainToClass(AppointmentBuilderDto, session.appointment, {
      groups: [DEFAULT_GROUP],
      excludeExtraneousValues: true,
    })
    const offenderDetails = await this.service.getOffenderDetails(crn, user)
    const phoneNumber =
      offenderDetails.contactDetails?.phoneNumbers?.length > 0
        ? offenderDetails.contactDetails.phoneNumbers[0].number
        : null

    // nothing to submit on the confirmation page, so just viewing it counts
    this.wizard.recordStep(session, AppointmentWizardStep.Confirm)

    return {
      step: AppointmentWizardStep.Confirm,
      appointment,
      offender: {
        firstName: offenderDetails.firstName,
        phoneNumber: phoneNumber,
      },
    }
  }

  private async validateWithSession(
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
    user: User,
    body?: DeepPartial<AppointmentBuilderDto>,
    errors: ValidationError[] = [],
  ): Promise<AppointmentTypeViewModel> {
    const appointment = plainToClass(AppointmentBuilderDto, session.appointment, {
      groups: [DEFAULT_GROUP],
      excludeExtraneousValues: true,
    })
    const types = await this.service.getAppointmentTypes(user)
    const currentType = appointment?.contactType
      ? types.find(x => x.contactType === appointment?.contactType) || null
      : null
    const [type, other] = currentType
      ? currentType.isFeatured
        ? [currentType.contactType, null]
        : ['other', currentType.contactType]
      : [null, null]
    return {
      step: AppointmentWizardStep.Type,
      errors,
      appointment,
      paths: {
        back: this.wizard.getBackUrl(session, AppointmentWizardStep.Type),
      },
      types: types.reduce((agg, type) => (type.isFeatured ? agg.featured : agg.other).push(type) && agg, {
        featured: [],
        other: [],
      }),
      type: body?.type || type,
      other: body?.otherType || other,
    }
  }

  private async getAppointmentSchedulingViewModel(
    session: AppointmentWizardSession,
    body?: DeepPartial<AppointmentBuilderDto>,
    errors: ValidationError[] = [],
  ): Promise<AppointmentSchedulingViewModel> {
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
    }
  }

  private async getAppointmentLocationViewModel(
    session: AppointmentWizardSession,
    user: User,
    body?: DeepPartial<AppointmentBuilderDto>,
    errors: ValidationError[] = [],
  ): Promise<AppointmentLocationViewModel> {
    const offender = await this.service.getOffenderDetails(session.crn, user)
    const offenderManager = offender.offenderManagers[0] // TODO what happens when we have >1? or 0?
    const locations = await this.service.getTeamOfficeLocations(user, offenderManager.team.code)
    const appointment = plainToClass(AppointmentBuilderDto, session.appointment, {
      groups: [DEFAULT_GROUP],
      excludeExtraneousValues: true,
    })
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
