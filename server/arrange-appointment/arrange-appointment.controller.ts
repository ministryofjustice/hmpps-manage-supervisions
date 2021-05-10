import { DateTime } from 'luxon'
import { Body, Controller, Get, Param, Post, Render, Session, User } from '../mvc'
import { ArrangeAppointmentService } from './arrange-appointment.service'
import { plainToClass } from 'class-transformer'
import { AppointmentBuilderDto } from './dto/AppointmentBuilderDto'
import { validate, ValidationError } from 'class-validator'
import {
  AppointmentTypeViewModel,
  AppointmentWizardStep,
  AppointmentWizardViewModel,
} from './dto/AppointmentWizardViewModel'
import { AppointmentWizardSession } from './dto/AppointmentWizardSession'
import { AppointmentWizardUpdateTypeDto } from './dto/AppointmentWizardUpdate.dto'
import { AppointmentWizardService } from './appointment-wizard.service'

/**
 * TODO the form builder stuff is so meta, once we're on nest we should implement it into an interceptor with metadata
 * e.g. @AppointmentWizardStep(ArrangeAppointmentWizardStep.Type)
 * we would then wrap the request in AppointmentWizardStateService::assertStep
 * & AppointmentWizardStateService::nextStep when the builder model is mutated
 */
@Controller(`/arrange-appointment/:crn(\\w+)`)
export class ArrangeAppointmentWizardController {
  constructor(private readonly service: ArrangeAppointmentService, private readonly wizard: AppointmentWizardService) {}

  @Get()
  get(@Param('crn') crn: string): never {
    this.wizard.firstStep(crn)
  }

  @Get('type')
  @Render('pages/arrange-appointment/type')
  async getType(
    @Param('crn') crn: string,
    @Session() session: AppointmentWizardSession,
    @User() user: UserPrincipal,
  ): Promise<AppointmentWizardViewModel> {
    this.wizard.assertStep(session, AppointmentWizardStep.AppointmentType, crn)
    ArrangeAppointmentWizardController.requireDummyAppointment(session)
    const appointment = plainToClass(AppointmentBuilderDto, session.appointment)
    return await this.getAppointmentTypeViewModel(crn, user, appointment)
  }

  @Post('type')
  @Render('pages/arrange-appointment/type')
  async postType(
    @Param('crn') crn: string,
    @Session() session: AppointmentWizardSession,
    @User() user: UserPrincipal,
    @Body() body: AppointmentWizardUpdateTypeDto,
  ): Promise<AppointmentWizardViewModel> {
    this.wizard.assertStep(session, AppointmentWizardStep.AppointmentType, crn)
    const appointment = plainToClass(AppointmentBuilderDto, session.appointment)
    const errors = await validate(body)
    if (errors.length > 0) {
      return await this.getAppointmentTypeViewModel(crn, user, appointment, errors)
    }

    const types = await this.service.getAppointmentTypes(user)
    const type = types.find(x => x.contactType === body.type)
    if (!type) {
      // if this happens then someone is messing with us, so no need for a descriptive error
      return await this.getAppointmentTypeViewModel(crn, user, appointment)
    }

    session.appointment.contactType = { code: type.contactType, description: type.name }

    // TODO revalidate the builder model, may be a step common thing so could be part of a potential AOP solution
    this.wizard.nextStep(session, AppointmentWizardStep.AppointmentType, crn)
  }

  @Get('check')
  @Render('pages/arrange-appointment/check')
  async getCheck(
    @Param('crn') crn: string,
    @Session() session: AppointmentWizardSession,
  ): Promise<AppointmentWizardViewModel> {
    this.wizard.assertStep(session, AppointmentWizardStep.Check, crn)
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
  @Render('pages/arrange-appointment/check')
  async postCheck(
    @Param('crn') crn: string,
    @Session() session: AppointmentWizardSession,
    @User() user: UserPrincipal,
  ): Promise<never> {
    this.wizard.assertStep(session, AppointmentWizardStep.Check, crn)
    const appointment = plainToClass(AppointmentBuilderDto, session.appointment)
    await this.service.createAppointment(appointment, crn, user)

    this.wizard.nextStep(session, AppointmentWizardStep.Check, crn)
  }

  @Get('confirm')
  @Render('pages/arrange-appointment/confirm')
  async getConfirm(
    @Param('crn') crn: string,
    @Session() session: AppointmentWizardSession,
    @User() user: UserPrincipal,
  ): Promise<AppointmentWizardViewModel> {
    this.wizard.assertStep(session, AppointmentWizardStep.Confirm, crn)
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
    user: UserPrincipal,
    appointment: AppointmentBuilderDto,
    errors: ValidationError[] = [],
  ): Promise<AppointmentTypeViewModel> {
    const types = await this.service.getAppointmentTypes(user)
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
    }
  }

  private static requireDummyAppointment(session: AppointmentWizardSession) {
    if (session.appointment) {
      return
    }

    // HACK fill out dummy data
    const date = DateTime.now().plus({ hours: 1 }).set({ minute: 0, second: 0, millisecond: 0 })
    session.appointment = {
      appointmentStart: date.toISO(),
      appointmentEnd: date.plus({ hours: 1 }).toISO(),
      notes: 'some notes',
      providerCode: 'CRS',
      requirementId: 2500199144,
      staffCode: 'CRSUATU',
      teamCode: 'CRSUAT',
      sentenceId: 2500443138,
    }
  }
}
