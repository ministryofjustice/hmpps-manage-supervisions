import { Injectable } from '@nestjs/common'
import { CommunityApiService } from '..'
import { CacheService } from '../../common'

export const COMMUNICATION_CATEGORY_CODE = 'LT'

@Injectable()
export class ContactTypesService {
  constructor(private readonly community: CommunityApiService, private readonly cache: CacheService) {}

  async getAppointmentContactTypes(): Promise<string[]> {
    return await this.cache.getOrSet('community:appointment-contact-types', async () => {
      const { data } = await this.community.appointment.getAllAppointmentTypesUsingGET()

      return {
        value: data.map(t => t.contactType),
        options: { durationSeconds: 600 },
      }
    })
  }

  private async getContactTypesInCategory(categoryCode: string): Promise<string[]> {
    return await this.cache.getOrSet(`community:${categoryCode}-contact-types`, async () => {
      const { data } = await this.community.contactAndAttendance.getContactTypesUsingGET({ categories: [categoryCode] })
      return {
        value: data.map(t => t.code),
        options: { durationSeconds: 600 },
      }
    })
  }

  async getCommunicationContactTypes() {
    return this.getContactTypesInCategory(COMMUNICATION_CATEGORY_CODE)
  }

  async isCommunicationContactType(contactTypeCode: string): Promise<boolean> {
    return (await this.getCommunicationContactTypes()).indexOf(contactTypeCode) >= 0
  }
}
