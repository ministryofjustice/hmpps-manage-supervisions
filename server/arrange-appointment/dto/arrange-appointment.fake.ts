import * as faker from 'faker'
import { merge } from 'lodash'
import { AppointmentCreateRequest } from './AppointmentCreateRequest'
import { AppointmentBuilderDto, AppointmentMetaType } from './AppointmentBuilderDto'
import { plainToClass } from 'class-transformer'
import { AppointmentCreateResponse } from './AppointmentCreateResponse'

function fakeAppointmentMetaType(): DeepPartial<AppointmentMetaType> {
  return {
    code: faker.datatype.uuid(),
    description: faker.company.bs(),
  }
}

export function fakeAppointmentBuilderDto(partial: DeepPartial<AppointmentBuilderDto> = {}): AppointmentBuilderDto {
  return plainToClass(
    AppointmentBuilderDto,
    merge(
      {
        requirementId: faker.datatype.number(),
        contactType: fakeAppointmentMetaType(),
        nsiType: fakeAppointmentMetaType(),
        nsiSubType: fakeAppointmentMetaType(),
        appointmentStart: faker.date.soon().toISOString(),
        appointmentEnd: faker.date.future().toISOString(),
        officeLocationCode: faker.datatype.uuid(),
        notes: faker.lorem.sentence(),
        providerCode: faker.datatype.uuid(),
        teamCode: faker.datatype.uuid(),
        staffCode: faker.datatype.uuid(),
        sentenceId: faker.datatype.number(),
      } as FlatDeepPartial<AppointmentBuilderDto>,
      partial,
    ),
  )
}

export function fakeAppointmentCreateRequest(
  partial: DeepPartial<AppointmentCreateRequest> = {},
): AppointmentCreateRequest {
  return plainToClass(
    AppointmentCreateRequest,
    merge(
      {
        requirementId: faker.datatype.number(),
        contactType: faker.datatype.uuid(),
        appointmentStart: faker.date.soon().toISOString(),
        appointmentEnd: faker.date.future().toISOString(),
        officeLocationCode: faker.datatype.uuid(),
        notes: faker.lorem.sentence(),
        providerCode: faker.datatype.uuid(),
        teamCode: faker.datatype.uuid(),
        staffCode: faker.datatype.uuid(),
      } as AppointmentCreateRequest,
      partial,
    ),
  )
}

export function fakeAppointmentCreateResponse(
  partial: DeepPartial<AppointmentCreateResponse> = {},
): AppointmentCreateResponse {
  return plainToClass(
    AppointmentCreateResponse,
    merge(
      {
        appointmentId: faker.datatype.number(),
      } as AppointmentCreateResponse,
      partial,
    ),
  )
}
