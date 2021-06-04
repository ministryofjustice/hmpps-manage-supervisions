import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Config, WellKnownContactTypeCategory, WellKnownContactTypeConfig } from '../../config'
import { staffName } from '../../util'
import { AppointmentType } from '../../community-api'
import { GetMetaOptions, GetMetaResult } from './types'

function isAppointmentType(value: any): value is AppointmentType {
  return 'contactType' in value
}

@Injectable()
export class ContactMappingService {
  constructor(private readonly config: ConfigService<Config>) {}

  getTypeMeta({ type, staff }: GetMetaOptions): GetMetaResult {
    const { code, appointment } = isAppointmentType(type)
      ? { code: type.contactType.trim().toUpperCase(), appointment: true }
      : { code: type.code.trim().toUpperCase(), appointment: type.appointment || false }

    const category = appointment ? WellKnownContactTypeCategory.Appointment : WellKnownContactTypeCategory.Communication
    const config = this.config.get<WellKnownContactTypeConfig>('contacts')[category]
    const meta = Object.values(config).find(x =>
      'code' in x ? x.code === code : Object.values(x.codes).includes(code),
    )

    function appointmentName(typeName: string) {
      const staffFullName = staffName(staff)
      return staffFullName ? `${typeName} with ${staffFullName}` : typeName
    }

    if (!meta) {
      return {
        type: null,
        value: { appointment },
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
}
