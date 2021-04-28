import { Service } from 'typedi'
import { classToPlain, plainToClass } from 'class-transformer'
import RestClient from '../data/restClient'
import HmppsAuthClient from '../data/hmppsAuthClient'
import TokenStore from '../data/tokenStore'
import { AppointmentCreateRequest } from './dto/AppointmentCreateRequest'
import { ConfigService } from '../config'
import { AppointmentBuilderDto } from './dto/AppointmentBuilderDto'
import { validate } from 'class-validator'
import logger from '../../logger'

export interface AppointmentCreateResponse {
  id?: number
  appointmentId: number
}

export interface ErrorResponse {
  status: number

  errorCode?: string

  userMessage: string

  developerMessage: string

  moreInfo: string
}

@Service()
export class ArrangeAppointmentService {
  constructor(private readonly config: ConfigService) {}

  private restClient(token: string): RestClient {
    return new RestClient('Community API Client', this.config.apis.community, token)
  }

  async createAppointment(
    { sentenceId, ...appointment }: AppointmentBuilderDto,
    crn: string,
    username: string,
  ): Promise<number> {
    const request = plainToClass(
      AppointmentCreateRequest,
      {
        ...appointment,
        appointmentStart: appointment.appointmentStart.toISO(),
        appointmentEnd: appointment.appointmentEnd.toISO(),
        contactType: appointment.contactType.code,
      } as AppointmentCreateRequest,
      { excludeExtraneousValues: true, enableImplicitConversion: false },
    )

    // TODO do something with these errors
    const errors = await validate(request)
    logger.error(errors)

    const authClient = new HmppsAuthClient(new TokenStore())
    const token = await authClient.getSystemClientToken(username)

    const response = await this.restClient(token).post<AppointmentCreateResponse>({
      path: `/offenders/crn/${crn}/sentence/${sentenceId}/appointments`,
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      data: classToPlain(request),
    })

    return response.appointmentId || response.id
  }
}
