import { DateTime } from 'luxon'
import { Controller, Get, Post, RedirectException, Render, Req, Param } from '../mvc'
import { ArrangeAppointmentService } from './arrange-appointment.service'
import { CapiAppointmentCreateRequest } from './capiAppointmentCreateRequest.dto'

export interface CheckSessionViewModel {
  typeOfSession: string
  date: string
  startTime: string
  endTime: string
  countsTowardsRAR: boolean
  rarCategory: string
  rarSubCategory: string
  sessionNotes: string
}

export interface AppointmentCreationDetails {
  requirementId: number
  contactType: {
    description: string
    code: string
  }
  nsiType?: {
    description: string
    code: string
  }
  nsiSubType?: {
    description: string
    code: string
  }
  appointmentStart: DateTime
  appointmentEnd: DateTime
  officeLocationCode?: string
  notes: string
  providerCode: string
  teamCode: string
  staffCode: string
  sentenceId: number
}

@Controller('/arrange-appointment/:crn(\\w+)')
export class ArrangeAppointmentontroller {
  constructor(private readonly service: ArrangeAppointmentService) {}

  @Get('/check')
  @Render('pages/arrange-appointment/check')
  get(@Param('crn') crn: string, @Req() request: any): CheckSessionViewModel {
    const appointmentCreateRequest: AppointmentCreationDetails = {
      appointmentStart: DateTime.now().plus({ hours: 1 }),
      appointmentEnd: DateTime.now().plus({ hours: 2 }),
      contactType: {
        code: 'COTH',
        description: 'Office Visit',
      },
      notes: 'some notes',
      // officeLocationCode: '',
      providerCode: 'CRS',
      requirementId: 2500199144,
      staffCode: 'CRSUATU',
      teamCode: 'CRSUAT',
      sentenceId: 2500443138,
    }

    request.session.appointmentCreateRequest = appointmentCreateRequest

    return {
      typeOfSession: appointmentCreateRequest.contactType.description,
      date: appointmentCreateRequest.appointmentStart.toISODate(),
      startTime: appointmentCreateRequest.appointmentStart.toFormat('h:mm a'),
      endTime: appointmentCreateRequest.appointmentEnd.toFormat('h:mm a'),
      countsTowardsRAR: appointmentCreateRequest.nsiType != null,
      rarCategory: appointmentCreateRequest.nsiType ? appointmentCreateRequest.nsiType.description : '',
      rarSubCategory: appointmentCreateRequest.nsiSubType ? appointmentCreateRequest.nsiSubType.description : '',
      sessionNotes: appointmentCreateRequest.notes,
    }
  }

  @Post('/check')
  async post(@Param('crn') crn: string, @Req() request: any): Promise<never> {
    const creationDetails = request.session.appointmentCreateRequest

    const capiRequest: CapiAppointmentCreateRequest = {
      requirementId: creationDetails.requirementId,
      contactType: creationDetails.contactType.code,
      appointmentStart: creationDetails.appointmentStart,
      appointmentEnd: creationDetails.appointmentEnd,
      notes: creationDetails.notes,
      providerCode: creationDetails.providerCode,
      teamCode: creationDetails.teamCode,
      staffCode: creationDetails.staffCode,
    }

    const appointmentId = await this.service.createAppointment(
      capiRequest,
      crn,
      creationDetails.sentenceId,
      request.user.username,
    )
    throw new RedirectException(`/arrange-a-session/${appointmentId}/confirmation`)
  }
}
