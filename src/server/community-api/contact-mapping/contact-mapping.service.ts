import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Config, ContactTypeCategory, WellKnownContactTypeConfig } from '../../config'
import { staffName } from '../../util'
import { AppointmentType } from '../client'
import {
  AppointmentMetaResult,
  BreachEndMetaResult,
  BreachStartMetaResult,
  CommunicationMetaResult,
  GetMetaOptions,
  GetMetaResult,
  SystemMetaResult,
  WarningLetterMetaResult,
} from './contact-mapping.types'
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

  async getTypeMeta(options: GetMetaOptions): Promise<GetMetaResult> {
    const { code, appointment } = isAppointmentType(options.type)
      ? { code: options.type.contactType.trim().toUpperCase(), appointment: true }
      : { code: options.type.code.trim().toUpperCase(), appointment: options.type.appointment || false }

    return (
      this.appointment(code, appointment, options) ||
      this.getBreachMeta(code) ||
      this.warningLetter(code, options) ||
      this.getSystemMeta(options) ||
      (await this.communication(code, options)) || {
        type: ContactTypeCategory.Other,
        name: options.type.description,
        value: null,
      }
    )
  }

  getAllBreachContactTypeCodes(): string[] {
    return [
      ...this.config[ContactTypeCategory.BreachStart].map(x => x.code),
      ...this.config[ContactTypeCategory.BreachEnd].map(x => x.code),
    ]
  }

  getBreachMeta(code: string): BreachStartMetaResult | BreachEndMetaResult | null {
    return (
      this.breach(code, ContactTypeCategory.BreachStart) || this.breach(code, ContactTypeCategory.BreachEnd) || null
    )
  }
  private getSystemMeta({ type }: GetMetaOptions): SystemMetaResult | null {
    return !isAppointmentType(type) && type.systemGenerated
      ? {
          type: ContactTypeCategory.System,
          name: type.description,
          value: null,
        }
      : null
  }
  private appointment(
    code: string,
    isAppointment: boolean,
    { type, staff }: GetMetaOptions,
  ): AppointmentMetaResult | null {
    if (!isAppointment) {
      // dont even bother checking our well known stuff if the API says it's not an appointment as some appointment APIs might not work with it
      // TODO maybe we should still check and log an error if the meta is bad?
      return null
    }

    const config = this.config[ContactTypeCategory.Appointment]
    const meta = Object.values(config).find(x => Object.values(x.codes).includes(code))
    const typeName = meta?.name || type.description
    const staffFullName = staffName(staff)
    const name = staffFullName ? `${typeName} with ${staffFullName}` : typeName
    return {
      type: ContactTypeCategory.Appointment,
      name,
      value: meta || null,
    }
  }

  private breach(
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

  private warningLetter(code: string, { type }: GetMetaOptions): WarningLetterMetaResult | null {
    return Object.values(this.config[ContactTypeCategory.WarningLetter]).includes(code)
      ? {
          type: ContactTypeCategory.WarningLetter,
          name: type.description,
          value: {},
        }
      : null
  }

  private async communication(code: string, { type }: GetMetaOptions): Promise<CommunicationMetaResult | null> {
    const isCommunication = await this.contactTypesService.isCommunicationContactType(code)
    if (!isCommunication) {
      return null
    }
    const meta = Object.values(this.config[ContactTypeCategory.Communication]).find(x => x.code === code)
    return {
      type: ContactTypeCategory.Communication,
      name: meta?.name || type.description,
      value: meta || null,
    }
  }
}
