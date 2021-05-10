import { Service } from 'typedi'
import { classToPlain, plainToClass } from 'class-transformer'
import { AppointmentCreateRequest } from './dto/AppointmentCreateRequest'
import { AppointmentBuilderDto } from './dto/AppointmentBuilderDto'
import { validate } from 'class-validator'
import logger from '../../logger'
import { AuthenticationMethod, RestClientFactory } from '../data/RestClientFactory'
import { AppointmentCreateResponse } from './dto/AppointmentCreateResponse'
import { OffenderDetailsResponse } from './dto/OffenderDetailsResponse'
import { AppointmentTypeDto } from './dto/AppointmentTypeDto'
import { CacheService } from '../data/CacheService'

export interface DomainAppointmentType
  extends Pick<AppointmentTypeDto, 'contactType' | 'requiresLocation' | 'orderTypes'> {
  isFeatured: boolean
  name: string
}

/**
 * TODO these are subject to change and my need more complexity around selecting based on say RAR requirement
 *      should these be in config anyway?
 */
const featuredAppointmentTypes = {
  APAT: 'Office visit',
  CHVS: 'Home visit',
  COVC: 'Video call',
  COPT: 'Phone call',
}

@Service()
export class ArrangeAppointmentService {
  constructor(private readonly factory: RestClientFactory, private readonly cache: CacheService) {}

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
    return await client.post(
      AppointmentCreateResponse,
      `/secure/offenders/crn/${crn}/sentence/${sentenceId}/appointments`,
      {
        data: classToPlain(request),
      },
    )
  }

  async getOffenderDetails(crn: string, user: UserPrincipal): Promise<OffenderDetailsResponse> {
    const client = await this.factory.build('community', user, AuthenticationMethod.ReissueForDeliusUser)

    return await client.get(OffenderDetailsResponse, `/secure/offenders/crn/${crn}`)
  }

  async getAppointmentTypes(user: UserPrincipal): Promise<DomainAppointmentType[]> {
    const types = await this.cache.getOrSetTransformedArray(
      AppointmentTypeDto,
      'community:appointment-types',
      async () => {
        const client = await this.factory.build('community', user, AuthenticationMethod.ReissueForDeliusUser)
        const value = await client.get<AppointmentTypeDto[]>(AppointmentTypeDto, '/secure/appointment-types')
        return { value, options: { durationSeconds: 600 } }
      },
    )

    return types.map(type => {
      const featured = featuredAppointmentTypes[type.contactType]
      return {
        isFeatured: !!featured,
        name: featured || type.description,
        contactType: type.contactType,
        orderTypes: type.orderTypes,
        requiresLocation: type.requiresLocation,
      }
    })
  }
}
