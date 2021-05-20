import * as faker from 'faker'
import { merge } from 'lodash'
import { AppointmentBuilderDto } from './AppointmentBuilderDto'
import { plainToClass } from 'class-transformer'
import { AppointmentCreateResponse } from './AppointmentCreateResponse'
import { OffenderDetailsResponse } from './OffenderDetailsResponse'
import { AppointmentTypeDto, OrderType, RequiredOptional } from './AppointmentTypeDto'
import { OfficeLocation } from './OfficeLocation'
import { DateTime } from 'luxon'
import { TIME_FORMAT } from '../../validators'
import { DEFAULT_GROUP } from '../../util/mapping'

export function fakeAppointmentBuilderDto(
  partial: DeepPartial<AppointmentBuilderDto> = {},
  groups: string[] = [DEFAULT_GROUP],
): AppointmentBuilderDto {
  const date = DateTime.fromJSDate(faker.date.future(), { locale: 'en-gb' }).set({ hour: 12 })
  return plainToClass(
    AppointmentBuilderDto,
    merge(
      {
        type: faker.datatype.uuid(),
        requiresLocation: RequiredOptional.Required,
        typeDescription: faker.company.bs(),
        location: faker.datatype.uuid(),
        date: { day: date.day, month: date.month, year: date.year },
        startTime: date.toFormat(TIME_FORMAT, { locale: 'en-gb' }),
        endTime: date.plus({ hour: 1 }).toFormat(TIME_FORMAT, { locale: 'en-gb' }),
        sensitive: faker.datatype.boolean(),
      } as FlatDeepPartial<AppointmentBuilderDto>,
      partial,
    ),
    { groups },
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
        appointmentStart: faker.date.future().toISOString(),
        appointmentEnd: faker.date.future().toISOString(),
        typeDescription: faker.lorem.slug(3),
      } as AppointmentCreateResponse,
      partial,
    ),
  )
}

export function fakeOffenderDetailsResponse(
  partial: DeepPartial<OffenderDetailsResponse> = {},
): OffenderDetailsResponse {
  return plainToClass(
    OffenderDetailsResponse,
    merge(
      {
        firstName: faker.name.firstName(),
        surname: faker.name.lastName(),
        contactDetails: {
          phoneNumbers: [
            {
              type: 'MOBILE',
              number: faker.phone.phoneNumber(),
            },
          ],
        },
        offenderManagers: [{ team: { code: faker.datatype.uuid() } }],
      } as OffenderDetailsResponse,
      partial,
    ),
  )
}

export function fakeAppointmentTypeDto(partial: DeepPartial<AppointmentTypeDto> = {}): AppointmentTypeDto {
  return plainToClass(
    AppointmentTypeDto,
    merge(
      {
        requiresLocation: faker.random.arrayElement(Object.values(RequiredOptional)),
        orderTypes: Object.values(OrderType),
        contactType: faker.datatype.uuid(),
        description: faker.company.bs(),
      } as AppointmentTypeDto,
      partial,
    ),
  )
}

export function fakeOfficeLocation(partial: DeepPartial<OfficeLocation> = {}): OfficeLocation {
  return plainToClass(
    OfficeLocation,
    merge(
      {
        code: faker.datatype.uuid(),
        buildingName: faker.name.firstName(),
        buildingNumber: faker.datatype.number({ min: 1, max: 999 }).toString(),
        streetName: faker.address.streetName(),
        townCity: faker.address.city(),
        county: faker.address.county(),
        postcode: faker.address.zipCode(),
        description: faker.address.streetAddress(),
      } as OfficeLocation,
      partial,
    ),
  )
}
