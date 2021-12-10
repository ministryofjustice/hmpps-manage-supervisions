import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { EditSensitivityAppointmentSummary } from './edit-sensitivity.types'
import { CommunityApiService, ContactMappingService } from '../community-api'
import { ContactTypeCategory } from '../config'

@Injectable()
export class EditSensitivityService {
  constructor(private readonly community: CommunityApiService, private readonly contacts: ContactMappingService) {}

  async getAppointmentDetail(crn: string, id: number): Promise<EditSensitivityAppointmentSummary> {
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
      sensitive: appointment.sensitive,
    }
  }
}
