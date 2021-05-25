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
  Conviction,
  Requirement,
} from '../community-api'

export interface DomainAppointmentType extends AppointmentType {
  isFeatured: boolean
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

const RAR_REQUIREMENT_SUB_TYPE_CATEGORY_CODE = 'RARREQ'
const RAR_REQUIREMENT_TYPE_MAIN_CATEGORY_CODE = 'F'

@Injectable()
export class ArrangeAppointmentService {
  constructor(private readonly community: CommunityApiService, private readonly cache: CacheService) {}

  async createAppointment(builder: AppointmentBuilderDto, crn: string): Promise<AppointmentCreateResponse> {
    const appointmentCreateRequest: AppointmentCreateRequest = {
      providerCode: builder.providerCode,
      requirementId: builder.requirementId,
      staffCode: builder.staffCode,
      teamCode: builder.teamCode,
      appointmentStart: builder.appointmentStart.toISO(),
      appointmentEnd: builder.appointmentEnd.toISO(),
      contactType: builder.contactType,
      officeLocationCode: builder.location,
      notes: builder.notes,
      sensitive: builder.sensitive,
    }

    const { data } = await this.community.appointment.createAppointmentUsingPOST({
      appointmentCreateRequest,
      //TODO: This field is named wrongly on Community API - it's called sentence ID when in fact it's the conviction ID
      sentenceId: builder.convictionId,
      crn,
    })

    return data
  }

  async getOffenderDetails(crn: string): Promise<OffenderDetail> {
    const { data } = await this.community.offender.getOffenderDetailByCrnUsingGET({ crn })

    if (!data.activeProbationManagedSentence) {
      throw new Error('This offender does not have an active probation managed sentence')
    }

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

  async getOffenderConviction(crn: string): Promise<Conviction> {
    const { data } = await this.community.offender.getConvictionsForOffenderByCrnUsingGET({ crn, activeOnly: true })
    if (data.length == 1) {
      return data[0]
    } else {
      throw new Error(`${data.length} convictions found`)
    }
  }

  async getConvictionRarRequirement(crn: string, convictionId: number): Promise<Requirement> {
    const { data } = await this.community.requirement.getRequirementsByConvictionIdUsingGET({
      crn,
      convictionId,
      activeOnly: true,
    })

    const rarRequirements = data.requirements.filter(
      r =>
        r.requirementTypeMainCategory.code == RAR_REQUIREMENT_TYPE_MAIN_CATEGORY_CODE &&
        r.requirementTypeSubCategory.code == RAR_REQUIREMENT_SUB_TYPE_CATEGORY_CODE,
    )

    // RAR requirements will only be found on ORA Community Order and ORA Suspended Sentence Order sentences
    if (!rarRequirements.length) {
      throw new Error(`No RAR requirements found for CRN ${crn} convictionId: ${convictionId}`)
    }
    return rarRequirements[0]
  }
}
