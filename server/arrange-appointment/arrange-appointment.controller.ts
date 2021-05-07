import { DateTime } from 'luxon'
import { Controller, Get, Param, Post, Render, Session, User, ViewModel } from '../mvc'
import { ArrangeAppointmentService } from './arrange-appointment.service'
import { plainToClass } from 'class-transformer'
import { first } from 'lodash'
import { AppointmentBuilderDto } from './dto/AppointmentBuilderDto'

export interface ArrangeAppointmentViewModel extends ViewModel<AppointmentBuilderDto, 'appointment'> {
  rarDetails: {
    category: string
    subCategory: string
  }
}

export interface ConfirmAppointmentViewModel {
  appointment: {
    start: string
    end: string
    description: string
  }
  offender: {
    firstName: string
    phoneNumber: string
  }
}

interface AppointmentSession {
  appointment?: FlatDeepPartial<AppointmentBuilderDto>
}

@Controller('/arrange-appointment/:crn(\\w+)')
export class ArrangeAppointmentController {
  constructor(private readonly service: ArrangeAppointmentService) {}

  @Get('/check')
  @Render('pages/arrange-appointment/check')
  get(@Param('crn') crn: string, @Session() session: AppointmentSession): ArrangeAppointmentViewModel {
    // HACK fill out dummy data
    const date = DateTime.now().plus({ hours: 1 }).set({ minute: 0, second: 0, millisecond: 0 })
    session.appointment = {
      appointmentStart: date.toISO(),
      appointmentEnd: date.plus({ hours: 1 }).toISO(),
      contactType: {
        code: 'COPT',
        description: 'Planned Telephone Contact (NS)',
      },
      notes: 'some notes',
      providerCode: 'CRS',
      requirementId: 2500199144,
      staffCode: 'CRSUATU',
      teamCode: 'CRSUAT',
      sentenceId: 2500443138,
    }

    const appointment = plainToClass(AppointmentBuilderDto, session.appointment)

    // TODO validate & display

    return {
      appointment,
      rarDetails: {
        category: appointment.nsiType?.description || '',
        subCategory: appointment.nsiSubType?.description || '',
      },
    }
  }

  @Post('/check')
  @Render('pages/arrange-appointment/confirm')
  async post(
    @Param('crn') crn: string,
    @Session() session: AppointmentSession,
    @User() user: UserPrincipal,
  ): Promise<ConfirmAppointmentViewModel> {
    const appointment = plainToClass(AppointmentBuilderDto, session.appointment)

    const appointmentCreateReponse = await this.service.createAppointment(appointment, crn, user)

    const offenderDetails = await this.service.getOffenderDetails(crn, user)

    const phoneNumber =
      offenderDetails.phoneNumbers && offenderDetails.phoneNumbers.length > 0
        ? first(offenderDetails.phoneNumbers).number
        : null

    return {
      appointment: {
        start: appointmentCreateReponse.appointmentStart,
        end: appointmentCreateReponse.appointmentEnd,
        description: appointmentCreateReponse.typeDescription,
      },
      offender: {
        firstName: offenderDetails.firstName,
        phoneNumber: phoneNumber,
      },
    }
  }
}
