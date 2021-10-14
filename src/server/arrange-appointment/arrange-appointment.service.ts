import { AppointmentBuilderDto } from './dto/AppointmentBuilderDto'
import { Injectable } from '@nestjs/common'
import { CacheService } from '../common'
import {
  AppointmentCreateRequest,
  AppointmentCreateResponse,
  AppointmentType,
  AppointmentTypeOrderTypes,
  OffenderDetail,
  OfficeLocation,
  PersonalCircumstance,
} from '../community-api/client'
import {
  Config,
  WellKnownAppointmentType,
  ContactTypeCategory,
  WellKnownContactTypeConfig,
  ServerConfig,
  FeatureFlags,
} from '../config'
import { AvailableAppointmentTypes, FeaturedAppointmentType } from './dto/AppointmentWizardViewModel'
import { ConfigService } from '@nestjs/config'
import { isActiveDateRange } from '../util'
import {
  CommunityApiService,
  ConvictionRequirementDetail,
  ConvictionRequirementType,
  ConvictionService,
  EMPLOYMENT_TYPE_CODE,
  RequirementService,
} from '../community-api'

@Injectable()
export class ArrangeAppointmentService {
  constructor(
    private readonly community: CommunityApiService,
    private readonly cache: CacheService,
    private readonly config: ConfigService<Config>,
    private readonly conviction: ConvictionService,
    private readonly requirement: RequirementService,
  ) {}

  async getAppointmentType(
    builder: AppointmentBuilderDto,
  ): Promise<(AppointmentType & { wellKnownType?: WellKnownAppointmentType }) | null> {
    const selected = builder.appointmentType
    if (!selected) {
      return null
    }

    const { featured, other } = await this.getAppointmentTypes(builder.cja2003Order, builder.legacyOrder)
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
    if (!this.config.get<ServerConfig>('server').features[FeatureFlags.EnableAppointmentBooking]) {
      throw new Error('Appointment booking is currently disabled')
    }

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
    return data
  }

  async getAppointmentTypes(cja2003Order: boolean, legacyOrder: boolean): Promise<AvailableAppointmentTypes> {
    return await this.cache.getOrSet(
      `community:available-appointment-types-cja-${cja2003Order}-legacy-${legacyOrder}`,
      async () => {
        const data = (await this.community.appointment.getAllAppointmentTypesUsingGET()).data.filter(
          x =>
            (cja2003Order && x.orderTypes.includes(AppointmentTypeOrderTypes.Cja)) ||
            (legacyOrder && x.orderTypes.includes(AppointmentTypeOrderTypes.Legacy)),
        )

        const config = this.config.get<WellKnownContactTypeConfig>('contacts')[ContactTypeCategory.Appointment]
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
      },
    )
  }

  async getTeamOfficeLocations(teamCode: string): Promise<OfficeLocation[]> {
    return this.cache.getOrSet(`community:team-office-locations:${teamCode}`, async () => {
      const { data } = await this.community.team.getAllOfficeLocationsUsingGET({ teamCode })
      return { value: data, options: { durationSeconds: 600 } }
    })
  }

  async getConvictionAndRarRequirement(crn: string) {
    const { current } = await this.conviction.getConvictions(crn)
    if (!current) {
      throw new Error(`offender with crn '${crn}' has no active conviction`)
    }
    const requirements = await this.requirement.getConvictionRequirements({
      crn,
      convictionId: current.convictionId,
      activeOnly: true,
    })
    const rar = requirements.find(x => x.isRar)

    let requirement: ConvictionRequirementDetail

    if (rar) {
      switch (rar.type) {
        case ConvictionRequirementType.Unit:
          requirement = rar
          break

        case ConvictionRequirementType.Aggregate:
          // TODO determine best RAR requirement where there are multiple, maybe where unallocated days?
          requirement = rar.requirements.find(x => x)
          break
      }
    }

    return { conviction: current, requirement }
  }

  async getPersonalCircumstances(crn: string): Promise<Array<PersonalCircumstance>> {
    const { data } = await this.community.personalCircumstances.getOffenderPersonalCircumstancesByCrnUsingGET({ crn })
    return data.personalCircumstances || []
  }

  async getCurrentEmploymentCircumstances(crn: string): Promise<string> {
    return (await this.getPersonalCircumstances(crn))
      .filter(isActiveDateRange)
      .filter(c => c.personalCircumstanceType.code == EMPLOYMENT_TYPE_CODE)
      .map(c => c.personalCircumstanceSubType.description)
      .join(', ')
  }
}
