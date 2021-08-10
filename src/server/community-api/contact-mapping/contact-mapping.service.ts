import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Config, ContactTypeCategory, WellKnownContactTypeConfig } from '../../config'
import { staffName } from '../../util'
import { AppointmentType } from '../client'
import { BreachEndMetaResult, BreachStartMetaResult, GetMetaOptions, GetMetaResult } from './types'
import { ContactTypesService } from '../contact-types'

function isAppointmentType(value: any): value is AppointmentType {
  return 'contactType' in value
}

@Injectable()
export class ContactMappingService {
  private readonly config: WellKnownContactTypeConfig
  constructor(config: ConfigService<Config>, private readonly contactTypesService: ContactTypesService) {
    this.config = config.get<WellKnownContactTypeConfig>('contacts')
  }

  async getTypeMeta({ type, staff }: GetMetaOptions): Promise<GetMetaResult> {
    const { code, appointment } = isAppointmentType(type)
      ? { code: type.contactType.trim().toUpperCase(), appointment: true }
      : { code: type.code.trim().toUpperCase(), appointment: type.appointment || false }

    // check for breach stuff first as that's easy
    const breach = this.getBreachMeta(code)
    if (breach !== null) {
      return breach
    }

    const category = appointment ? ContactTypeCategory.Appointment : ContactTypeCategory.Communication
    const config = this.config[category]
    const meta = Object.values(config).find(x =>
      'code' in x ? x.code === code : Object.values(x.codes).includes(code),
    )

    const communication = await this.contactTypesService.isCommunicationContactType(code)

    function appointmentName(typeName: string) {
      const staffFullName = staffName(staff)
      return staffFullName ? `${typeName} with ${staffFullName}` : typeName
    }

    if (!meta) {
      return {
        type: communication ? ContactTypeCategory.Communication : ContactTypeCategory.Other,
        value: { appointment, communication, name: type.description },
        name: appointment ? appointmentName(type.description) : type.description,
      }
    }

    if (appointment) {
      return {
        type: category,
        value: meta,
        name: appointmentName(meta.name),
      }
    }

    return {
      type: category,
      value: meta,
      name: meta.name,
    }
  }

  getBreachMeta(code: string): BreachStartMetaResult | BreachEndMetaResult | null {
    return (
      this.getBreachCategoryMeta(code, ContactTypeCategory.BreachStart) ||
      this.getBreachCategoryMeta(code, ContactTypeCategory.BreachEnd) ||
      null
    )
  }

  getAllBreachContactTypeCodes(): string[] {
    return [
      ...this.config[ContactTypeCategory.BreachStart].map(x => x.code),
      ...this.config[ContactTypeCategory.BreachEnd].map(x => x.code),
    ]
  }

  private getBreachCategoryMeta(
    code: string,
    category: ContactTypeCategory.BreachStart | ContactTypeCategory.BreachEnd,
  ): BreachStartMetaResult | BreachEndMetaResult | null {
    const value = this.config[category].find(x => x.code === code) || null
    return (value && {
      name: value.name,
      type: category,
      value,
    }) as BreachStartMetaResult | BreachEndMetaResult
  }
}
