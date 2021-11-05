import { Injectable } from '@nestjs/common'
import { AppointmentWizardSession } from '../dto/AppointmentWizardSession'
import { ValidationError } from 'class-validator'
import { AppointmentBuilderDto, MESSAGES } from '../dto/AppointmentBuilderDto'
import { ArrangeAppointmentService } from '../arrange-appointment.service'
import { SecurityContext } from '../../security'
import { AppointmentTypeRequiresLocation } from '../../community-api/client'
import { SessionBuilder } from '../../util/form-builder'
import {
  AppointmentBookingUnavailableReason,
  AppointmentWizardStep,
  NO_LOCATION,
  UNAVAILABLE_LOCATION,
} from '../dto/arrange-appointment.types'

@Injectable()
export class SessionBuilderService implements SessionBuilder<AppointmentBuilderDto, AppointmentWizardStep> {
  constructor(private readonly service: ArrangeAppointmentService) {}

  async init(session: AppointmentWizardSession, security: SecurityContext) {
    const [offender, { conviction }] = await Promise.all([
      this.service.getOffenderDetails(session.crn),
      this.service.getConvictionAndRarRequirement(session.crn),
    ])

    const offenderManager = offender.offenderManagers.find(om => om.staff.code == security.staffCode)
    if (!offenderManager) {
      throw new Error(
        `current user with staff code '${security.staffCode}' is not an offender manager for offender with crn '${session.crn}'`,
      )
    }

    session.dto.offender = offender
    session.dto.staffCode = offenderManager.staff.code
    session.dto.teamCode = offenderManager.team.code
    session.dto.providerCode = offenderManager.probationArea.code
    session.dto.convictionId = conviction.convictionId
    // Book everything against the event, even if we have a RAR requirement, as we're not asking about RAR requirements yet.
    // When RAR appointment functionality is added, the list of available appointment types will need to be filtered to those that
    // can be used against the RAR requirement main category
    // session.dto.requirementId = requirement.id
    session.dto.cja2003Order = conviction.sentence.cja2003Order
    session.dto.legacyOrder = conviction.sentence.legacyOrder
  }

  async type(session: AppointmentWizardSession, model: AppointmentBuilderDto): Promise<ValidationError[]> {
    const type = await this.service.getAppointmentType(model)
    if (!type) {
      return [
        {
          property: 'type',
          constraints: {
            isAppointmentType: MESSAGES.type.required,
          },
        },
      ]
    }

    const locationTypeChanged = !session.dto.requiresLocation || session.dto.requiresLocation !== type.requiresLocation

    session.dto.typeDescription = type.description
    session.dto.requiresLocation = type.requiresLocation

    if (!locationTypeChanged) {
      return []
    }

    // type affects location availability so safest option is to clear out any existing locations
    session.dto.location = null
    session.dto.locationDescription = null
    session.dto.availableLocations = null
    session.dto.alternateLocations = null

    if (type.requiresLocation !== AppointmentTypeRequiresLocation.NotRequired) {
      // location is now required or optional, so get list of locations
      session.dto.availableLocations = await this.service.getTeamOfficeLocations(session.dto.teamCode)
      session.dto.alternateLocations = [UNAVAILABLE_LOCATION]
      if (type.requiresLocation === AppointmentTypeRequiresLocation.Optional) {
        session.dto.alternateLocations.push(NO_LOCATION)
      }
    }

    return []
  }

  rar(session: AppointmentWizardSession): ValidationError[] {
    session.dto.unavailableReason = null
    if (session.dto.isRar === true) {
      session.dto.unavailableReason = AppointmentBookingUnavailableReason.CountsTowardsRar
    }
    return []
  }

  where(session: AppointmentWizardSession): ValidationError[] {
    session.dto.unavailableReason = null
    const location =
      session.dto.availableLocations.find(x => x.code === session.dto.location) ||
      session.dto.alternateLocations.find(x => x.code === session.dto.location)

    if (!location) {
      return [
        {
          property: 'location',
          constraints: { isLocation: MESSAGES.location.required },
        },
      ]
    }

    if (location.code === UNAVAILABLE_LOCATION.code) {
      session.dto.unavailableReason = AppointmentBookingUnavailableReason.NewLocationRequired
      return []
    }

    session.dto.locationDescription = location.description
    return []
  }

  when(): ValidationError[] {
    // no extra data or validation
    return []
  }

  'add-notes'(session: AppointmentWizardSession): ValidationError[] {
    if (!session.dto.addNotes) {
      // notes not required so clear out any old notes
      session.dto.notes = null
    }
    return []
  }

  notes(): ValidationError[] {
    // no extra data or validation
    return []
  }

  sensitive(): ValidationError[] {
    // no extra data or validation
    return []
  }

  async check(session: AppointmentWizardSession, model: AppointmentBuilderDto): Promise<ValidationError[]> {
    // book the appointment!
    // TODO save to session?
    await this.service.createAppointment(model, session.crn)
    return []
  }

  confirm(): ValidationError[] {
    // no extra data or validation
    return []
  }

  unavailable(): ValidationError[] {
    // no extra data or validation
    return []
  }
}
