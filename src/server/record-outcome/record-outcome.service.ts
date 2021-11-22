import { Injectable, NotFoundException } from '@nestjs/common'
import { CommunityApiService, ContactMappingService } from '../community-api'
import { ContactTypeCategory } from '../config'
import { DateTime } from 'luxon'
import { RecordOutcomeAppointmentSummary } from './record-outcome.types'
import { AvailableContactOutcomeTypes, OffenderDetail } from '../community-api/client'

@Injectable()
export class RecordOutcomeService {
  constructor(private readonly community: CommunityApiService, private readonly contacts: ContactMappingService) {}

  async getOffenderDetail(crn: string): Promise<OffenderDetail> {
    const { data } = await this.community.offender.getOffenderDetailByCrnUsingGET({ crn })
    return data
  }

  async getAppointmentDetail(crn: string, id: number): Promise<RecordOutcomeAppointmentSummary> {
    const { data: appointment } = await this.community.contactAndAttendance.getOffenderContactSummaryByCrnUsingGET({
      crn,
      contactId: id,
    })

    const meta = this.contacts.getTypeMeta(appointment)
    if (meta.type !== ContactTypeCategory.Appointment) {
      throw new NotFoundException(`contact with id '${id}' is not an appointment`)
    }

    return {
      id,
      name: meta.name,
      start: DateTime.fromISO(appointment.contactStart),
      end: appointment.contactEnd && DateTime.fromISO(appointment.contactEnd),
      contactTypeCode: appointment.type.code,
    }
  }

  async getAvailableContactOutcomes(contactTypeCode: string): Promise<AvailableContactOutcomeTypes> {
    const { data: availableContactOutcomes } = await this.community.contactAndAttendance.getContactTypeOutcomesUsingGET(
      { contactTypeCode },
    )
    return availableContactOutcomes
  }
}
