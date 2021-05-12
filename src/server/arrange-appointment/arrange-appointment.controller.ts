import { ArrangeAppointmentService, DomainAppointmentType } from './arrange-appointment.service'
import { plainToClass } from 'class-transformer'
import { AppointmentBuilderDto } from './dto/AppointmentBuilderDto'
import { validate, ValidationError } from 'class-validator'
import {
  AppointmentSchedulingViewModel,
  AppointmentTypeViewModel,
  AppointmentWizardStep,
  AppointmentWizardViewModel,
} from './dto/AppointmentWizardViewModel'
import { AppointmentWizardSession } from './dto/AppointmentWizardSession'
import { AppointmentWizardUpdateTypeDto } from './dto/AppointmentWizardUpdate.dto'
import { AppointmentWizardUpdateWhenDto } from './dto/AppointmentWizardUpdateWhen.dto'
import { AppointmentWizardService } from './appointment-wizard.service'
import { Controller, Get, Param, Post, Redirect, Render, Session } from '@nestjs/common'
import { AuthenticatedUser, DynamicRedirect, RedirectResponse } from '../common'
import { BodyClass } from '../common/meta/body-class.decorator'

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
  get(@Param('crn') crn: string): RedirectResponse {
    return this.wizard.firstStep(crn)
  }

  @Get('type')
  @Render('pages/arrange-appointment/type')
  @DynamicRedirect()
  async getType(
    @Param('crn') crn: string,
    @Session() session: AppointmentWizardSession,
    @AuthenticatedUser() user: User,
  ): Promise<RenderOrRedirect> {
    const redirect = this.wizard.assertStep(session, AppointmentWizardStep.AppointmentType, crn)
    if (redirect) {
      return redirect
    }

    ArrangeAppointmentController.requireDummyAppointment(session)
    const appointment = plainToClass(AppointmentBuilderDto, session.appointment)
    return await this.getAppointmentTypeViewModel(crn, user, appointment)
  }

  @Post('type')
  @Render('pages/arrange-appointment/type')
  @DynamicRedirect()
  async postType(
    @Param('crn') crn: string,
    @Session() session: AppointmentWizardSession,
    @AuthenticatedUser() user: User,
    @BodyClass() body: AppointmentWizardUpdateTypeDto,
  ): Promise<RenderOrRedirect> {
    const redirect = this.wizard.assertStep(session, AppointmentWizardStep.AppointmentType, crn)
    if (redirect) {
      return redirect
    }

    // clear out the saved type if any
    session.appointment.contactType = {}

    const appointment = plainToClass(AppointmentBuilderDto, session.appointment)
    const errors = await validate(body)
    if (errors.length > 0) {
      return await this.getAppointmentTypeViewModel(crn, user, appointment, body, errors)
    }

    const types = await this.service.getAppointmentTypes(user)
    let type: DomainAppointmentType
    if (body.type === 'other') {
      type = types.find(x => x.contactType === body.other)
    } else {
      type = types.find(x => x.contactType === body.type)
    }

    if (!type) {
      return await this.getAppointmentTypeViewModel(crn, user, appointment, body, [
        {
          property: 'type',
          constraints: {
            isAppointmentType: AppointmentWizardUpdateTypeDto.MESSAGES.type.required,
          },
        },
      ])
    }

    session.appointment.contactType = { code: type.contactType, description: type.name }

    // TODO revalidate the builder model, may be a step common thing so could be part of a potential AOP solution
    return this.wizard.nextStep(session, AppointmentWizardStep.AppointmentType, crn)
  }

  @Get('when')
  @Render('pages/arrange-appointment/when')
  async getWhen(@Param('crn') crn: string, @Session() session: AppointmentWizardSession): Promise<RenderOrRedirect> {
    const redirect = this.wizard.assertStep(session, AppointmentWizardStep.When, crn)
    if (redirect) {
      return redirect
    }
    const appointment = plainToClass(AppointmentBuilderDto, session.appointment)
    const form = new AppointmentWizardUpdateWhenDto()
    form.setFromDates(appointment.appointmentStart, appointment.appointmentEnd)
    const errors = appointment.appointmentStart || appointment.appointmentEnd ? await validate(form) : []
    return await this.getAppointmentSchedulingViewModel(crn, appointment, form, errors)
  }

  @Post('when')
  @Render('pages/arrange-appointment/when')
  @DynamicRedirect()
  async postWhen(
    @Param('crn') crn: string,
    @Session() session: AppointmentWizardSession,
    @BodyClass() body: AppointmentWizardUpdateWhenDto,
  ): Promise<RenderOrRedirect> {
    this.wizard.assertStep(session, AppointmentWizardStep.When, crn)
    const appointment = plainToClass(AppointmentBuilderDto, session.appointment)
    const errors = await validate(body)
    if (errors.length > 0) {
      return await this.getAppointmentSchedulingViewModel(crn, appointment, body, errors)
    }

    session.appointment.appointmentStart = body.getStartDateTime().toISO()
    session.appointment.appointmentEnd = body.getEndDateTime().toISO()

    return this.wizard.nextStep(session, AppointmentWizardStep.When, crn)
  }

  @Get('check')
  @Render('pages/arrange-appointment/check')
  @DynamicRedirect()
  async getCheck(@Param('crn') crn: string, @Session() session: AppointmentWizardSession): Promise<RenderOrRedirect> {
    const redirect = this.wizard.assertStep(session, AppointmentWizardStep.Check, crn)
    if (redirect) {
      return redirect
    }
    const appointment = plainToClass(AppointmentBuilderDto, session.appointment)
    return {
      step: AppointmentWizardStep.Check,
      appointment,
      paths: {
        back: this.wizard.getBackPath(AppointmentWizardStep.Check, crn),
      },
      rarDetails: {
        category: appointment.nsiType?.description || '',
        subCategory: appointment.nsiSubType?.description || '',
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
    const appointment = plainToClass(AppointmentBuilderDto, session.appointment)
    await this.service.createAppointment(appointment, crn, user)

    return this.wizard.nextStep(session, AppointmentWizardStep.Check, crn)
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
    const appointment = plainToClass(AppointmentBuilderDto, session.appointment)
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

  private async getAppointmentTypeViewModel(
    crn: string,
    user: User,
    appointment: AppointmentBuilderDto,
    body?: AppointmentWizardUpdateTypeDto,
    errors: ValidationError[] = [],
  ): Promise<AppointmentTypeViewModel> {
    const types = await this.service.getAppointmentTypes(user)
    const currentType = appointment.contactType?.code
      ? types.find(x => x.contactType === appointment.contactType.code) || null
      : null
    const [type, other] = currentType
      ? currentType.isFeatured
        ? [currentType.contactType, null]
        : ['other', currentType.contactType]
      : [null, null]
    return {
      step: AppointmentWizardStep.AppointmentType,
      errors,
      appointment,
      paths: {
        back: this.wizard.getBackPath(AppointmentWizardStep.AppointmentType, crn),
      },
      types: types.reduce((agg, type) => (type.isFeatured ? agg.featured : agg.other).push(type) && agg, {
        featured: [],
        other: [],
      }),
      type: body?.type || type,
      other: body?.other || other,
    }
  }

  private async getAppointmentSchedulingViewModel(
    crn: string,
    appointment: AppointmentBuilderDto,
    form: AppointmentWizardUpdateWhenDto,
    errors: ValidationError[],
  ): Promise<AppointmentSchedulingViewModel> {
    return {
      step: AppointmentWizardStep.When,
      errors,
      appointment,
      paths: {
        back: this.wizard.getBackPath(AppointmentWizardStep.When, crn),
      },
      form,
    }
  }

  private static requireDummyAppointment(session: AppointmentWizardSession) {
    if (session.appointment) {
      return
    }

    // HACK fill out dummy data
    session.appointment = {
      notes: 'some notes',
      providerCode: 'CRS',
      requirementId: 2500199144,
      staffCode: 'CRSUATU',
      teamCode: 'CRSUAT',
      sentenceId: 2500443138,
    }
  }
}
