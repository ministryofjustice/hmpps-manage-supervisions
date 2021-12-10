import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { UpdateEnforcementAppointmentSummary } from './update-enforcement.types'
import { CommunityApiService, ContactMappingService } from '../community-api'
import { ContactTypeCategory } from '../config'
import { EnforcementAction, OffenderDetail } from '../community-api/client'
import { DeliusApiService, PatchContactRequest } from '../delius-api'

@Injectable()
export class UpdateEnforcementService {
  constructor(
    private readonly community: CommunityApiService,
    private readonly deliusApi: DeliusApiService,
    private readonly contacts: ContactMappingService,
  ) {}

  async getOffenderDetail(crn: string): Promise<OffenderDetail> {
    const { data } = await this.community.offender.getOffenderDetailByCrnUsingGET({ crn })
    return data
  }

  async getAppointmentDetail(crn: string, id: number): Promise<UpdateEnforcementAppointmentSummary> {
    const { data: appointment } = await this.community.contactAndAttendance.getOffenderContactSummaryByCrnUsingGET({
      crn,
      contactId: id,
    })

    const meta = this.contacts.getTypeMeta(appointment)
    if (meta.type !== ContactTypeCategory.Appointment) {
      throw new NotFoundException(`contact with id '${id}' is not an appointment`)
    }

    if (!appointment.outcome?.code) {
      throw new BadRequestException(`appointment with id '${id}' has no outcome`)
    }

    return {
      id,
      name: meta.name,
      contactTypeCode: appointment.type.code,
      outcomeCode: appointment.outcome.code,
      enforcementCode: appointment.enforcement?.enforcementAction?.code,
    }
  }

  async getAvailableEnforcements(appointment: UpdateEnforcementAppointmentSummary): Promise<EnforcementAction[]> {
    const { data: availableContactOutcomes } = await this.community.contactAndAttendance.getContactTypeOutcomesUsingGET(
      { contactTypeCode: appointment.contactTypeCode },
    )

    const outcome = availableContactOutcomes?.outcomeTypes?.find(x => x.code === appointment.outcomeCode)
    if (!outcome) {
      throw new BadRequestException(
        `appointment with id '${appointment.id}' has unavailable outcome '${appointment.outcomeCode}'`,
      )
    }

    if (!outcome.enforceable || !outcome.enforcements || outcome.enforcements.length === 0) {
      throw new BadRequestException(
        `appointment with id '${appointment.id}' has unenforceable outcome '${appointment.outcomeCode}'`,
      )
    }

    return outcome.enforcements
  }

  async updateEnforcement(appointmentId: number, enforcement: string): Promise<void> {
    const patchContactRequest: PatchContactRequest = {
      id: appointmentId,
      body: [{ op: 'replace', path: '/enforcement', value: enforcement }],
    }
    await this.deliusApi.contactV1.patchContact(patchContactRequest)
  }
}
