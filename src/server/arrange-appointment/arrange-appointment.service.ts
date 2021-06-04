import { AppointmentBuilderDto } from './dto/AppointmentBuilderDto'
import { Injectable } from '@nestjs/common'
import { CacheService } from '../common'
import {
  AppointmentCreateRequest,
  AppointmentCreateResponse,
  AppointmentType,
  CommunityApiService,
  Conviction,
  OffenderDetail,
  OfficeLocation,
  PersonalCircumstance,
  Requirement,
} from '../community-api'
import { DateTime } from 'luxon'
import { Config, WellKnownAppointmentType, WellKnownContactTypeCategory, WellKnownContactTypeConfig } from '../config'
import { AvailableAppointmentTypes, FeaturedAppointmentType } from './dto/AppointmentWizardViewModel'
import { ConfigService } from '@nestjs/config'

const RAR_REQUIREMENT_SUB_TYPE_CATEGORY_CODE = 'RARREQ'
const RAR_REQUIREMENT_TYPE_MAIN_CATEGORY_CODE = 'F'
const EMPLOYMENT_TYPE_CODE = 'B'

@Injectable()
export class ArrangeAppointmentService {
  constructor(
    private readonly community: CommunityApiService,
    private readonly cache: CacheService,
    private readonly config: ConfigService<Config>,
  ) {}

  async getAppointmentType(
    builder: AppointmentBuilderDto,
  ): Promise<(AppointmentType & { wellKnownType?: WellKnownAppointmentType }) | null> {
    const selected = builder.appointmentType
    if (!selected) {
      return null
    }

    const { featured, other } = await this.getAppointmentTypes()
    if (selected.featured) {
      const type = featured.find(x => x.type === selected.value)
      if (!type) {
        throw new Error(`'${selected.value}' is not a 'featured' appointment type`)
      }
      // TODO select the correct appointment type here based on rar etc
      return { ...type.appointmentTypes[0], description: type.description, wellKnownType: type.type }
    }
    return other.find(x => x.contactType === selected.value) || null
  }

  async createAppointment(builder: AppointmentBuilderDto, crn: string): Promise<AppointmentCreateResponse> {
    const appointmentType = await this.getAppointmentType(builder)
    if (!appointmentType) {
      throw new Error('appointment type is not set')
    }
    const appointmentCreateRequest: AppointmentCreateRequest = {
      providerCode: builder.providerCode,
      requirementId: builder.requirementId,
      staffCode: builder.staffCode,
      teamCode: builder.teamCode,
      appointmentStart: builder.appointmentStart.toISO(),
      appointmentEnd: builder.appointmentEnd.toISO(),
      contactType: appointmentType.contactType,
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

  async getAppointmentTypes(): Promise<AvailableAppointmentTypes> {
    return await this.cache.getOrSet('community:available-appointment-types', async () => {
      const { data } = await this.community.appointment.getAllAppointmentTypesUsingGET()

      const config = this.config.get<WellKnownContactTypeConfig>('contacts')[WellKnownContactTypeCategory.Appointment]
      const featured: FeaturedAppointmentType[] = Object.entries(config)
        .map(([type, meta]) => {
          const appointmentTypes = Object.values(meta.codes)
            .map(code => data.find(x => x.contactType.toUpperCase() === code))
            .filter(x => x)

          if (appointmentTypes.length === 0) {
            return null
          }

          for (const appointmentType of appointmentTypes) {
            data.splice(data.indexOf(appointmentType), 1)
          }

          return {
            type,
            description: meta.name,
            meta,
            appointmentTypes,
          } as FeaturedAppointmentType
        })
        .filter(x => x)

      return {
        value: { featured, other: data },
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

    const rarRequirement = data.requirements.find(
      r =>
        r.requirementTypeMainCategory.code == RAR_REQUIREMENT_TYPE_MAIN_CATEGORY_CODE &&
        r.requirementTypeSubCategory.code == RAR_REQUIREMENT_SUB_TYPE_CATEGORY_CODE,
    )

    // RAR requirements will only be found on ORA Community Order and ORA Suspended Sentence Order sentences
    if (!rarRequirement) {
      throw new Error(`No RAR requirements found for CRN ${crn} convictionId: ${convictionId}`)
    }
    return rarRequirement
  }

  async getPersonalCircumstances(crn: string): Promise<Array<PersonalCircumstance>> {
    const { data } = await this.community.personalCircumstances.getOffenderPersonalCircumstancesByCrnUsingGET({ crn })
    return data.personalCircumstances || []
  }

  async getCurrentEmploymentCircumstances(crn: string): Promise<string> {
    return (await this.getPersonalCircumstances(crn))
      .filter(
        c =>
          (!c.endDate || DateTime.fromISO(c.endDate) > DateTime.now()) &&
          DateTime.fromISO(c.startDate) < DateTime.now(),
      )
      .filter(c => c.personalCircumstanceType.code == EMPLOYMENT_TYPE_CODE)
      .map(c => c.personalCircumstanceSubType.description)
      .join(', ')
  }
}
