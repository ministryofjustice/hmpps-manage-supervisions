import { HttpStatus, Injectable, NotFoundException } from '@nestjs/common'
import { CommunityApiService, ContactMappingService } from '../community-api'
import { ContactTypeCategory } from '../config'
import { DateTime } from 'luxon'
import {
  PatchContactRequest,
  RecordOutcomeAppointmentSummary,
  RecordOutcomeFailure,
  RecordOutcomeStatus,
  RecordOutcomeSuccess,
} from './record-outcome.types'
import { AvailableContactOutcomeTypes, OffenderDetail } from '../community-api/client'
import { DeliusApiService } from '../delius-api'
import { RecordOutcomeDto } from './record-outcome.dto'
import { SanitisedAxiosError } from '../common/rest'

@Injectable()
export class RecordOutcomeService {
  constructor(
    private readonly community: CommunityApiService,
    private readonly contacts: ContactMappingService,
    private readonly deliusApi: DeliusApiService,
  ) {}

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

  async recordOutcome(contact: RecordOutcomeDto): Promise<RecordOutcomeSuccess | RecordOutcomeFailure> {
    const patchContactRequest: PatchContactRequest = {
      id: contact.appointment.id,
      body: [
        { op: 'replace', path: '/outcome', value: contact.outcome },
        { op: 'replace', path: '/sensitive', value: contact.sensitive },
      ],
    }

    if (contact.addNotes) {
      patchContactRequest.body.push({ op: 'replace', path: '/notes', value: contact.notes })
    }

    if (contact.enforcement) {
      patchContactRequest.body.push({ op: 'replace', path: '/enforcement', value: contact.enforcement })
    }

    const { data, success, status } = await SanitisedAxiosError.catchStatus(
      () => this.deliusApi.contactV1.patchContact(patchContactRequest),
      HttpStatus.BAD_REQUEST,
    )

    if (!success) {
      if (status === HttpStatus.BAD_REQUEST) {
        return { status: RecordOutcomeStatus.ERROR }
      }
    }

    return { ...data, status: RecordOutcomeStatus.OK }
  }
}
