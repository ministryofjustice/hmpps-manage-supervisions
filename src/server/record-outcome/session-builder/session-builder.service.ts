import { Injectable } from '@nestjs/common'
import { SessionBuilder } from '../../util/form-builder'
import { RecordOutcomeDto, RecordOutcomeSession } from '../record-outcome.dto'
import { RecordOutcomeStep } from '../record-outcome.types'
import { ValidationError } from 'class-validator'
import { SecurityContext } from '../../security'
import { RecordOutcomeService } from '../record-outcome.service'
import { getDisplayName } from '../../util'

@Injectable()
export class SessionBuilderService implements SessionBuilder<RecordOutcomeDto, RecordOutcomeStep> {
  constructor(private readonly service: RecordOutcomeService) {}

  async init(session: RecordOutcomeSession, security: SecurityContext): Promise<void> {
    const appointmentId =
      typeof session.breadcrumbOptions.id === 'number'
        ? session.breadcrumbOptions.id
        : parseInt(session.breadcrumbOptions.id)

    const [offender, appointment] = await Promise.all([
      this.service.getOffenderDetail(session.crn),
      this.service.getAppointmentDetail(session.crn, appointmentId),
    ])

    const offenderManager = offender.offenderManagers.find(om => om.staff.code == security.staffCode)
    if (!offenderManager) {
      throw new Error(
        `current user with staff code '${security.staffCode}' is not an offender manager for offender with crn '${session.crn}'`,
      )
    }

    session.dto.offender = offender
    session.dto.appointment = { ...appointment, start: appointment.start.toISO(), end: appointment.end?.toISO() }
    session.dto.availableOutcomeTypes = await this.service.getAvailableContactOutcomes(appointment.contactTypeCode)
    session.breadcrumbOptions.offenderName = getDisplayName(offender)
    session.breadcrumbOptions.entityName = appointment.name
  }

  'add-notes'(): Promise<ValidationError[]> | ValidationError[] {
    return []
  }

  'failed-to-attend'(): Promise<ValidationError[]> | ValidationError[] {
    return []
  }

  check(): Promise<ValidationError[]> | ValidationError[] {
    return []
  }

  compliance(): Promise<ValidationError[]> | ValidationError[] {
    return []
  }

  confirm(): Promise<ValidationError[]> | ValidationError[] {
    return []
  }

  enforcement(): Promise<ValidationError[]> | ValidationError[] {
    return []
  }

  notes(): Promise<ValidationError[]> | ValidationError[] {
    return []
  }

  outcome(): Promise<ValidationError[]> | ValidationError[] {
    return []
  }

  rar(): Promise<ValidationError[]> | ValidationError[] {
    throw new Error('not implemented')
  }

  sensitive(): Promise<ValidationError[]> | ValidationError[] {
    return []
  }

  unavailable(): Promise<ValidationError[]> | ValidationError[] {
    throw new Error('not implemented')
  }
}
