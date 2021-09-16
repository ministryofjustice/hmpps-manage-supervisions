import * as faker from 'faker'
import { AppointmentBuilderDto } from './AppointmentBuilderDto'
import { DateTime } from 'luxon'
import { TIME_FORMAT } from '../../validators'
import { DEFAULT_GROUP } from '../../util/mapping'
import { AppointmentTypeRequiresLocation } from '../../community-api/client'
import { WellKnownAppointmentType } from '../../config'
import { fake, fakeClass } from '../../util/util.fake'
import { FeaturedAppointmentType } from './AppointmentWizardViewModel'
import { fakeAppointmentType } from '../../community-api/community-api.fake'
import { fakeConfig } from '../../config/config.fake'

export const fakeAppointmentBuilderDto = fakeClass(
  AppointmentBuilderDto,
  () => {
    const date = DateTime.fromJSDate(faker.date.future()).set({ hour: 12 })
    return {
      type: faker.random.arrayElement(Object.values(WellKnownAppointmentType)),
      requiresLocation: AppointmentTypeRequiresLocation.Required,
      typeDescription: faker.company.bs(),
      location: faker.datatype.uuid(),
      locationDescription: faker.address.streetAddress(),
      date: { day: date.day, month: date.month, year: date.year } as any,
      startTime: date.toFormat(TIME_FORMAT),
      endTime: date.plus({ hours: 1 }).toFormat(TIME_FORMAT),
      addNotes: true,
      notes: faker.lorem.sentences(3),
      sensitive: faker.datatype.boolean(),
      providerCode: faker.datatype.uuid(),
      teamCode: faker.datatype.uuid(),
      staffCode: faker.datatype.uuid(),
      requirementId: faker.datatype.number(),
      convictionId: faker.datatype.number(),
    }
  },
  { groups: [DEFAULT_GROUP] },
)

export const fakeFeaturedAppointmentType = fake<FeaturedAppointmentType>(() => {
  const type = faker.random.arrayElement(Object.values(WellKnownAppointmentType))
  return {
    type,
    meta: { ...fakeConfig().contacts[type] },
    description: faker.company.bs(),
    appointmentTypes: [fakeAppointmentType(), fakeAppointmentType()],
  }
})
