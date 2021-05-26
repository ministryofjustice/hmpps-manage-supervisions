import {
  AppointmentCreateResponse,
  AppointmentType,
  AppointmentTypeOrderTypes,
  AppointmentTypeRequiresLocation,
  OffenderDetail,
  OfficeLocation,
  StaffDetails,
} from './client'
import { merge } from 'lodash'
import * as faker from 'faker'

export function fakeAppointmentType(partial: DeepPartial<AppointmentType> = {}): AppointmentType {
  return merge(
    {
      contactType: faker.datatype.uuid(),
      description: faker.company.bs(),
      orderTypes: [AppointmentTypeOrderTypes.Cja, AppointmentTypeOrderTypes.Cja],
      requiresLocation: faker.random.objectElement(AppointmentTypeRequiresLocation),
    } as AppointmentType,
    partial,
  )
}

export function fakeAppointmentCreateResponse(
  partial: DeepPartial<AppointmentCreateResponse> = {},
): AppointmentCreateResponse {
  return merge(
    {
      appointmentId: faker.datatype.number(),
      appointmentStart: faker.date.future().toISOString(),
      appointmentEnd: faker.date.future().toISOString(),
      typeDescription: faker.lorem.slug(3),
    } as AppointmentCreateResponse,
    partial,
  )
}

export function fakeOffenderDetail(partial: DeepPartial<OffenderDetail> = {}): OffenderDetail {
  return merge(
    {
      activeProbationManagedSentence: true,
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
    } as OffenderDetail,
    partial,
  )
}

export function fakeOfficeLocation(partial: DeepPartial<OfficeLocation> = {}): OfficeLocation {
  return merge(
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
  )
}

export function fakeStaffDetails(partial: DeepPartial<StaffDetails> = {}): StaffDetails {
  return merge(
    {
      username: faker.lorem.slug(10),
      staffIdentifier: faker.datatype.number({ min: 1, max: 999 }),
      staffCode: faker.lorem.slug(10),
      email: faker.internet.email(),
    } as StaffDetails,
    partial,
  )
}
