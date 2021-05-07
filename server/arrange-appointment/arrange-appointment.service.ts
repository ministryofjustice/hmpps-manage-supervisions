import { Service } from 'typedi'
import { classToPlain, plainToClass } from 'class-transformer'
import { AppointmentCreateRequest } from './dto/AppointmentCreateRequest'
import { AppointmentBuilderDto } from './dto/AppointmentBuilderDto'
import { validate } from 'class-validator'
import logger from '../../logger'
import { AuthenticationMethod, RestClientFactory } from '../data/RestClientFactory'
import { AppointmentCreateResponse } from './dto/AppointmentCreateResponse'
import { OffenderDetailsResponse } from './dto/OffenderDetailsResponse'

@Service()
export class ArrangeAppointmentService {
  constructor(private readonly factory: RestClientFactory) {}

  async createAppointment(
    { sentenceId, ...appointment }: AppointmentBuilderDto,
    crn: string,
    user: UserPrincipal,
  ): Promise<AppointmentCreateResponse> {
    const request = plainToClass(
      AppointmentCreateRequest,
      {
        ...appointment,
        appointmentStart: appointment.appointmentStart.toISO(),
        appointmentEnd: appointment.appointmentEnd.toISO(),
        contactType: appointment.contactType.code,
      } as AppointmentCreateRequest,
      { excludeExtraneousValues: true },
    )

    // TODO do something with these errors
    const errors = await validate(request)
    if (errors.length > 0) {
      logger.error(errors)
    }

    // TODO pass the user token through where appropriate
    const client = await this.factory.build('community', user, AuthenticationMethod.ReissueForDeliusUser)
    const response = await client.post(
      AppointmentCreateResponse,
      `/offenders/crn/${crn}/sentence/${sentenceId}/appointments`,
      {
        data: classToPlain(request),
      },
    )

    return response
  }

  async getOffenderDetails(crn: string, user: UserPrincipal): Promise<OffenderDetailsResponse> {
    const client = await this.factory.build('community', user, AuthenticationMethod.ReissueForDeliusUser)

    return await client.get(OffenderDetailsResponse, `/offenders/crn/${crn}`)
  }
}
