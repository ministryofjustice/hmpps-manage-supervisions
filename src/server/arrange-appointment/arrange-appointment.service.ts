import { AppointmentBuilderDto } from './dto/AppointmentBuilderDto'
import { AppointmentCreateResponse } from './dto/AppointmentCreateResponse'
import { OffenderDetailsResponse } from './dto/OffenderDetailsResponse'
import { AppointmentTypeDto } from './dto/AppointmentTypeDto'
import { Injectable, Logger } from '@nestjs/common'
import { AuthenticationMethod, CacheService, RestService } from '../common'
import { OfficeLocation } from './dto/OfficeLocation'

export interface AppointmentCreateRequest {
  requirementId: number
  contactType: string
  appointmentStart: string
  appointmentEnd: string
  officeLocationCode?: string
  notes: string
  providerCode: string
  teamCode: string
  staffCode: string
  sensitive?: boolean
}

export interface DomainAppointmentType
  extends Pick<AppointmentTypeDto, 'contactType' | 'requiresLocation' | 'orderTypes'> {
  isFeatured: boolean
  name: string
}

export const DUMMY_DATA = {
  sentenceId: 2500443138,
  notes: 'some notes',
  providerCode: 'CRS',
  requirementId: 2500199144,
  staffCode: 'CRSUATU',
  teamCode: 'CRSUAT',
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

@Injectable()
export class ArrangeAppointmentService {
  private readonly logger = new Logger(ArrangeAppointmentService.name)

  constructor(private readonly factory: RestService, private readonly cache: CacheService) {}

  async createAppointment(builder: AppointmentBuilderDto, crn: string, user: User): Promise<AppointmentCreateResponse> {
    const { sentenceId, ...dummy } = DUMMY_DATA
    const request: AppointmentCreateRequest = {
      ...dummy,
      appointmentStart: builder.appointmentStart.toISO(),
      appointmentEnd: builder.appointmentEnd.toISO(),
      contactType: builder.contactType,
      officeLocationCode: builder.location,
      sensitive: builder.sensitive,
    }

    // TODO pass the user token through where appropriate
    const client = await this.factory.build('community', user, AuthenticationMethod.ReissueForDeliusUser)
    return await client.post(
      AppointmentCreateResponse,
      `/secure/offenders/crn/${crn}/sentence/${sentenceId}/appointments`,
      {
        data: request,
      },
    )
  }

  async getOffenderDetails(crn: string, user: User): Promise<OffenderDetailsResponse> {
    const client = await this.factory.build('community', user, AuthenticationMethod.ReissueForDeliusUser)

    return await client.get(OffenderDetailsResponse, `/secure/offenders/crn/${crn}/all`)
  }

  async getAppointmentTypes(user: User): Promise<DomainAppointmentType[]> {
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

  async getTeamOfficeLocations(user: User, teamCode: string): Promise<OfficeLocation[]> {
    return this.cache.getOrSetTransformedArray(OfficeLocation, `community:office-locations:${teamCode}`, async () => {
      const client = await this.factory.build('community', user, AuthenticationMethod.ReissueForDeliusUser)
      const value = await client.get<OfficeLocation[]>(OfficeLocation, `/secure/teams/${teamCode}/office-locations`)
      return { value, options: { durationSeconds: 600 } }
    })
  }
}
