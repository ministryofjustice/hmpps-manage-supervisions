import { AppointmentBuilderDto } from './dto/AppointmentBuilderDto'
import { Injectable } from '@nestjs/common'
import { CacheService } from '../common'
import {
  CommunityApiService,
  AppointmentCreateRequest,
  AppointmentCreateResponse,
  AppointmentType,
  OffenderDetail,
  OfficeLocation,
} from '../community-api'

export interface DomainAppointmentType extends AppointmentType {
  isFeatured: boolean
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
  constructor(private readonly community: CommunityApiService, private readonly cache: CacheService) {}

  async createAppointment(builder: AppointmentBuilderDto, crn: string): Promise<AppointmentCreateResponse> {
    const { sentenceId, ...dummy } = DUMMY_DATA
    const appointmentCreateRequest: AppointmentCreateRequest = {
      ...dummy,
      appointmentStart: builder.appointmentStart.toISO(),
      appointmentEnd: builder.appointmentEnd.toISO(),
      contactType: builder.contactType,
      officeLocationCode: builder.location,
      notes: builder.notes,
      sensitive: builder.sensitive,
    }

    const { data } = await this.community.appointment.createAppointmentUsingPOST({
      appointmentCreateRequest,
      sentenceId,
      crn,
    })

    return data
  }

  async getOffenderDetails(crn: string): Promise<OffenderDetail> {
    const { data } = await this.community.offender.getOffenderDetailByCrnUsingGET({ crn })
    return data
  }

  async getAppointmentTypes(): Promise<DomainAppointmentType[]> {
    return await this.cache.getOrSet('community:all-appointment-types', async () => {
      const { data } = await this.community.appointment.getAllAppointmentTypesUsingGET()

      return {
        value: data.map(type => {
          const featured = featuredAppointmentTypes[type.contactType]
          return {
            ...type,
            isFeatured: !!featured,
            description: featured || type.description,
          } as DomainAppointmentType
        }),
        options: { durationSeconds: 600 },
      }
    })
  }

  async getTeamOfficeLocations(teamCode: string): Promise<OfficeLocation[]> {
    return this.cache.getOrSet(`community:team-office-locations:${teamCode}`, async () => {
      const { data } = await this.community.team.getAllOfficeLocationsUsingGET({ teamCode })
      return { value: data, options: { durationSeconds: 600 } }
    })
  }
}
